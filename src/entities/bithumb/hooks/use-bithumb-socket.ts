'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { WebSocketOrderbook, WebSocketTicker, WebSocketTrade } from '../model/types';
import type { SubscriptionConfig, SubscriptionType } from '../model/websocket-types';
import { selectOrderbook, selectTicker, selectTrade, selectWebSocketStatus, useBithumbWebSocketStore } from '../model/store';

// ============================================================
// 기본 훅
// ============================================================

/**
 * WebSocket 연결 상태 훅
 */
export function useBithumbSocketStatus() {
  return useBithumbWebSocketStore(selectWebSocketStatus);
}

/**
 * WebSocket 연결/해제 액션 훅
 */
export function useBithumbSocketActions() {
  const connect = useBithumbWebSocketStore((state) => state.connect);
  const disconnect = useBithumbWebSocketStore((state) => state.disconnect);
  const subscribe = useBithumbWebSocketStore((state) => state.subscribe);
  const unsubscribe = useBithumbWebSocketStore((state) => state.unsubscribe);
  const reset = useBithumbWebSocketStore((state) => state.reset);

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
  const selected = useBithumbWebSocketStore(useShallow(selectTicker(code)));
  return selected.ticker;
}

/**
 * 여러 마켓의 Ticker 구독 (shallow 비교)
 * @param codes - 마켓 코드 배열
 */
export function useRealtimeTickers(codes: string[]) {
  const selected = useBithumbWebSocketStore(useShallow((state) => codes.flatMap((code) => [state.tickerVersionByCode[code] ?? 0, state.tickers.get(code)])));

  return useMemo(() => {
    const result: Record<string, WebSocketTicker | undefined> = {};
    codes.forEach((code, index) => {
      result[code] = selected[index * 2 + 1] as WebSocketTicker | undefined;
    });
    return result;
  }, [codes, selected]);
}

// ============================================================
// Orderbook 훅
// ============================================================

/**
 * 특정 마켓의 실시간 호가 구독
 * @param code - 마켓 코드
 */
export function useRealtimeOrderbook(code: string) {
  const selected = useBithumbWebSocketStore(useShallow(selectOrderbook(code)));
  return selected.orderbook;
}

// ============================================================
// Candle 훅
// ============================================================

// ============================================================
// Trade 훅
// ============================================================

/**
 * 특정 마켓의 실시간 체결 구독
 * @param code - 마켓 코드
 */
export function useRealtimeTrade(code: string) {
  const selected = useBithumbWebSocketStore(useShallow(selectTrade(code)));
  return selected.trade;
}

function useRealtimeOrderbooks(codes: string[]) {
  const selected = useBithumbWebSocketStore(
    useShallow((state) => codes.flatMap((code) => [state.orderbookVersionByCode[code] ?? 0, state.orderbooks.get(code)])),
  );

  return useMemo(() => {
    const result: Record<string, WebSocketOrderbook | undefined> = {};
    codes.forEach((code, index) => {
      result[code] = selected[index * 2 + 1] as WebSocketOrderbook | undefined;
    });
    return result;
  }, [codes, selected]);
}

function useRealtimeTrades(codes: string[]) {
  const selected = useBithumbWebSocketStore(useShallow((state) => codes.flatMap((code) => [state.tradeVersionByCode[code] ?? 0, state.trades.get(code)])));

  return useMemo(() => {
    const result: Record<string, WebSocketTrade | undefined> = {};
    codes.forEach((code, index) => {
      result[code] = selected[index * 2 + 1] as WebSocketTrade | undefined;
    });
    return result;
  }, [codes, selected]);
}

// ============================================================
// 통합 훅 (자동 연결/해제)
// ============================================================

interface UseBithumbSocketOptions {
  /** 자동 연결 여부 */
  autoConnect?: boolean;
}

/**
 * 빗썸 WebSocket 통합 훅
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
 * const { status, tickers } = useBithumbSocket(['KRW-BTC', 'KRW-ETH'], ['ticker']);
 *
 * // Ticker + Orderbook 구독
 * const { status, tickers, orderbooks } = useBithumbSocket(['KRW-BTC'], ['ticker', 'orderbook']);
 * ```
 */
export function useBithumbSocket(codes: string[], types: SubscriptionType[], options?: UseBithumbSocketOptions) {
  const { autoConnect = true } = options ?? {};

  const status = useBithumbSocketStatus();
  const { connect, disconnect, subscribe, unsubscribe } = useBithumbSocketActions();

  // 이전 codes/types 저장 (변경 감지용)
  const prevCodesRef = useRef<string[]>([]);
  const prevTypesRef = useRef<SubscriptionType[]>([]);

  // 구독 설정 생성
  const subscriptions = useMemo<SubscriptionConfig[]>(() => {
    return types.map((type) => ({
      type,
      codes,
    }));
  }, [codes, types]);

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
      // 컴포넌트 언마운트 시 구독 해제 (연결 해제 아님)
      for (const sub of subscriptions) {
        unsubscribe(sub.type, sub.codes);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // codes/types 변경 시 재구독
  useEffect(() => {
    if (!autoConnect) return;

    const codesChanged = JSON.stringify(codes) !== JSON.stringify(prevCodesRef.current);
    const typesChanged = JSON.stringify(types) !== JSON.stringify(prevTypesRef.current);

    if (codesChanged || typesChanged) {
      // 이전 구독 해제
      if (prevCodesRef.current.length > 0 && prevTypesRef.current.length > 0) {
        for (const type of prevTypesRef.current) {
          unsubscribe(type, prevCodesRef.current);
        }
      }

      // 새 구독 추가
      if (codes.length > 0 && types.length > 0) {
        connect(subscriptions);
      }
    }

    prevCodesRef.current = codes;
    prevTypesRef.current = types;
  }, [codes, types, subscriptions, autoConnect, connect, unsubscribe]);

  // 요청된 code만 구독해서 상위 리렌더 범위를 줄입니다.
  const realtimeTickers = useRealtimeTickers(codes);
  const realtimeOrderbooks = useRealtimeOrderbooks(codes);
  const realtimeTrades = useRealtimeTrades(codes);

  const lastUpdated = useBithumbWebSocketStore((state) => state.lastUpdated);
  const error = useBithumbWebSocketStore((state) => state.error);

  const tickers = useMemo(() => {
    const next = new Map<string, WebSocketTicker>();
    for (const code of codes) {
      const ticker = realtimeTickers[code];
      if (ticker) {
        next.set(code, ticker);
      }
    }
    return next;
  }, [codes, realtimeTickers]);

  const orderbooks = useMemo(() => {
    const next = new Map<string, WebSocketOrderbook>();
    for (const code of codes) {
      const orderbook = realtimeOrderbooks[code];
      if (orderbook) {
        next.set(code, orderbook);
      }
    }
    return next;
  }, [codes, realtimeOrderbooks]);

  const trades = useMemo(() => {
    const next = new Map<string, WebSocketTrade>();
    for (const code of codes) {
      const trade = realtimeTrades[code];
      if (trade) {
        next.set(code, trade);
      }
    }
    return next;
  }, [codes, realtimeTrades]);

  return {
    status,
    error,
    lastUpdated,
    tickers,
    orderbooks,
    trades,

    connect: handleConnect,
    disconnect, // 주의: 전체 연결 해제
    subscribe,
    unsubscribe,
  };
}
