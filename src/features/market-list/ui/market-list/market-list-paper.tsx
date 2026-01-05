'use client';

import type { ReactNode } from 'react';
import { Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface MarketListPaperProps {
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * MarketList Paper 래퍼
 * - Header와 Body를 감싸는 스타일 컨테이너
 */
export function MarketListPaper({ children, sx }: MarketListPaperProps) {
  return (
    <Paper
      sx={{
        border: '1px solid #e0e0e0',
        boxShadow: 'none',
        width: 'fit-content',
        '& .os-scrollbar-handle': {
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
          },
        },
        '& .os-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
