'use client';

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

import { D3Candle } from '@/features/upbit-chart/ui/d3-candle';

import type { BaseCellProps } from './types';

export interface NameCellRenderProps {
  koreanName: string;
  englishName: string;
  base: string;
  quote: string;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
}

export interface NameCellProps extends BaseCellProps {
  /** 캔들 차트 표시 여부 */
  showCandle?: boolean;
  render?: (props: NameCellRenderProps) => ReactNode;
}

/**
 * 이름 셀
 * - CSS Grid 셀로 렌더링 (너비는 부모 Row의 Grid에서 결정)
 */
export function NameCell({ row, state, sx, showCandle = true, render }: NameCellProps) {
  const { base, quote } = state.marketCode;

  const renderProps: NameCellRenderProps = {
    koreanName: row.korean_name,
    englishName: row.english_name,
    base,
    quote,
    openPrice: row.opening_price,
    closePrice: row.trade_price,
    highPrice: row.high_price,
    lowPrice: row.low_price,
  };

  const cellSx = {
    padding: '6px 4px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    minWidth: 0, // Grid 셀 overflow 방지
    ...sx,
  };

  if (render) {
    return <Box sx={cellSx}>{render(renderProps)}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        {showCandle && (
          <Box
            sx={{
              flexShrink: 0,
              backgroundColor: '#f5f5f5',
              padding: '2px',
              borderRadius: '4px',
            }}
          >
            <svg width={16} height={20} style={{ display: 'block' }}>
              <D3Candle
                open={row.opening_price}
                close={row.trade_price}
                high={row.high_price}
                low={row.low_price}
                x={8}
                width={5}
                height={20}
                minPrice={row.low_price}
                maxPrice={row.high_price}
              />
            </svg>
          </Box>
        )}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.75rem', wordBreak: 'break-word' }}>
            {row.korean_name}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }}>
            {base}/{quote}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
