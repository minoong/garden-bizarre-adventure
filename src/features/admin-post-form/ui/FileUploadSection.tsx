'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

import { Dropzone, useDropzone, type FileWithMetadata } from '@/shared/ui/dropzone';
import { uploadFiles, type FileUploadProgress } from '@/shared/lib/firbase';
import { blobToFile } from '@/shared/lib/utils/file-converter';

import type { UploadedFileInfo } from '../model/types';

interface FileUploadSectionProps {
  files: UploadedFileInfo[];
  onFilesChange: (files: UploadedFileInfo[]) => void;
  onDropzoneFilesChange?: (files: FileWithMetadata[]) => void;
}

export function FileUploadSection({ files, onFilesChange, onDropzoneFilesChange }: FileUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);

  // 콜백을 ref로 저장하여 의존성 문제 해결
  const onDropzoneFilesChangeRef = useRef(onDropzoneFilesChange);
  useEffect(() => {
    onDropzoneFilesChangeRef.current = onDropzoneFilesChange;
  }, [onDropzoneFilesChange]);

  // Dropzone 훅
  const dropzoneState = useDropzone({
    maxFiles: 20,
    multiple: true,
  });
  const { files: dropzoneFiles, clearFiles } = dropzoneState;

  const handleUpload = async () => {
    if (dropzoneFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      // 압축된 이미지 파일 추출 (optimized Blob을 File로 변환)
      const filesToUpload = await Promise.all(
        dropzoneFiles.map(async (f) => {
          if (f.optimized) {
            // Blob을 File로 변환
            return await blobToFile(f.optimized, f.file.name, f.file.type);
          }
          return f.file;
        }),
      );

      console.log(dropzoneFiles, filesToUpload);

      // Firebase Storage에 업로드
      const results = await uploadFiles(filesToUpload, {
        path: 'playground/',
        onProgress: (progress) => {
          setUploadProgress([...progress]);
        },
      });

      // 업로드 결과를 UploadedFileInfo로 변환
      const uploadedFiles: UploadedFileInfo[] = results.map((result, index) => {
        const processedFile = dropzoneFiles[index];
        return {
          id: processedFile.id,
          file: processedFile,
          firebaseUrl: result.downloadURL,
          uploadStatus: result.status as 'success' | 'error',
          error: result.error?.message,
        };
      });

      // 기존 파일 목록에 추가
      onFilesChange([...files, ...uploadedFiles]);

      // Dropzone 초기화
      clearFiles();
      setUploadProgress([]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    clearFiles();
    setUploadProgress([]);
  };

  // dropzoneFiles 변경 시 상위로 전달
  useEffect(() => {
    if (onDropzoneFilesChangeRef.current) {
      onDropzoneFilesChangeRef.current(dropzoneFiles);
    }
  }, [dropzoneFiles]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          파일 업로드
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Dropzone {...dropzoneState}>
            <Dropzone.Area />
            <Dropzone.Preview />
          </Dropzone>
        </Box>

        {dropzoneFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              선택된 파일: {dropzoneFiles.length}개
            </Typography>

            {uploadProgress.length > 0 && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {uploadProgress.map((progress, index) => (
                  <Box key={index}>
                    <Typography variant="caption" color="text.secondary">
                      {progress.file.name} - {progress.status}
                    </Typography>
                    {progress.status === 'uploading' && <LinearProgress variant="determinate" value={progress.progress} />}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUpload} disabled={isUploading || dropzoneFiles.length === 0} fullWidth>
            {isUploading ? '업로드 중...' : 'Firebase에 업로드'}
          </Button>
          <Button variant="outlined" color="secondary" startIcon={<DeleteIcon />} onClick={handleReset} disabled={isUploading} fullWidth>
            초기화
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
