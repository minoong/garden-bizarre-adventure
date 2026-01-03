import type { Ticker } from '../model/types';
import { UPBIT_ENDPOINTS } from '../model/constants';

import { upbitClient } from './client';

/**
 * 현재가 조회
 * @param markets - 마켓 코드 배열 (예: ['KRW-BTC', 'KRW-ETH'])
 * @returns 현재가 목록
 */
export async function fetchTicker(markets: string[]): Promise<Ticker[]> {
  const { data } = await upbitClient.get<Ticker[]>(UPBIT_ENDPOINTS.TICKER, {
    params: {
      markets: markets.join(','),
    },
  });

  return data;
}

/**
 * 단일 마켓 현재가 조회
 * @param market - 마켓 코드 (예: 'KRW-BTC')
 * @returns 현재가 정보
 */
export async function fetchSingleTicker(market: string): Promise<Ticker | undefined> {
  const tickers = await fetchTicker([market]);
  return tickers[0];
}
