'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';

import { createObjectURL, revokeObjectURL } from '@/shared/lib/utils/file-converter';

interface FilePreviewProps {
  file: File;
  width?: number;
  height?: number;
}

export function FilePreview({ file, width = 120, height = 120 }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);

    return () => {
      if (url) {
        revokeObjectURL(url);
      }
    };
  }, [file]);

  if (!previewUrl) {
    return (
      <Box
        sx={{
          width,
          height,
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
    );
  }

  const isVideo = file.type.startsWith('video/');

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {isVideo ? (
        <video
          src={previewUrl}
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Image src={previewUrl} alt="preview" fill style={{ objectFit: 'cover' }} unoptimized />
      )}
    </Box>
  );
}
