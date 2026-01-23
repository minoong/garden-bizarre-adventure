'use client';

import { useEffect, useRef } from 'react';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { createChart, ColorType, BaselineSeries } from 'lightweight-charts';
import { Box } from '@mui/material';
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

export function MiniBaselineChart({ market, basePrice, currentPrice }: MiniBaselineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);

  // 첫 렌더링 때 0시까지 반복 호출하여 캔들 수집
  const { data: candleData } = useQuery({
    queryKey: ['miniChart', 'bithumb-v1-all', market],
    queryFn: () => fetchCandlesUntilMidnight(market),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#f5f5f5' },
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
        baseValue: { type: 'price', price: basePrice },
        topLineColor: 'rgba(200, 74, 49, 1)',
        topFillColor1: 'rgba(200, 74, 49, 0.28)',
        topFillColor2: 'rgba(200, 74, 49, 0.05)',
        bottomLineColor: 'rgba(18, 97, 196, 1)',
        bottomFillColor1: 'rgba(18, 97, 196, 0.05)',
        bottomFillColor2: 'rgba(18, 97, 196, 0.28)',
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = series;
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        const { start, end } = getKST24HourRange();
        chartRef.current.timeScale().setVisibleRange({ from: start, to: end });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [basePrice]);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.applyOptions({
        baseValue: { type: 'price', price: basePrice },
      });
    }
  }, [basePrice]);

  // 데이터 렌더링
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    const { start: startTimestamp, end: endTimestamp } = getKST24HourRange();

    // 1. API 데이터 -> 차트 데이터로 변환
    let chartData: { time: UTCTimestamp; value?: number }[] = [];
    if (candleData && candleData.length > 0) {
      chartData = candleData.map((c) => ({
        time: Math.floor(new Date(c.candle_date_time_utc).getTime() / 1000) as UTCTimestamp,
        value: c.trade_price,
      }));
    }

    // 2. 실시간 가격 반영
    if (currentPrice) {
      const now = Math.floor(Date.now() / 1000);
      const currentCandleTime = (Math.floor(now / 600) * 600) as UTCTimestamp;

      if (currentCandleTime >= startTimestamp && currentCandleTime < endTimestamp) {
        const idx = chartData.findIndex((d) => d.time === currentCandleTime);
        if (idx !== -1) {
          chartData[idx].value = currentPrice;
        } else {
          chartData.push({ time: currentCandleTime, value: currentPrice });
        }
      }
    }

    // 정렬 및 중복 제거
    chartData = chartData.filter((v, i, a) => i === a.findIndex((t) => t.time === v.time)).sort((a, b) => (a.time as number) - (b.time as number));

    // 왼쪽 벽 채우기 (0시 시작점)
    if (chartData.length === 0) {
      chartData.push({ time: startTimestamp, value: basePrice });
    } else if (chartData[0].time > startTimestamp) {
      chartData.unshift({ time: startTimestamp, value: chartData[0].value });
    }

    // 3. 미래 Whitespace (현재 시간 이후 ~ 24시)
    const lastTime = chartData[chartData.length - 1].time as number;
    const interval = 10 * 60;
    const whitespaceData: { time: UTCTimestamp }[] = [];

    for (let t = lastTime + interval; t < endTimestamp; t += interval) {
      whitespaceData.push({ time: t as UTCTimestamp });
    }
    whitespaceData.push({ time: endTimestamp });

    // 차트에 데이터 주입
    seriesRef.current.setData([...chartData, ...whitespaceData]);

    // 24시간 범위 고정 (0시 ~ 24시)
    chartRef.current.timeScale().setVisibleRange({
      from: startTimestamp,
      to: endTimestamp,
    });
  }, [candleData, basePrice, currentPrice]);

  return <Box ref={chartContainerRef} sx={{ width: '100%', height: '100%', minHeight: 60 }} />;
}
