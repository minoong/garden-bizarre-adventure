import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { getBithumbWebSocketManager, resetBithumbWebSocketManager } from '../lib/websocket-manager';

import type { WebSocketOrderbook, WebSocketTicker, WebSocketTrade } from './types';
import type { SubscriptionConfig, BithumbWebSocketStore, WebSocketStatus } from './websocket-types';

const initialState = {
  status: 'disconnected' as WebSocketStatus,
  tickers: new Map<string, WebSocketTicker>(),
  orderbooks: new Map<string, WebSocketOrderbook>(),
  trades: new Map<string, WebSocketTrade>(),

  lastUpdated: 0,
  error: null as string | null,
};

export const useBithumbWebSocketStore = create<BithumbWebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    connect: (subscriptions: SubscriptionConfig[]) => {
      const manager = getBithumbWebSocketManager();

      // 상태 변경 핸들러
      manager.setStatusHandler((status, error) => {
        set({ status, error: error ?? null });
      });

      // 메시지 핸들러 - Map을 새로 생성하여 참조 변경
      manager.setMessageHandler((tickers, orderbooks, trades) => {
        set({
          tickers: new Map(tickers),
          orderbooks: new Map(orderbooks),
          trades: new Map(trades),
          lastUpdated: Date.now(),
        });
      });

      manager.connect(subscriptions);
    },

    disconnect: () => {
      resetBithumbWebSocketManager();
      set(initialState);
    },

    subscribe: (subscription: SubscriptionConfig) => {
      const manager = getBithumbWebSocketManager();
      manager.subscribe(subscription);
    },

    unsubscribe: (type, codes) => {
      const manager = getBithumbWebSocketManager();
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
        } else if (type === 'trade') {
          const newTrades = new Map(state.trades);
          codes.forEach((code) => newTrades.delete(code));
          set({ trades: newTrades });
        }
      } else {
        if (type === 'ticker') set({ tickers: new Map() });
        else if (type === 'orderbook') set({ orderbooks: new Map() });
        else if (type === 'trade') set({ trades: new Map() });
      }
    },

    getTicker: (code: string) => {
      return get().tickers.get(code);
    },

    getOrderbook: (code: string) => {
      return get().orderbooks.get(code);
    },

    getTrade: (code: string) => {
      return get().trades.get(code);
    },

    reset: () => {
      resetBithumbWebSocketManager();
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
export const selectWebSocketStatus = (state: BithumbWebSocketStore) => state.status;

/**
 * 특정 마켓의 Ticker만 구독
 */
export const selectTicker = (code: string) => (state: BithumbWebSocketStore) => state.tickers.get(code);

/**
 * 특정 마켓의 Orderbook만 구독
 */
export const selectOrderbook = (code: string) => (state: BithumbWebSocketStore) => state.orderbooks.get(code);

/**
 * 특정 마켓의 Trade만 구독
 */
export const selectTrade = (code: string) => (state: BithumbWebSocketStore) => state.trades.get(code);

/**
 * 전체 Ticker Map 구독
 */
export const selectAllTickers = (state: BithumbWebSocketStore) => state.tickers;

/**
 * Ticker 배열로 변환하여 구독
 */
export const selectTickerArray = (state: BithumbWebSocketStore) => Array.from(state.tickers.values());

/**
 * 마지막 업데이트 시간 구독
 */
export const selectLastUpdated = (state: BithumbWebSocketStore) => state.lastUpdated;
