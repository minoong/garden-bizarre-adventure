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
  tickerVersionByCode: {} as Record<string, number>,
  orderbookVersionByCode: {} as Record<string, number>,
  tradeVersionByCode: {} as Record<string, number>,

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

      // 메시지 핸들러 - 변경된 code만 버전 업데이트
      manager.setMessageHandler((delta) => {
        if (delta.tickers.length === 0 && delta.orderbooks.length === 0 && delta.trades.length === 0) {
          return;
        }

        set((state) => {
          const nextTickers = new Map(state.tickers);
          const nextOrderbooks = new Map(state.orderbooks);
          const nextTrades = new Map(state.trades);
          const nextTickerVersionByCode = { ...state.tickerVersionByCode };
          const nextOrderbookVersionByCode = { ...state.orderbookVersionByCode };
          const nextTradeVersionByCode = { ...state.tradeVersionByCode };
          const nextVersion = Date.now();

          delta.tickers.forEach((ticker) => {
            nextTickers.set(ticker.code, ticker);
            nextTickerVersionByCode[ticker.code] = nextVersion;
          });

          delta.orderbooks.forEach((orderbook) => {
            nextOrderbooks.set(orderbook.code, orderbook);
            nextOrderbookVersionByCode[orderbook.code] = nextVersion;
          });

          delta.trades.forEach((trade) => {
            nextTrades.set(trade.code, trade);
            nextTradeVersionByCode[trade.code] = nextVersion;
          });

          return {
            tickers: nextTickers,
            orderbooks: nextOrderbooks,
            trades: nextTrades,
            tickerVersionByCode: nextTickerVersionByCode,
            orderbookVersionByCode: nextOrderbookVersionByCode,
            tradeVersionByCode: nextTradeVersionByCode,
            lastUpdated: nextVersion,
          };
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
          const nextTickerVersionByCode = { ...state.tickerVersionByCode };
          codes.forEach((code) => newTickers.delete(code));
          codes.forEach((code) => {
            delete nextTickerVersionByCode[code];
          });
          set({ tickers: newTickers, tickerVersionByCode: nextTickerVersionByCode });
        } else if (type === 'orderbook') {
          const newOrderbooks = new Map(state.orderbooks);
          const nextOrderbookVersionByCode = { ...state.orderbookVersionByCode };
          codes.forEach((code) => newOrderbooks.delete(code));
          codes.forEach((code) => {
            delete nextOrderbookVersionByCode[code];
          });
          set({ orderbooks: newOrderbooks, orderbookVersionByCode: nextOrderbookVersionByCode });
        } else if (type === 'trade') {
          const newTrades = new Map(state.trades);
          const nextTradeVersionByCode = { ...state.tradeVersionByCode };
          codes.forEach((code) => newTrades.delete(code));
          codes.forEach((code) => {
            delete nextTradeVersionByCode[code];
          });
          set({ trades: newTrades, tradeVersionByCode: nextTradeVersionByCode });
        }
      } else {
        if (type === 'ticker') set({ tickers: new Map(), tickerVersionByCode: {} });
        else if (type === 'orderbook') set({ orderbooks: new Map(), orderbookVersionByCode: {} });
        else if (type === 'trade') set({ trades: new Map(), tradeVersionByCode: {} });
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
export const selectTicker = (code: string) => (state: BithumbWebSocketStore) => ({
  version: state.tickerVersionByCode[code] ?? 0,
  ticker: state.tickers.get(code),
});

/**
 * 특정 마켓의 Orderbook만 구독
 */
export const selectOrderbook = (code: string) => (state: BithumbWebSocketStore) => ({
  version: state.orderbookVersionByCode[code] ?? 0,
  orderbook: state.orderbooks.get(code),
});

/**
 * 특정 마켓의 Trade만 구독
 */
export const selectTrade = (code: string) => (state: BithumbWebSocketStore) => ({
  version: state.tradeVersionByCode[code] ?? 0,
  trade: state.trades.get(code),
});

/**
 * 마지막 업데이트 시간 구독
 */
export const selectLastUpdated = (state: BithumbWebSocketStore) => state.lastUpdated;
