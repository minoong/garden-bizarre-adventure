import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useRef } from 'react';
import { Button, Box, Stack, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import type { FileWithMetadata } from '@/shared/ui/dropzone';
import { processFiles } from '@/shared/ui/dropzone/lib/image-processor';

import { LocationSettingModalLayout } from './layout';

const meta: Meta<typeof LocationSettingModalLayout> = {
  title: 'Features/LocationSettingModal',
  component: LocationSettingModalLayout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LocationSettingModalLayout>;

function LocationSettingModalExample() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setIsProcessing(true);

    try {
      const fileArray = Array.from(selectedFiles);
      const processedFiles = await processFiles(fileArray);
      setFiles(processedFiles);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpen = () => {
    if (files.length === 0) {
      alert('먼저 파일을 업로드해주세요.');
      return;
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleApply = (updatedFiles: FileWithMetadata[]) => {
    console.log('Updated files:', updatedFiles);
    setFiles(updatedFiles);
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3, minWidth: 400 }}>
      <Stack spacing={2}>
        <Typography variant="h6">위치 설정 모달</Typography>

        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
          이미지 파일 선택
          <input ref={fileInputRef} type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
        </Button>

        {files.length > 0 && !isProcessing && (
          <Typography variant="body2" color="text.secondary">
            {files.length}개의 파일이 선택되었습니다.
          </Typography>
        )}

        <Button variant="contained" onClick={handleOpen} loading={isProcessing} loadingPosition="start" disabled={files.length === 0 || isProcessing} fullWidth>
          {isProcessing ? '이미지 처리 중...' : '위치 설정 모달 열기'}
        </Button>
      </Stack>

      <LocationSettingModalLayout open={open} onClose={handleClose} dropzoneFiles={files} onApply={handleApply} />
    </Box>
  );
}

export const Default: Story = {
  render: () => <LocationSettingModalExample />,
};
