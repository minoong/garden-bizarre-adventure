'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { Save as SaveIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

import type { FileWithMetadata } from '@/shared/ui/dropzone';
import { DateRangePicker } from '@/shared/ui/date-range-picker';

import { adminPostFormSchema, type AdminPostFormValues } from '../model/schema';

import { FileUploadSection } from './FileUploadSection';
import { LocationSection } from './LocationSection';
import { PostFieldsSection } from './PostFieldsSection';
import { KakaoMapSection } from './KakaoMapSection';
import { LocationEditModal } from './LocationEditModal';

export function AdminPostForm() {
  // 파일 상태 관리
  const [dropzoneFiles, setDropzoneFiles] = useState<FileWithMetadata[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // React Hook Form 설정
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminPostFormValues>({
    resolver: zodResolver(adminPostFormSchema),
    defaultValues: {
      title: '',
      content: '',
      theme: [],
      isPublic: true,
      locationName: '',
      latitude: undefined,
      longitude: undefined,
      dateFrom: new Date(),
      dateTo: new Date(),
      tags: [],
    },
  });

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { supabase } = await import('@/shared/lib/supabase/client');
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // 파일 메타데이터 기반으로 날짜 범위 자동 설정
  useEffect(() => {
    if (dropzoneFiles.length === 0) return;

    const dates = dropzoneFiles.map((f) => f.metadata?.dateTaken).filter((date): date is Date => date !== undefined);

    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      setValue('dateFrom', minDate);
      setValue('dateTo', maxDate);
    }
  }, [dropzoneFiles, setValue]);

  // 위치 설정 모달 열기
  const handleOpenLocationModal = () => {
    if (dropzoneFiles.length === 0) {
      alert('업로드된 파일이 없습니다.');
      return;
    }
    setIsLocationModalOpen(true);
  };

  // 위치 설정 적용
  const handleApplyLocation = (updatedFiles: FileWithMetadata[]) => {
    setDropzoneFiles(updatedFiles);
  };

  // 폼 제출
  const onSubmit = async (data: AdminPostFormValues) => {
    try {
      // 1. Firebase에 이미지 업로드 (dropzoneFiles가 있는 경우)
      let uploadedImages: Array<{
        firebaseUrl: string;
        latitude?: number;
        longitude?: number;
        width?: number;
        height?: number;
        fileSize?: number;
        mimeType?: string;
        takenAt?: Date;
      }> = [];

      if (dropzoneFiles.length > 0) {
        // Blob을 File로 변환
        const filesToUpload = await Promise.all(
          dropzoneFiles.map(async (f) => {
            if (f.optimized) {
              const { blobToFile } = await import('@/shared/lib/utils/file-converter');
              return await blobToFile(f.optimized, f.file.name, f.file.type);
            }
            return f.file;
          }),
        );

        // Firebase Storage에 업로드
        const { uploadFiles } = await import('@/shared/lib/firbase');
        const results = await uploadFiles(filesToUpload, {
          path: 'playground/',
        });

        // 업로드 성공한 파일만 필터링하고 위치 및 촬영 날짜 정보 포함
        uploadedImages = results
          .map((result, index) => {
            if (result.status === 'success' && result.downloadURL) {
              const dropzoneFile = dropzoneFiles[index];
              return {
                firebaseUrl: result.downloadURL,
                latitude: dropzoneFile.metadata?.latitude,
                longitude: dropzoneFile.metadata?.longitude,
                width: dropzoneFile.metadata?.width,
                height: dropzoneFile.metadata?.height,
                fileSize: dropzoneFile.file.size,
                mimeType: dropzoneFile.file.type,
                takenAt: dropzoneFile.metadata?.dateTaken,
              };
            }
            return null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
      }

      // 2. Supabase에 저장
      const { createPost, createPostImages, getOrCreateCategory, linkPostCategories, getOrCreateTag, linkPostTags } = await import('@/entities/post');

      // 2-1. posts 테이블에 INSERT
      const post = await createPost({
        title: data.title,
        content: data.content,
        locationName: data.locationName,
        latitude: data.latitude,
        longitude: data.longitude,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        isPublic: data.isPublic ?? true,
      });

      // 2-2. post_images 테이블에 이미지 정보 INSERT (latitude, longitude, takenAt 포함)
      if (uploadedImages.length > 0) {
        await createPostImages(
          post.id,
          uploadedImages.map((img, index) => ({
            imageUrl: img.firebaseUrl,
            width: img.width,
            height: img.height,
            fileSize: img.fileSize,
            mimeType: img.mimeType,
            latitude: img.latitude,
            longitude: img.longitude,
            takenAt: img.takenAt,
            displayOrder: index,
          })),
        );
      }

      // 2-3. categories 테이블과 post_categories 연결
      if (data.theme && data.theme.length > 0) {
        const categoryIds = await Promise.all(data.theme.map((themeName) => getOrCreateCategory(themeName)));
        await linkPostCategories(post.id, categoryIds);
      }

      // 2-4. tags 테이블과 post_tags 연결
      if (data.tags && data.tags.length > 0) {
        const tagIds = await Promise.all(data.tags.map((tagName) => getOrCreateTag(tagName)));
        await linkPostTags(post.id, tagIds);
      }

      alert(
        `게시물이 저장되었습니다!\n- 게시물 ID: ${post.id}\n- 이미지: ${uploadedImages.length}개\n- 카테고리: ${data.theme?.length || 0}개\n- 태그: ${data.tags?.length || 0}개`,
      );
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다: ' + (error as Error).message);
    }
  };

  // 인증 확인 중
  if (isCheckingAuth) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          게시물 작성
        </Typography>
        <Alert severity="info">인증 상태를 확인하는 중...</Alert>
      </Container>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          게시물 작성
        </Typography>
        <Alert severity="warning">로그인이 필요합니다. 게시물을 작성하려면 먼저 로그인해주세요.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        게시물 작성
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* 파일 업로드 섹션 */}
          <FileUploadSection onDropzoneFilesChange={setDropzoneFiles} />

          {/* 카카오 맵 - 촬영 위치 표시 */}
          <KakaoMapSection dropzoneFiles={dropzoneFiles} />

          {/* 위치 설정 버튼 */}
          {dropzoneFiles.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" size="large" startIcon={<LocationOnIcon />} onClick={handleOpenLocationModal}>
                위치 설정
              </Button>
            </Box>
          )}

          {/* 위치 정보 */}
          <LocationSection control={control} errors={errors} />

          {/* 날짜 범위 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                날짜 범위
              </Typography>
              <DateRangePicker
                value={{
                  from: watch('dateFrom') ? dayjs(watch('dateFrom')) : null,
                  to: watch('dateTo') ? dayjs(watch('dateTo')) : null,
                }}
                onChange={(range) => {
                  if (range.from) setValue('dateFrom', range.from.toDate());
                  if (range.to) setValue('dateTo', range.to.toDate());
                }}
                fromLabel="시작일"
                toLabel="종료일"
                error={errors.dateFrom?.message || errors.dateTo?.message}
                fullWidth
              />
            </CardContent>
          </Card>

          {/* 게시물 정보 */}
          <PostFieldsSection control={control} errors={errors} />

          {/* 에러 표시 */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                입력 오류가 있습니다:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>
                    {key}: {error?.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* 제출 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="button" variant="outlined" size="large" disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '게시물 저장'}
            </Button>
          </Box>
        </Stack>
      </form>

      {/* 위치 설정 모달 */}
      {isLocationModalOpen && (
        <LocationEditModal
          open={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          dropzoneFiles={dropzoneFiles}
          onApply={handleApplyLocation}
        />
      )}
    </Container>
  );
}
