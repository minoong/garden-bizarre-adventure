'use client';

import { useRef, memo, useEffect, useState } from 'react';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { createChart, ColorType, BaselineSeries } from 'lightweight-charts';
import { Box, useTheme, alpha } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface MiniBaselineChartProps {
  market: string; // KRW-BTC
  basePrice: number;
  currentPrice: number;
}

interface CandleData {
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  trade_price: number;
}

// KST 0시 타임스탬프 (밀리초)
function getKSTMidnightMs(): number {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  kstNow.setUTCHours(0, 0, 0, 0);
  return kstNow.getTime() - kstOffset;
}

// KST 24시간 범위 (초 단위 타임스탬프)
function getKST24HourRange() {
  const midnightMs = getKSTMidnightMs();
  return {
    start: Math.floor(midnightMs / 1000) as UTCTimestamp,
    end: Math.floor((midnightMs + 24 * 60 * 60 * 1000) / 1000) as UTCTimestamp,
  };
}

function applyVisibleRangeSafely(chart: IChartApi | null, hasData: boolean) {
  if (!chart || !hasData) return;

  const { start, end } = getKST24HourRange();
  chart.timeScale().setVisibleRange({ from: start, to: end });
}

// 0시까지 반복 호출하여 캔들 수집
async function fetchCandlesUntilMidnight(market: string): Promise<CandleData[]> {
  const allCandles: CandleData[] = [];
  let toParam: string | undefined = undefined; // 첫 호출은 to 없이 (가장 최근 캔들)
  const kstMidnightMs = getKSTMidnightMs();

  // 최대 10회 반복 (안전장치)
  for (let i = 0; i < 10; i++) {
    const response = await axios.get<CandleData[]>(`https://api.bithumb.com/v1/candles/minutes/10`, {
      params: {
        market,
        count: 200,
        ...(toParam && { to: toParam }),
      },
    });

    const candles: CandleData[] = response.data;
    if (!candles || candles.length === 0) break;

    allCandles.push(...candles);

    // 가장 오래된 캔들 (API는 최신순으로 반환)
    const oldestCandle: CandleData = candles[candles.length - 1];
    const oldestTimeMs = new Date(oldestCandle.candle_date_time_kst).getTime();

    // 0시 이전 데이터까지 도달했으면 종료
    if (oldestTimeMs <= kstMidnightMs) break;

    // 다음 호출을 위해 to 설정 (가장 오래된 캔들 시각)
    toParam = oldestCandle.candle_date_time_kst;
  }

  // 오늘 0시 이후 데이터만 필터링하여 반환
  return allCandles.filter((c) => {
    const candleTimeMs = new Date(c.candle_date_time_kst).getTime();
    return candleTimeMs >= kstMidnightMs;
  });
}

export const MiniBaselineChart = memo(function MiniBaselineChart({ market, basePrice, currentPrice }: MiniBaselineChartProps) {
  const theme = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const latestDataRef = useRef<{ time: UTCTimestamp; value: number }[]>([]);
  const initialBasePriceRef = useRef(basePrice);
  const chartGenerationRef = useRef(0);
  const [isChartReady, setIsChartReady] = useState(false);

  // 첫 렌더링 때 0시까지 반복 호출하여 캔들 수집
  const { data: candleData } = useQuery({
    queryKey: ['miniChart', 'trading-v1-all', market],
    queryFn: () => fetchCandlesUntilMidnight(market),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const generation = chartGenerationRef.current + 1;
    chartGenerationRef.current = generation;

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: 'transparent',
          },
          textColor: 'transparent',
          attributionLogo: false,
        },
        width: chartContainerRef.current.clientWidth,
        height: 80,
        timeScale: {
          visible: false,
          borderVisible: false,
          rightOffset: 0,
          barSpacing: 3,
          lockVisibleTimeRangeOnResize: true,
        },
        rightPriceScale: {
          visible: false,
          borderVisible: false,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        handleScale: false,
        handleScroll: false,
        crosshair: {
          vertLine: { visible: false },
          horzLine: { visible: false },
        },
      });

      const series = chart.addSeries(BaselineSeries, {
        baseValue: { type: 'price', price: initialBasePriceRef.current },
        topLineColor: '#f44336',
        topFillColor1: alpha('#f44336', 0.28),
        topFillColor2: alpha('#f44336', 0.05),
        bottomLineColor: '#1976d2',
        bottomFillColor1: alpha('#1976d2', 0.05),
        bottomFillColor2: alpha('#1976d2', 0.28),
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = series;
      setIsChartReady(true);
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const entry = entries[0];
      const chart = chartRef.current;
      if (!entry || !chart || chartGenerationRef.current !== generation) return;

      chart.resize(entry.contentRect.width, 80);
      applyVisibleRangeSafely(chart, latestDataRef.current.length > 0);
    });
    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      chartGenerationRef.current += 1;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      const chart = chartRef.current;
      if (chart) {
        chartRef.current = null;
        seriesRef.current = null;
        setIsChartReady(false);
        chart.remove();
      }
    };
  }, []);

  // 테마/기준가 변경 시 차트 옵션 업데이트
  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    const trading = theme.palette.trading;
    chart.applyOptions({
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme.palette.mode === 'dark' ? 'transparent' : '#f8f9fa',
        },
      },
    });
    series.applyOptions({
      baseValue: { type: 'price', price: basePrice },
      topLineColor: trading.rise.main,
      topFillColor1: alpha(trading.rise.main, 0.28),
      topFillColor2: alpha(trading.rise.main, 0.05),
      bottomLineColor: trading.fall.main,
      bottomFillColor1: alpha(trading.fall.main, 0.05),
      bottomFillColor2: alpha(trading.fall.main, 0.28),
      lineWidth: 2,
    });
  }, [basePrice, theme.palette.mode, theme.palette.trading]);

  // API 데이터 반영
  useEffect(() => {
    if (!isChartReady || !seriesRef.current || !chartRef.current) return;

    const { start: startTimestamp } = getKST24HourRange();

    let chartData: { time: UTCTimestamp; value: number }[] = [];
    if (candleData && candleData.length > 0) {
      chartData = candleData.map((c) => ({
        time: Math.floor(new Date(c.candle_date_time_utc).getTime() / 1000) as UTCTimestamp,
        value: c.trade_price,
      }));
    }

    chartData = chartData.filter((v, i, a) => i === a.findIndex((t) => t.time === v.time)).sort((a, b) => (a.time as number) - (b.time as number));

    // 왼쪽 벽 채우기 (0시 시작점)
    if (chartData.length === 0) {
      chartData.push({ time: startTimestamp, value: basePrice });
    } else if (chartData[0].time > startTimestamp) {
      chartData.unshift({ time: startTimestamp, value: chartData[0].value });
    }

    latestDataRef.current = chartData;
    seriesRef.current.setData(chartData);

    applyVisibleRangeSafely(chartRef.current, chartData.length > 0);
  }, [isChartReady, candleData, basePrice, market]);

  useEffect(() => {
    if (!isChartReady || !seriesRef.current || !chartRef.current || !currentPrice) return;

    const { start: startTimestamp, end: endTimestamp } = getKST24HourRange();
    const now = Math.floor(Date.now() / 1000);
    const currentCandleTime = (Math.floor(now / 600) * 600) as UTCTimestamp;

    if (currentCandleTime < startTimestamp || currentCandleTime >= endTimestamp) {
      return;
    }

    const nextPoint = { time: currentCandleTime, value: currentPrice };
    const previous = latestDataRef.current[latestDataRef.current.length - 1];

    if (!previous || currentCandleTime > previous.time) {
      latestDataRef.current = [...latestDataRef.current, nextPoint];
      seriesRef.current.update(nextPoint);
    } else if (currentCandleTime === previous.time) {
      latestDataRef.current[latestDataRef.current.length - 1] = nextPoint;
      seriesRef.current.update(nextPoint);
    } else {
      latestDataRef.current = latestDataRef.current.map((item) => (item.time === currentCandleTime ? nextPoint : item));
      seriesRef.current.setData(latestDataRef.current);
    }

    applyVisibleRangeSafely(chartRef.current, latestDataRef.current.length > 0);
  }, [currentPrice, isChartReady]);

  return <Box ref={chartContainerRef} sx={{ width: '100%', height: '100%', minHeight: 60 }} />;
});
