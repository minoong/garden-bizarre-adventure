import { useMemo, useEffect } from 'react';

import { useKrwMarkets, useTicker, useBithumbSocket } from '@/entities/bithumb';

import type { MarketRowData } from '../model/types';

/**
 * 마켓 리스트 데이터 훅
 * - REST API로 초기 데이터 로드
 * - WebSocket으로 실시간 업데이트
 */
export function useMarketListData(options: { enabledRealtime?: boolean } = {}) {
  const { enabledRealtime = true } = options;
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
  } = useBithumbSocket(enabledRealtime && marketCodes.length > 0 ? marketCodes : [], enabledRealtime && marketCodes.length > 0 ? ['ticker'] : []);

  // WebSocket 자동 연결
  useEffect(() => {
    if (enabledRealtime && wsStatus === 'disconnected' && marketCodes.length > 0) {
      connect();
    }
  }, [connect, marketCodes.length, wsStatus, enabledRealtime]);

  // 4. 테이블 데이터 생성 (안정적인 데이터 구조 유지)
  const data = useMemo<MarketRowData[]>(() => {
    if (!markets || !tickers) return [];

    return markets.map((market) => {
      // 초기 데이터는 REST API 결과를 사용
      const restTicker = tickers.find((t) => t.market === market.market);

      return {
        market: market.market,
        korean_name: market.korean_name,
        english_name: market.english_name,
        trade_price: restTicker?.trade_price ?? 0,
        opening_price: restTicker?.opening_price ?? 0,
        prev_closing_price: restTicker?.prev_closing_price ?? 0,
        high_price: restTicker?.high_price ?? 0,
        low_price: restTicker?.low_price ?? 0,
        change: restTicker?.change ?? ('EVEN' as const),
        signed_change_rate: restTicker?.signed_change_rate ?? 0,
        change_price: restTicker?.signed_change_price ?? 0,
        acc_trade_price_24h: restTicker?.acc_trade_price_24h ?? 0,
        acc_trade_volume_24h: restTicker?.acc_trade_volume_24h ?? 0,
      };
    });
  }, [markets, tickers]); // realtimeTickers 제거

  return {
    data,
    realtimeTickers,
    isLoading: isLoadingMarkets || isLoadingTickers,
    wsStatus,
  };
}
