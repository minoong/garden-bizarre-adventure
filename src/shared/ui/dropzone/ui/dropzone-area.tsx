'use client';

import { motion } from 'motion/react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useDropzoneContext } from './dropzone-root';

interface DropzoneAreaProps {
  minHeight?: string | number;
}

export function DropzoneArea({ minHeight = 200 }: DropzoneAreaProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzoneContext();

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Box
        {...getRootProps()}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragReject ? 'error.main' : isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />

        <motion.div initial={{ scale: 1 }} animate={{ scale: isDragActive ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <CloudUploadIcon
            sx={{
              fontSize: 60,
              color: isDragReject ? 'error.main' : isDragActive ? 'primary.main' : 'grey.400',
              mb: 2,
            }}
          />
        </motion.div>

        <Typography variant="h6" gutterBottom>
          {isDragActive ? '여기에 드롭하세요' : '파일을 드래그하거나 클릭하세요'}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          이미지 또는 비디오 파일 (최대 10MB)
        </Typography>
      </Box>
    </motion.div>
  );
}
