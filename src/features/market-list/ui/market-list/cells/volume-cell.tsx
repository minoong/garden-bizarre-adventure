'use client';

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

import { formatTradePrice } from '@/entities/upbit';

import type { BaseCellProps } from './types';

export interface VolumeCellRenderProps {
  volume: number;
  formattedVolume: string;
  tradePrice24h: number;
  formattedTradePrice: string;
}

export interface VolumeCellProps extends BaseCellProps {
  render?: (props: VolumeCellRenderProps) => ReactNode;
}

/**
 * 거래대금 셀
 * - CSS Grid 셀로 렌더링 (너비는 부모 Row의 Grid에서 결정)
 */
export function VolumeCell({ row, state: _state, sx, render }: VolumeCellProps) {
  const formattedTradePrice = formatTradePrice(row.acc_trade_price_24h);

  const renderProps: VolumeCellRenderProps = {
    volume: row.acc_trade_volume_24h,
    formattedVolume: row.acc_trade_volume_24h.toLocaleString('ko-KR'),
    tradePrice24h: row.acc_trade_price_24h,
    formattedTradePrice,
  };

  const cellSx = {
    padding: '6px 4px',
    display: 'flex',
    gap: 0.3,
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    minWidth: 0, // Grid 셀 overflow 방지
    ...sx,
  };

  if (render) {
    return <Box sx={cellSx}>{render(renderProps)}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#333' }}>
        {formattedTradePrice}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }}>
        백만
      </Typography>
    </Box>
  );
}
