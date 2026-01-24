'use client';

import { memo } from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';

interface OrderbookSkeletonProps {
  /** 행 높이 (기본값: 30) */
  rowHeight?: number;
}

/**
 * 오더북 로딩 스켈레톤 UI
 * - 실제 오더북의 3컬럼 레이아웃(매도잔량 | 가격 | 매수잔량)을 모사
 * - 하단으로 갈수록 자연스럽게 페이드 효과 적용
 */
export const OrderbookSkeleton = memo(function OrderbookSkeleton({ rowHeight = 30 }: OrderbookSkeletonProps) {
  const theme = useTheme();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
      {/* Skeleton Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr 1fr',
          px: 1,
          py: 0.8,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        }}
      >
        <Box sx={{ pr: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
        <Box sx={{ pl: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
      </Box>

      {/* Skeleton Body */}
      <Box sx={{ flex: 1, p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5, overflow: 'hidden' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr 1fr',
              height: rowHeight,
              alignItems: 'center',
              px: 1,
              opacity: 1 - i / 30, // Subtle fade effect
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
              <Skeleton variant="rectangular" height={18} width="70%" sx={{ borderRadius: 0.5, opacity: 0.3 }} />
            </Box>
            <Skeleton variant="text" height={20} sx={{ width: '80%', justifySelf: 'center' }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
              <Skeleton variant="rectangular" height={18} width="70%" sx={{ borderRadius: 0.5, opacity: 0.3 }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Skeleton Footer */}
      <Box
        sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}
      >
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
});
