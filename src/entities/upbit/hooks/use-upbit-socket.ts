'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { WebSocketCandleType } from '../model/types';
import type { SubscriptionConfig, SubscriptionType } from '../model/websocket-types';
import {
  selectAllTickers,
  selectCandle,
  selectOrderbook,
  selectTicker,
  selectTickerArray,
  selectWebSocketStatus,
  useUpbitWebSocketStore,
} from '../model/store';

// ============================================================
// 기본 훅
// ============================================================

/**
 * WebSocket 연결 상태 훅
 */
export function useUpbitSocketStatus() {
  return useUpbitWebSocketStore(selectWebSocketStatus);
}

/**
 * WebSocket 연결/해제 액션 훅
 */
export function useUpbitSocketActions() {
  const connect = useUpbitWebSocketStore((state) => state.connect);
  const disconnect = useUpbitWebSocketStore((state) => state.disconnect);
  const subscribe = useUpbitWebSocketStore((state) => state.subscribe);
  const unsubscribe = useUpbitWebSocketStore((state) => state.unsubscribe);
  const reset = useUpbitWebSocketStore((state) => state.reset);

  return { connect, disconnect, subscribe, unsubscribe, reset };
}

// ============================================================
// Ticker 훅
// ============================================================

/**
 * 특정 마켓의 실시간 Ticker 구독
 * @param code - 마켓 코드 (예: 'KRW-BTC')
 */
export function useRealtimeTicker(code: string) {
  return useUpbitWebSocketStore(selectTicker(code));
}

/**
 * 전체 Ticker Map 구독
 */
export function useRealtimeTickerMap() {
  return useUpbitWebSocketStore(selectAllTickers);
}

/**
 * Ticker 배열로 구독
 */
export function useRealtimeTickerArray() {
  return useUpbitWebSocketStore(selectTickerArray);
}

/**
 * 여러 마켓의 Ticker 구독 (shallow 비교)
 * @param codes - 마켓 코드 배열
 */
export function useRealtimeTickers(codes: string[]) {
  return useUpbitWebSocketStore(
    useShallow((state) => {
      const result: Record<string, (typeof state.tickers extends Map<string, infer V> ? V : never) | undefined> = {};
      for (const code of codes) {
        result[code] = state.tickers.get(code);
      }
      return result;
    }),
  );
}

// ============================================================
// Orderbook 훅
// ============================================================

/**
 * 특정 마켓의 실시간 호가 구독
 * @param code - 마켓 코드
 */
export function useRealtimeOrderbook(code: string) {
  return useUpbitWebSocketStore(selectOrderbook(code));
}

// ============================================================
// Candle 훅
// ============================================================

/**
 * 특정 마켓의 실시간 캔들 구독
 * @param code - 마켓 코드
 */
export function useRealtimeCandle(code: string) {
  return useUpbitWebSocketStore(selectCandle(code));
}

// ============================================================
// 통합 훅 (자동 연결/해제)
// ============================================================

interface UseUpbitSocketOptions {
  /** 자동 연결 여부 */
  autoConnect?: boolean;
  /** 캔들 타입 (candle 구독 시 필수) */
  candleType?: WebSocketCandleType;
}

/**
 * 업비트 WebSocket 통합 훅
 *
 * 컴포넌트 마운트 시 자동 연결, 언마운트 시 자동 해제
 *
 * @param codes - 구독할 마켓 코드 배열
 * @param types - 구독할 타입 배열 (ticker, orderbook, candle)
 * @param options - 옵션
 *
 * @example
 * ```tsx
 * // Ticker만 구독
 * const { status, tickers } = useUpbitSocket(['KRW-BTC', 'KRW-ETH'], ['ticker']);
 *
 * // Ticker + Orderbook 구독
 * const { status, tickers, orderbooks } = useUpbitSocket(['KRW-BTC'], ['ticker', 'orderbook']);
 * ```
 */
export function useUpbitSocket(codes: string[], types: SubscriptionType[], options?: UseUpbitSocketOptions) {
  const { autoConnect = true, candleType } = options ?? {};

  const status = useUpbitSocketStatus();
  const { connect, disconnect, subscribe, unsubscribe } = useUpbitSocketActions();

  // 이전 codes/types 저장 (변경 감지용)
  const prevCodesRef = useRef<string[]>([]);
  const prevTypesRef = useRef<SubscriptionType[]>([]);

  // 구독 설정 생성
  const subscriptions = useMemo<SubscriptionConfig[]>(() => {
    return types.map((type) => ({
      type,
      codes,
      candleType: type === 'candle' ? candleType : undefined,
    }));
  }, [codes, types, candleType]);

  // 연결 함수
  const handleConnect = useCallback(() => {
    if (codes.length > 0 && types.length > 0) {
      connect(subscriptions);
    }
  }, [connect, subscriptions, codes.length, types.length]);

  // 초기 연결
  useEffect(() => {
    if (!autoConnect) return;

    handleConnect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // codes/types 변경 시 재구독
  useEffect(() => {
    if (!autoConnect) return;

    const codesChanged = JSON.stringify(codes) !== JSON.stringify(prevCodesRef.current);
    const typesChanged = JSON.stringify(types) !== JSON.stringify(prevTypesRef.current);

    if ((codesChanged || typesChanged) && status === 'connected') {
      // 기존 구독 해제 후 새로 구독
      for (const type of prevTypesRef.current) {
        unsubscribe(type);
      }
      for (const sub of subscriptions) {
        subscribe(sub);
      }
    }

    prevCodesRef.current = codes;
    prevTypesRef.current = types;
  }, [codes, types, subscriptions, status, autoConnect, subscribe, unsubscribe]);

  // 데이터 선택
  const tickers = useRealtimeTickerMap();
  const orderbooks = useUpbitWebSocketStore((state) => state.orderbooks);
  const candles = useUpbitWebSocketStore((state) => state.candles);
  const lastUpdated = useUpbitWebSocketStore((state) => state.lastUpdated);
  const error = useUpbitWebSocketStore((state) => state.error);

  return {
    status,
    error,
    lastUpdated,
    tickers,
    orderbooks,
    candles,
    connect: handleConnect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}
