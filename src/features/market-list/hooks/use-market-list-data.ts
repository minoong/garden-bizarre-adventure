import { useMemo, useEffect } from 'react';

import { useKrwMarkets, useTicker, useUpbitSocket } from '@/entities/upbit';
import type { Ticker, WebSocketTicker } from '@/entities/upbit';

import type { MarketRowData } from '../model/types';

/**
 * 마켓 리스트 데이터 훅
 * - REST API로 초기 데이터 로드
 * - WebSocket으로 실시간 업데이트
 */
export function useMarketListData() {
  // 1. KRW 마켓 목록 조회 (REST API)
  const { data: markets, isLoading: isLoadingMarkets } = useKrwMarkets();

  // 2. 초기 현재가 조회 (REST API)
  const marketCodes = useMemo(() => markets?.map((m) => m.market) ?? [], [markets]);
  const { data: tickers, isLoading: isLoadingTickers } = useTicker(marketCodes, {
    enabled: marketCodes.length > 0,
  });

  // 3. 실시간 ticker WebSocket 구독
  const {
    tickers: realtimeTickers,
    connect,
    status: wsStatus,
  } = useUpbitSocket(marketCodes.length > 0 ? marketCodes : [], marketCodes.length > 0 ? ['ticker'] : []);

  // WebSocket 자동 연결
  useEffect(() => {
    if (wsStatus === 'disconnected' && marketCodes.length > 0) {
      connect();
    }
  }, [connect, marketCodes.length, wsStatus]);

  // 4. 테이블 데이터 생성 (REST + WebSocket 병합)
  const data = useMemo<MarketRowData[]>(() => {
    if (!markets || !tickers) return [];

    return markets.map((market) => {
      // WebSocket 데이터 우선 사용, 없으면 REST API 데이터 사용
      const realtimeTicker = realtimeTickers.get(market.market);
      const restTicker = tickers.find((t) => t.market === market.market);
      const ticker: WebSocketTicker | Ticker | undefined = realtimeTicker || restTicker;

      if (!ticker) {
        return {
          market: market.market,
          korean_name: market.korean_name,
          english_name: market.english_name,
          trade_price: 0,
          opening_price: 0,
          high_price: 0,
          low_price: 0,
          change: 'EVEN' as const,
          change_rate: 0,
          change_price: 0,
          acc_trade_price_24h: 0,
          acc_trade_volume_24h: 0,
        };
      }

      // WebSocketTicker 타입 가드
      const isWebSocketTicker = (t: WebSocketTicker | Ticker): t is WebSocketTicker => 'opening_price' in t;

      return {
        market: market.market,
        korean_name: market.korean_name,
        english_name: market.english_name,
        trade_price: ticker.trade_price,
        opening_price: isWebSocketTicker(ticker) ? ticker.opening_price : ticker.prev_closing_price,
        high_price: ticker.high_price,
        low_price: ticker.low_price,
        change: isWebSocketTicker(ticker) ? ticker.change : 'EVEN',
        change_rate: isWebSocketTicker(ticker) ? ticker.change_rate : ticker.signed_change_rate,
        change_price: isWebSocketTicker(ticker) ? ticker.signed_change_price : ticker.signed_change_price,
        acc_trade_price_24h: ticker.acc_trade_price_24h,
        acc_trade_volume_24h: ticker.acc_trade_volume_24h,
      };
    });
  }, [markets, tickers, realtimeTickers]);

  return {
    data,
    realtimeTickers,
    isLoading: isLoadingMarkets || isLoadingTickers,
    wsStatus,
  };
}
