'use client';

import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface CellProps {
  /** 정렬 */
  align?: 'left' | 'right' | 'center';
  /** 자식 요소 */
  children?: ReactNode;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
}

/**
 * 범용 Cell 컴포넌트
 * - CSS Grid 셀로 렌더링 (너비는 부모 Row의 Grid에서 결정)
 * - 커스텀 컬럼 추가 시 사용
 */
export function Cell({ align = 'left', children, sx }: CellProps) {
  return (
    <Box
      sx={{
        padding: '6px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        minWidth: 0, // Grid 셀 overflow 방지
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
