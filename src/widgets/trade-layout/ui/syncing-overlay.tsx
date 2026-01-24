'use client';

import { memo } from 'react';
import { Box, useTheme } from '@mui/material';

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

/**
 * 실시간 데이터 동기화 중임을 알리는 프리미엄 블러 오버레이
 */
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
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 0.8,
          borderRadius: 10,
          bgcolor: 'rgba(0,0,0,0.7)',
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
