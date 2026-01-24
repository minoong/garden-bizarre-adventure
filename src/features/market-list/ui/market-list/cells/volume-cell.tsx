import { memo, useMemo, type ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

import { formatTradePrice, useRealtimeTicker } from '@/entities/bithumb';

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
 * - 실시간 데이터를 직접 구독하여 성능 최적화
 */
export const VolumeCell = memo(function VolumeCell({ row, sx, render }: VolumeCellProps) {
  const theme = useTheme();
  const realtimeTicker = useRealtimeTicker(row.market);

  const accTradePrice = realtimeTicker?.acc_trade_price_24h ?? row.acc_trade_price_24h;
  const accTradeVolume = realtimeTicker?.acc_trade_volume_24h ?? row.acc_trade_volume_24h;

  const formattedTradePrice = useMemo(() => formatTradePrice(accTradePrice), [accTradePrice]);

  const renderProps = useMemo<VolumeCellRenderProps>(
    () => ({
      volume: accTradeVolume,
      formattedVolume: accTradeVolume.toLocaleString('ko-KR'),
      tradePrice24h: accTradePrice,
      formattedTradePrice,
    }),
    [accTradeVolume, accTradePrice, formattedTradePrice],
  );

  const cellSx = useMemo(
    () => ({
      padding: '6px 4px',
      display: 'flex',
      gap: 0.3,
      alignItems: 'baseline',
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
      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: theme.palette.text.primary }}>
        {formattedTradePrice}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem', color: theme.palette.text.secondary }}>
        백만
      </Typography>
    </Box>
  );
});
