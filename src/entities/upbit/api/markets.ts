import type { Market, MarketsParams } from '../model/types';
import { UPBIT_ENDPOINTS } from '../model/constants';

import { upbitClient } from './client';

/**
 * 마켓(페어) 목록 조회
 * @param params - 조회 옵션
 * @returns 마켓 목록
 */
export async function fetchMarkets(params?: MarketsParams): Promise<Market[]> {
  const { data } = await upbitClient.get<Market[]>(UPBIT_ENDPOINTS.MARKETS, {
    params: {
      is_details: params?.is_details ?? false,
    },
  });

  return data;
}

/**
 * KRW 마켓만 필터링
 * @param markets - 전체 마켓 목록
 * @returns KRW 마켓 목록
 */
export function filterKrwMarkets(markets: Market[]): Market[] {
  return markets.filter((market) => market.market.startsWith('KRW-'));
}

/**
 * BTC 마켓만 필터링
 * @param markets - 전체 마켓 목록
 * @returns BTC 마켓 목록
 */
export function filterBtcMarkets(markets: Market[]): Market[] {
  return markets.filter((market) => market.market.startsWith('BTC-'));
}

/**
 * USDT 마켓만 필터링
 * @param markets - 전체 마켓 목록
 * @returns USDT 마켓 목록
 */
export function filterUsdtMarkets(markets: Market[]): Market[] {
  return markets.filter((market) => market.market.startsWith('USDT-'));
}
