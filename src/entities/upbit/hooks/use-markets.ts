'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMarkets } from '../api/markets';
import { UPBIT_GC_TIME, UPBIT_QUERY_KEYS, UPBIT_STALE_TIME } from '../model/constants';
import type { Market, MarketsParams } from '../model/types';

interface UseMarketsOptions extends MarketsParams {
  /** 쿼리 활성화 여부 */
  enabled?: boolean;
}

/**
 * 마켓 목록 조회 훅
 * @param options - 조회 옵션
 * @returns 마켓 목록 쿼리 결과
 */
export function useMarkets(options?: UseMarketsOptions) {
  const { is_details = false, enabled = true } = options ?? {};

  return useQuery<Market[]>({
    queryKey: is_details ? UPBIT_QUERY_KEYS.marketsWithDetails : UPBIT_QUERY_KEYS.markets,
    queryFn: () => fetchMarkets({ is_details }),
    staleTime: UPBIT_STALE_TIME.MARKETS,
    gcTime: UPBIT_GC_TIME.MARKETS,
    enabled,
  });
}

/**
 * KRW 마켓만 조회하는 훅
 * @param options - 조회 옵션
 * @returns KRW 마켓 목록
 */
export function useKrwMarkets(options?: Omit<UseMarketsOptions, 'is_details'>) {
  const { data: markets, ...rest } = useMarkets(options);

  const krwMarkets = markets?.filter((market) => market.market.startsWith('KRW-'));

  return {
    ...rest,
    data: krwMarkets,
  };
}

/**
 * BTC 마켓만 조회하는 훅
 * @param options - 조회 옵션
 * @returns BTC 마켓 목록
 */
export function useBtcMarkets(options?: Omit<UseMarketsOptions, 'is_details'>) {
  const { data: markets, ...rest } = useMarkets(options);

  const btcMarkets = markets?.filter((market) => market.market.startsWith('BTC-'));

  return {
    ...rest,
    data: btcMarkets,
  };
}

/**
 * USDT 마켓만 조회하는 훅
 * @param options - 조회 옵션
 * @returns USDT 마켓 목록
 */
export function useUsdtMarkets(options?: Omit<UseMarketsOptions, 'is_details'>) {
  const { data: markets, ...rest } = useMarkets(options);

  const usdtMarkets = markets?.filter((market) => market.market.startsWith('USDT-'));

  return {
    ...rest,
    data: usdtMarkets,
  };
}
