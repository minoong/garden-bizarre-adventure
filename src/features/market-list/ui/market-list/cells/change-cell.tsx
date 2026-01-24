import { memo, useMemo, type ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

import { useRealtimeTicker, calculatePriceChange } from '@/entities/bithumb';

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
 * - 실시간 데이터를 직접 구독하여 성능 최적화
 */
export const ChangeCell = memo(function ChangeCell({ row, sx, render }: ChangeCellProps) {
  const theme = useTheme();
  const realtimeTicker = useRealtimeTicker(row.market);

  const price = realtimeTicker?.trade_price ?? row.trade_price;
  const prevClosingPrice = realtimeTicker?.prev_closing_price ?? row.prev_closing_price;
  const change = realtimeTicker?.change ?? row.change;

  const trading = theme.palette.trading;

  const priceChange = useMemo(() => calculatePriceChange(prevClosingPrice, price, trading.rise.main, trading.fall.main), [prevClosingPrice, price, trading]);

  const renderProps = useMemo<ChangeCellRenderProps>(
    () => ({
      changeRate: priceChange.changeRate,
      changeAmount: priceChange.changeAmount,
      formattedRate: priceChange.formattedRate,
      formattedAmount: priceChange.formattedPriceChange,
      color: priceChange.changeColor,
      change: change,
    }),
    [priceChange, change],
  );

  const cellSx = useMemo(
    () => ({
      padding: '6px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 0,
      ...sx,
    }),
    [sx],
  );

  if (render) {
    return <Box sx={cellSx}>{render(renderProps)}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: priceChange.changeColor }}>
          {priceChange.formattedRate}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: priceChange.changeColor }}>
          {priceChange.formattedPriceChange}
        </Typography>
      </Box>
    </Box>
  );
});
