import { memo, useMemo, type ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

import { useRealtimeTicker, parseMarketCode } from '@/entities/bithumb';
import { D3Candle } from '@/features/trading-chart/ui/d3-candle';

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
 * - 실시간 데이터를 직접 구독하여 캔들 차트 업데이트 성능 최적화
 */
export const NameCell = memo(function NameCell({ row, sx, showCandle = true, render }: NameCellProps) {
  const theme = useTheme();
  const realtimeTicker = useRealtimeTicker(row.market);
  const { base, quote } = useMemo(() => parseMarketCode(row.market), [row.market]);

  // 실시간 또는 초기 데이터 사용
  const openPrice = realtimeTicker?.opening_price ?? row.opening_price;
  const candleClosePrice = realtimeTicker?.trade_price ?? row.trade_price;
  const highPrice = realtimeTicker?.high_price ?? row.high_price;
  const lowPrice = realtimeTicker?.low_price ?? row.low_price;

  const trading = theme.palette.trading;

  const renderProps = useMemo<NameCellRenderProps>(
    () => ({
      koreanName: row.korean_name,
      englishName: row.english_name,
      base,
      quote,
      openPrice,
      closePrice: candleClosePrice,
      highPrice,
      lowPrice,
    }),
    [row.korean_name, row.english_name, base, quote, openPrice, candleClosePrice, highPrice, lowPrice],
  );

  const cellSx = useMemo(
    () => ({
      padding: '6px 4px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        {showCandle && (
          <Box
            sx={{
              flexShrink: 0,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              padding: '2px',
              borderRadius: '4px',
            }}
          >
            <svg width={16} height={20} style={{ display: 'block' }}>
              <D3Candle
                open={openPrice}
                close={candleClosePrice}
                high={highPrice}
                low={lowPrice}
                x={8}
                width={5}
                height={20}
                minPrice={lowPrice}
                maxPrice={highPrice}
                upColor={trading.rise.main}
                downColor={trading.fall.main}
              />
            </svg>
          </Box>
        )}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', wordBreak: 'break-word' }}>
            {row.korean_name}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem', color: theme.palette.text.secondary }}>
            {base}/{quote}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
