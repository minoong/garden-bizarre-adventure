'use client';

import { memo } from 'react';
import { Box, useTheme, alpha } from '@mui/material';

interface SyncingOverlayProps {
  /** 표시할 메시지 */
  message?: string;
  /** 블러 강도 (픽셀) */
  blur?: number;
  /** 상단 여백 (예: 헤더 제외할 때) */
  top?: number | string;
  /** Z-index */
  zIndex?: number;
}

export const SyncingOverlay = memo(function SyncingOverlay({ message = 'SYNCING DATA', blur = 6, top = 0, zIndex = 30 }: SyncingOverlayProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#fff', 0.3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 0.8,
          borderRadius: 10,
          bgcolor: alpha('#000', 0.7),
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: '#4caf50',
            boxShadow: '0 0 8px #4caf50',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.4 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.4 },
            },
          }}
        />
        {message}
      </Box>
    </Box>
  );
});
