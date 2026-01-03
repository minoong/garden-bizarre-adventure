'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchCandles, fetchDayCandles, fetchMinuteCandles, fetchMonthCandles, fetchWeekCandles } from '../api/candles';
import { UPBIT_GC_TIME, UPBIT_QUERY_KEYS, UPBIT_STALE_TIME } from '../model/constants';
import type { CandleTimeframe, DayCandle, MinuteCandle, MinuteUnit, MonthCandle, WeekCandle } from '../model/types';

interface UseCandlesBaseOptions {
  /** 마지막 캔들 시각 (ISO 8601) */
  to?: string;
  /** 캔들 개수 (최대 200) */
  count?: number;
  /** 쿼리 활성화 여부 */
  enabled?: boolean;
  /** 자동 갱신 간격 (ms) */
  refetchInterval?: number | false;
}

/**
 * 캔들 타임프레임을 쿼리 키 문자열로 변환
 */
function getTimeframeKey(timeframe: CandleTimeframe): string {
  if (timeframe.type === 'minutes') {
    return `minutes-${timeframe.unit}`;
  }
  return timeframe.type;
}

/**
 * 캔들 조회 훅 (통합)
 * @param market - 마켓 코드 (예: 'KRW-BTC')
 * @param timeframe - 캔들 타임프레임
 * @param options - 조회 옵션
 * @returns 캔들 쿼리 결과
 */
export function useCandles(market: string, timeframe: CandleTimeframe, options?: UseCandlesBaseOptions) {
  const { to, count, enabled = true, refetchInterval = false } = options ?? {};

  return useQuery({
    queryKey: UPBIT_QUERY_KEYS.candles(market, getTimeframeKey(timeframe)),
    queryFn: () => fetchCandles(market, timeframe, { to, count }),
    staleTime: UPBIT_STALE_TIME.CANDLES,
    gcTime: UPBIT_GC_TIME.CANDLES,
    enabled: enabled && Boolean(market),
    refetchInterval,
  });
}

/**
 * 분봉 캔들 조회 훅
 * @param market - 마켓 코드
 * @param unit - 분 단위 (1, 3, 5, 10, 15, 30, 60, 240)
 * @param options - 조회 옵션
 * @returns 분봉 캔들 목록
 */
export function useMinuteCandles(market: string, unit: MinuteUnit, options?: UseCandlesBaseOptions) {
  const { to, count, enabled = true, refetchInterval = false } = options ?? {};

  return useQuery<MinuteCandle[]>({
    queryKey: UPBIT_QUERY_KEYS.minuteCandles(market, unit),
    queryFn: () => fetchMinuteCandles(unit, { market, to, count }),
    staleTime: UPBIT_STALE_TIME.CANDLES,
    gcTime: UPBIT_GC_TIME.CANDLES,
    enabled: enabled && Boolean(market),
    refetchInterval,
  });
}

/**
 * 일봉 캔들 조회 훅
 * @param market - 마켓 코드
 * @param options - 조회 옵션
 * @returns 일봉 캔들 목록
 */
export function useDayCandles(market: string, options?: UseCandlesBaseOptions) {
  const { to, count, enabled = true, refetchInterval = false } = options ?? {};

  return useQuery<DayCandle[]>({
    queryKey: UPBIT_QUERY_KEYS.dayCandles(market),
    queryFn: () => fetchDayCandles({ market, to, count }),
    staleTime: UPBIT_STALE_TIME.CANDLES,
    gcTime: UPBIT_GC_TIME.CANDLES,
    enabled: enabled && Boolean(market),
    refetchInterval,
  });
}

/**
 * 주봉 캔들 조회 훅
 * @param market - 마켓 코드
 * @param options - 조회 옵션
 * @returns 주봉 캔들 목록
 */
export function useWeekCandles(market: string, options?: UseCandlesBaseOptions) {
  const { to, count, enabled = true, refetchInterval = false } = options ?? {};

  return useQuery<WeekCandle[]>({
    queryKey: UPBIT_QUERY_KEYS.weekCandles(market),
    queryFn: () => fetchWeekCandles({ market, to, count }),
    staleTime: UPBIT_STALE_TIME.CANDLES,
    gcTime: UPBIT_GC_TIME.CANDLES,
    enabled: enabled && Boolean(market),
    refetchInterval,
  });
}

/**
 * 월봉 캔들 조회 훅
 * @param market - 마켓 코드
 * @param options - 조회 옵션
 * @returns 월봉 캔들 목록
 */
export function useMonthCandles(market: string, options?: UseCandlesBaseOptions) {
  const { to, count, enabled = true, refetchInterval = false } = options ?? {};

  return useQuery<MonthCandle[]>({
    queryKey: UPBIT_QUERY_KEYS.monthCandles(market),
    queryFn: () => fetchMonthCandles({ market, to, count }),
    staleTime: UPBIT_STALE_TIME.CANDLES,
    gcTime: UPBIT_GC_TIME.CANDLES,
    enabled: enabled && Boolean(market),
    refetchInterval,
  });
}
