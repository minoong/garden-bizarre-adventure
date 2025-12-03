'use client';

import { useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

import { Dropzone, useDropzone, type FileWithMetadata } from '@/shared/ui/dropzone';

interface FileUploadSectionProps {
  onDropzoneFilesChange?: (files: FileWithMetadata[]) => void;
}

export function FileUploadSection({ onDropzoneFilesChange }: FileUploadSectionProps) {
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

  const handleReset = () => {
    clearFiles();
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
            <Typography variant="caption" color="text.secondary">
              제출 버튼을 누르면 Firebase에 자동으로 업로드됩니다.
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="secondary" startIcon={<DeleteIcon />} onClick={handleReset} fullWidth disabled={dropzoneFiles.length === 0}>
            초기화
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
