/**
 * 업비트 WebSocket Zustand 스토어
 *
 * Map을 사용하여 O(1) 조회 성능 보장
 * 선택적 구독으로 불필요한 리렌더링 방지
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { getUpbitWebSocketManager, resetUpbitWebSocketManager } from '../lib/websocket-manager';

import type { WebSocketCandle, WebSocketOrderbook, WebSocketTicker } from './types';
import type { SubscriptionConfig, UpbitWebSocketStore, WebSocketStatus } from './websocket-types';

const initialState = {
  status: 'disconnected' as WebSocketStatus,
  tickers: new Map<string, WebSocketTicker>(),
  orderbooks: new Map<string, WebSocketOrderbook>(),
  candles: new Map<string, WebSocketCandle>(),
  lastUpdated: 0,
  error: null as string | null,
};

export const useUpbitWebSocketStore = create<UpbitWebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    connect: (subscriptions: SubscriptionConfig[]) => {
      const manager = getUpbitWebSocketManager();

      // 상태 변경 핸들러
      manager.setStatusHandler((status, error) => {
        set({ status, error: error ?? null });
      });

      // 메시지 핸들러 - Map을 새로 생성하여 참조 변경
      manager.setMessageHandler((tickers, orderbooks, candles) => {
        set({
          tickers: new Map(tickers),
          orderbooks: new Map(orderbooks),
          candles: new Map(candles),
          lastUpdated: Date.now(),
        });
      });

      manager.connect(subscriptions);
    },

    disconnect: () => {
      resetUpbitWebSocketManager();
      set(initialState);
    },

    subscribe: (subscription: SubscriptionConfig) => {
      const manager = getUpbitWebSocketManager();
      manager.subscribe(subscription);
    },

    unsubscribe: (type, codes) => {
      const manager = getUpbitWebSocketManager();
      manager.unsubscribe(type, codes);

      // 로컬 상태도 업데이트
      if (codes) {
        const state = get();
        if (type === 'ticker') {
          const newTickers = new Map(state.tickers);
          codes.forEach((code) => newTickers.delete(code));
          set({ tickers: newTickers });
        } else if (type === 'orderbook') {
          const newOrderbooks = new Map(state.orderbooks);
          codes.forEach((code) => newOrderbooks.delete(code));
          set({ orderbooks: newOrderbooks });
        } else if (type === 'candle') {
          const newCandles = new Map(state.candles);
          codes.forEach((code) => newCandles.delete(code));
          set({ candles: newCandles });
        }
      } else {
        if (type === 'ticker') set({ tickers: new Map() });
        else if (type === 'orderbook') set({ orderbooks: new Map() });
        else if (type === 'candle') set({ candles: new Map() });
      }
    },

    getTicker: (code: string) => {
      return get().tickers.get(code);
    },

    getOrderbook: (code: string) => {
      return get().orderbooks.get(code);
    },

    getCandle: (code: string) => {
      return get().candles.get(code);
    },

    reset: () => {
      resetUpbitWebSocketManager();
      set(initialState);
    },
  })),
);

// ============================================================
// 선택적 셀렉터 (성능 최적화)
// ============================================================

/**
 * 연결 상태만 구독
 */
export const selectWebSocketStatus = (state: UpbitWebSocketStore) => state.status;

/**
 * 특정 마켓의 Ticker만 구독
 */
export const selectTicker = (code: string) => (state: UpbitWebSocketStore) => state.tickers.get(code);

/**
 * 특정 마켓의 Orderbook만 구독
 */
export const selectOrderbook = (code: string) => (state: UpbitWebSocketStore) => state.orderbooks.get(code);

/**
 * 특정 마켓의 Candle만 구독
 */
export const selectCandle = (code: string) => (state: UpbitWebSocketStore) => state.candles.get(code);

/**
 * 전체 Ticker Map 구독
 */
export const selectAllTickers = (state: UpbitWebSocketStore) => state.tickers;

/**
 * Ticker 배열로 변환하여 구독
 */
export const selectTickerArray = (state: UpbitWebSocketStore) => Array.from(state.tickers.values());

/**
 * 마지막 업데이트 시간 구독
 */
export const selectLastUpdated = (state: UpbitWebSocketStore) => state.lastUpdated;
