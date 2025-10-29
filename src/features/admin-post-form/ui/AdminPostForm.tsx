'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { Save as SaveIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';

import type { FileWithMetadata } from '@/shared/ui/dropzone';

import { adminPostFormSchema, type AdminPostFormValues } from '../model/schema';
import type { UploadedFileInfo } from '../model/types';

import { FileUploadSection } from './FileUploadSection';
import { FileListSection } from './FileListSection';
import { LocationSection } from './LocationSection';
import { DateRangeSection } from './DateRangeSection';
import { PostFieldsSection } from './PostFieldsSection';
import { KakaoMapSection } from './KakaoMapSection';
import { LocationEditModal } from './LocationEditModal';

export function AdminPostForm() {
  // 파일 상태 관리
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [dropzoneFiles, setDropzoneFiles] = useState<FileWithMetadata[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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
      theme: '',
      isPublic: true,
      locationName: '',
      latitude: undefined,
      longitude: undefined,
      dateFrom: new Date(),
      dateTo: new Date(),
      tags: [],
    },
  });

  // 파일 메타데이터 기반으로 날짜 범위 자동 설정
  useEffect(() => {
    if (files.length === 0) return;

    const dates = files.map((f) => f.file.metadata?.dateTaken).filter((date): date is Date => date !== undefined);

    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      setValue('dateFrom', minDate);
      setValue('dateTo', maxDate);
    }
  }, [files, setValue]);

  // 파일 제거
  const handleFileRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
  };

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

  // 선택된 파일에 위치 정보 적용
  const handleApplyLocationToSelected = () => {
    const formValues = watch();
    const { locationName, latitude, longitude } = formValues;

    console.log('선택된 파일들에 위치 정보 적용:', {
      selectedFileIds,
      locationName,
      latitude,
      longitude,
    });

    // TODO: 선택된 파일의 메타데이터에 위치 정보 저장
    // 실제 구현 시 files 상태를 업데이트하거나
    // 별도의 위치 정보 매핑 상태를 관리할 수 있음
  };

  // 폼 제출
  const onSubmit = async (data: AdminPostFormValues) => {
    try {
      console.log('폼 데이터:', data);
      console.log('업로드된 파일:', files);

      // TODO: Supabase에 저장
      // 1. posts 테이블에 INSERT
      // 2. post_images 테이블에 파일 정보 INSERT
      // 3. tags 테이블과 post_tags 연결

      alert('게시물이 저장되었습니다! (실제 저장은 아직 구현되지 않았습니다)');
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  console.log({ files });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        게시물 작성
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* 파일 업로드 섹션 */}
          <FileUploadSection files={files} onFilesChange={setFiles} onDropzoneFilesChange={setDropzoneFiles} />

          {/* 업로드된 파일 목록 */}
          <FileListSection files={files} selectedFileIds={selectedFileIds} onSelectedFilesChange={setSelectedFileIds} onFileRemove={handleFileRemove} />

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
          <LocationSection control={control} errors={errors} selectedCount={selectedFileIds.length} onApplyToSelected={handleApplyLocationToSelected} />

          {/* 날짜 범위 */}
          <DateRangeSection control={control} errors={errors} />

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
            <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={isSubmitting || files.length === 0}>
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
