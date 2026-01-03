'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchTicker } from '../api/ticker';
import { UPBIT_GC_TIME, UPBIT_QUERY_KEYS, UPBIT_STALE_TIME } from '../model/constants';
import type { Ticker } from '../model/types';

interface UseTickerOptions {
  /** 쿼리 활성화 여부 */
  enabled?: boolean;
  /** 자동 갱신 간격 (ms) */
  refetchInterval?: number | false;
}

/**
 * 현재가 조회 훅
 * @param markets - 마켓 코드 배열 (예: ['KRW-BTC', 'KRW-ETH'])
 * @param options - 조회 옵션
 * @returns 현재가 쿼리 결과
 */
export function useTicker(markets: string[], options?: UseTickerOptions) {
  const { enabled = true, refetchInterval = false } = options ?? {};

  return useQuery<Ticker[]>({
    queryKey: UPBIT_QUERY_KEYS.ticker(markets),
    queryFn: () => fetchTicker(markets),
    staleTime: UPBIT_STALE_TIME.TICKER,
    gcTime: UPBIT_GC_TIME.TICKER,
    enabled: enabled && markets.length > 0,
    refetchInterval,
  });
}

/**
 * 단일 마켓 현재가 조회 훅
 * @param market - 마켓 코드 (예: 'KRW-BTC')
 * @param options - 조회 옵션
 * @returns 현재가 정보
 */
export function useSingleTicker(market: string, options?: UseTickerOptions) {
  const { data: tickers, ...rest } = useTicker([market], {
    ...options,
    enabled: (options?.enabled ?? true) && Boolean(market),
  });

  return {
    ...rest,
    data: tickers?.[0],
  };
}

/**
 * 현재가 맵으로 변환 훅
 * @param markets - 마켓 코드 배열
 * @param options - 조회 옵션
 * @returns 마켓코드 → Ticker 맵
 */
export function useTickerMap(markets: string[], options?: UseTickerOptions) {
  const { data: tickers, ...rest } = useTicker(markets, options);

  const tickerMap = tickers?.reduce(
    (acc, ticker) => {
      acc[ticker.market] = ticker;
      return acc;
    },
    {} as Record<string, Ticker>,
  );

  return {
    ...rest,
    data: tickerMap,
  };
}
