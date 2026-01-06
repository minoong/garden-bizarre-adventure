'use client';

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

import type { BaseCellProps } from './types';

export interface ChangeCellRenderProps {
  changeRate: number;
  changeAmount: number;
  formattedRate: string;
  formattedAmount: string;
  color: string;
  change: 'RISE' | 'EVEN' | 'FALL';
}

export interface ChangeCellProps extends BaseCellProps {
  render?: (props: ChangeCellRenderProps) => ReactNode;
}

/**
 * 변동률 셀
 * - CSS Grid 셀로 렌더링 (너비는 부모 Row의 Grid에서 결정)
 */
export function ChangeCell({ row, state, sx, render }: ChangeCellProps) {
  const { priceChange } = state;

  const renderProps: ChangeCellRenderProps = {
    changeRate: priceChange.changeRate,
    changeAmount: priceChange.changeAmount,
    formattedRate: priceChange.formattedRate,
    formattedAmount: priceChange.formattedPriceChange,
    color: priceChange.changeColor,
    change: row.change,
  };

  const cellSx = {
    padding: '6px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0, // Grid 셀 overflow 방지
    ...sx,
  };

  if (render) {
    return <Box sx={cellSx}>{render(renderProps)}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.75rem', color: priceChange.changeColor }}>
          {priceChange.formattedRate}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: priceChange.changeColor }}>
          {priceChange.formattedPriceChange}
        </Typography>
      </Box>
    </Box>
  );
}
