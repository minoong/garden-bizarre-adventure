'use client';

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

import { formatPrice } from '@/entities/upbit';

import type { BaseCellProps } from './types';

export interface PriceCellRenderProps {
  price: number;
  formattedPrice: string;
  color: string;
}

export interface PriceCellProps extends BaseCellProps {
  highlightBgColor?: string;
  render?: (props: PriceCellRenderProps) => ReactNode;
}

/**
 * 가격 셀
 * - CSS Grid 셀로 렌더링 (너비는 부모 Row의 Grid에서 결정)
 */
export function PriceCell({ row, state, sx, highlightBgColor = 'transparent', render }: PriceCellProps) {
  const { priceChange } = state;
  const formattedPrice = formatPrice(row.trade_price);

  const cellSx = {
    padding: '6px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    bgcolor: highlightBgColor,
    transition: 'background-color 0.3s ease',
    minWidth: 0, // Grid 셀 overflow 방지
    ...sx,
  };

  if (render) {
    return <Box sx={cellSx}>{render({ price: row.trade_price, formattedPrice, color: priceChange.changeColor })}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.75rem', color: priceChange.changeColor }}>
        {formattedPrice}
      </Typography>
    </Box>
  );
}
