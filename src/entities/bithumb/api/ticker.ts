import type { Ticker } from '../model/types';
import { BITHUMB_ENDPOINTS } from '../model/constants';

import { bithumbClient } from './client';

const TICKER_MARKETS_PER_REQUEST = 100;

/**
 * 현재가 조회
 * @param markets - 마켓 코드 배열 (예: ['KRW-BTC', 'KRW-ETH'])
 * @returns 현재가 목록
 */
export async function fetchTicker(markets: string[]): Promise<Ticker[]> {
  const tickerRequests = Array.from({ length: Math.ceil(markets.length / TICKER_MARKETS_PER_REQUEST) }, (_, index) => {
    const marketBatch = markets.slice(index * TICKER_MARKETS_PER_REQUEST, (index + 1) * TICKER_MARKETS_PER_REQUEST);

    return bithumbClient.get<Ticker[]>(BITHUMB_ENDPOINTS.TICKER, {
      params: {
        markets: marketBatch.join(','),
      },
    });
  });

  const responses = await Promise.all(tickerRequests);

  return responses.flatMap((response) => response.data);
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
