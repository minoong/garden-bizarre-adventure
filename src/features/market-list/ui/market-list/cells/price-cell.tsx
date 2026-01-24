import { memo, useMemo, useState, useEffect, useRef, type ReactNode } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

import { formatPrice, useRealtimeTicker, calculatePriceChange } from '@/entities/bithumb';

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
 * - 실시간 데이터를 직접 구독하여 리스트 전체 리렌더링 방지
 * - 자체 하이라이트 로직 포함
 */
export const PriceCell = memo(function PriceCell({ row, sx, render }: PriceCellProps) {
  const theme = useTheme();
  const realtimeTicker = useRealtimeTicker(row.market);

  // 초기값은 props(REST 데이터) 사용, 이후 실시간 데이터 사용
  const price = realtimeTicker?.trade_price ?? row.trade_price;
  const prevClosingPrice = realtimeTicker?.prev_closing_price ?? row.prev_closing_price;

  const formattedPrice = useMemo(() => formatPrice(price), [price]);

  // 실시간 가격 변화에 따른 하이라이트 상태
  const [highlight, setHighlight] = useState({ isHighlighted: false, isRise: false });
  const prevPriceRef = useRef(price);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (prevPriceRef.current !== price && price > 0) {
      const isRise = price > prevPriceRef.current;

      const updateHighlight = (now: number) => {
        if (startTimeRef.current === 0) {
          startTimeRef.current = now;
          setHighlight({ isHighlighted: true, isRise });
        }

        if (now - startTimeRef.current >= 300) {
          setHighlight({ isHighlighted: false, isRise: false });
          rafRef.current = null;
          startTimeRef.current = 0;
        } else {
          rafRef.current = requestAnimationFrame(updateHighlight);
        }
      };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(updateHighlight);
    }
    prevPriceRef.current = price;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [price]);

  const trading = theme.palette.trading;

  // 가격 색상 계산
  const priceChange = useMemo(() => calculatePriceChange(prevClosingPrice, price, trading.rise.main, trading.fall.main), [prevClosingPrice, price, trading]);

  const finalHighlightBgColor = useMemo(() => {
    if (!highlight.isHighlighted) return 'transparent';
    return highlight.isRise ? alpha(trading.rise.main, 0.15) : alpha(trading.fall.main, 0.15);
  }, [highlight, trading]);

  const cellSx = useMemo(
    () => ({
      padding: '6px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      bgcolor: finalHighlightBgColor,
      transition: 'background-color 0.3s ease',
      minWidth: 0,
      ...sx,
    }),
    [finalHighlightBgColor, sx],
  );

  if (render) {
    return <Box sx={cellSx}>{render({ price, formattedPrice, color: priceChange.changeColor })}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: priceChange.changeColor }}>
        {formattedPrice}
      </Typography>
    </Box>
  );
});
