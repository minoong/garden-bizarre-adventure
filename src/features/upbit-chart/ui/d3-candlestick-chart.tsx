'use client';

import { useMemo } from 'react';
import type { FC } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { scaleLinear } from 'd3-scale';

import { useCandles, type CandleTimeframe } from '@/entities/upbit';

import { D3Candle } from './d3-candle';

interface D3CandlestickChartProps {
  /** 마켓 코드 */
  market: string;
  /** 타임프레임 */
  timeframe: CandleTimeframe;
  /** 차트 높이 */
  height?: number;
  /** 차트 너비 */
  width?: number;
  /** 초기 캔들 개수 */
  initialCount?: number;
  /** 캔들 간격 (픽셀) */
  candleSpacing?: number;
  /** 캔들 너비 (픽셀) */
  candleWidth?: number;
  /** 상승 색상 */
  upColor?: string;
  /** 하락 색상 */
  downColor?: string;
  /** 배경 색상 */
  backgroundColor?: string;
  /** 그리드 표시 */
  showGrid?: boolean;
  /** 가격 축 표시 */
  showPriceAxis?: boolean;
  /** 시간 축 표시 */
  showTimeAxis?: boolean;
  /** 텍스트 색상 */
  textColor?: string;
  /** 그리드 색상 */
  gridColor?: string;
  /** 클래스명 */
  className?: string;
}

// 차트 여백
const MARGIN = {
  top: 20,
  right: 60,
  bottom: 40,
  left: 10,
};

/**
 * D3 기반 캔들스틱 차트
 */
export const D3CandlestickChart: FC<D3CandlestickChartProps> = ({
  market,
  timeframe,
  height = 400,
  width = 800,
  initialCount = 100,
  candleSpacing = 2,
  candleWidth = 8,
  upColor = '#C84931',
  downColor = '#1361C5',
  backgroundColor = '#ffffff',
  showGrid = true,
  showPriceAxis = true,
  showTimeAxis = true,
  textColor = '#666',
  gridColor = '#e0e0e0',
  className,
}) => {
  // REST API로 캔들 데이터 로드
  const { data: candles, isLoading, error } = useCandles(market, timeframe, { count: initialCount });

  // 가격 범위 및 좌표 계산
  const chartData = useMemo(() => {
    if (!candles || candles.length === 0) return null;

    // 모든 캔들의 고가/저가로 min/max 계산
    const prices = candles.flatMap((c) => [c.high_price, c.low_price]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // 약간의 패딩 추가 (5%)
    const padding = (maxPrice - minPrice) * 0.05;
    const paddedMin = minPrice - padding;
    const paddedMax = maxPrice + padding;

    // 차트 영역 크기 (여백 제외)
    const chartHeight = height - MARGIN.top - MARGIN.bottom;
    const totalCandleSpace = candleWidth + candleSpacing;
    const chartWidth = Math.max(candles.length * totalCandleSpace, width - MARGIN.left - MARGIN.right);

    // Y축 스케일
    const yScale = scaleLinear().domain([paddedMin, paddedMax]).range([chartHeight, 0]);

    // 가격 축 눈금 (5개)
    const priceTicks = yScale.ticks(5);

    // 각 캔들의 X 좌표 계산
    const candlesWithX = candles.map((candle, index) => ({
      candle,
      x: MARGIN.left + (index + 0.5) * totalCandleSpace,
    }));

    // 시간 축 레이블 (최대 10개)
    const timeTickStep = Math.max(1, Math.floor(candles.length / 10));
    const timeTicks = candles
      .filter((_, index) => index % timeTickStep === 0)
      .map((candle, index) => ({
        x: MARGIN.left + index * timeTickStep * totalCandleSpace,
        label: new Date(candle.candle_date_time_kst).toLocaleString('ko-KR', {
          month: '2-digit',
          day: '2-digit',
          hour: timeframe.type === 'minutes' ? '2-digit' : undefined,
          minute: timeframe.type === 'minutes' ? '2-digit' : undefined,
        }),
      }));

    return {
      candles: candlesWithX,
      minPrice: paddedMin,
      maxPrice: paddedMax,
      chartWidth: chartWidth + MARGIN.left + MARGIN.right,
      chartHeight,
      yScale,
      priceTicks,
      timeTicks,
    };
  }, [candles, width, height, candleWidth, candleSpacing, timeframe.type]);

  // 로딩 상태
  if (isLoading) {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, backgroundColor }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, backgroundColor }}>
        <Typography color="error">차트 로드 실패</Typography>
      </Box>
    );
  }

  // 데이터 없음
  if (!chartData) {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, backgroundColor }}>
        <Typography>데이터 없음</Typography>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ width: '100%', height, backgroundColor, overflow: 'auto' }}>
      <svg width={chartData.chartWidth} height={height}>
        {/* 그리드 */}
        {showGrid && (
          <g>
            {chartData.priceTicks.map((price) => {
              const y = MARGIN.top + chartData.yScale(price);
              return (
                <line key={price} x1={MARGIN.left} y1={y} x2={chartData.chartWidth - MARGIN.right} y2={y} stroke={gridColor} strokeWidth={1} opacity={0.5} />
              );
            })}
          </g>
        )}

        {/* 캔들 */}
        <g>
          {chartData.candles.map(({ candle, x }, index) => (
            <g key={`${candle.candle_date_time_kst}-${index}`} transform={`translate(0, ${MARGIN.top})`}>
              <D3Candle
                open={candle.opening_price}
                close={candle.trade_price}
                high={candle.high_price}
                low={candle.low_price}
                x={x}
                width={candleWidth}
                height={chartData.chartHeight}
                minPrice={chartData.minPrice}
                maxPrice={chartData.maxPrice}
                upColor={upColor}
                downColor={downColor}
              />
            </g>
          ))}
        </g>

        {/* 가격 축 (Y축) */}
        {showPriceAxis && (
          <g>
            {chartData.priceTicks.map((price) => {
              const y = MARGIN.top + chartData.yScale(price);
              return (
                <text key={price} x={chartData.chartWidth - MARGIN.right + 5} y={y} dy="0.35em" fill={textColor} fontSize={11} fontFamily="monospace">
                  {price.toLocaleString('ko-KR')}
                </text>
              );
            })}
          </g>
        )}

        {/* 시간 축 (X축) */}
        {showTimeAxis && (
          <g>
            {chartData.timeTicks.map((tick, index) => (
              <text key={index} x={tick.x} y={height - MARGIN.bottom + 15} fill={textColor} fontSize={10} fontFamily="monospace" textAnchor="middle">
                {tick.label}
              </text>
            ))}
          </g>
        )}
      </svg>
    </Box>
  );
};
