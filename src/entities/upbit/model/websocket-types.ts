/**
 * WebSocket 관련 타입 정의
 */

import type { WebSocketCandle, WebSocketCandleType, WebSocketOrderbook, WebSocketTicker } from './types';

// ============================================================
// WebSocket 연결 상태
// ============================================================

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// ============================================================
// WebSocket 구독 타입
// ============================================================

export type SubscriptionType = 'ticker' | 'orderbook' | 'candle';

export interface SubscriptionConfig {
  type: SubscriptionType;
  codes: string[];
  /** candle 타입일 경우 필수 */
  candleType?: WebSocketCandleType;
  /** 스냅샷만 수신 */
  isOnlySnapshot?: boolean;
  /** 실시간만 수신 */
  isOnlyRealtime?: boolean;
}

// ============================================================
// WebSocket 스토어 상태
// ============================================================

export interface UpbitWebSocketState {
  /** 연결 상태 */
  status: WebSocketStatus;

  /** 현재가 데이터 (마켓코드 → Ticker) */
  tickers: Map<string, WebSocketTicker>;

  /** 호가 데이터 (마켓코드 → Orderbook) */
  orderbooks: Map<string, WebSocketOrderbook>;

  /** 캔들 데이터 (마켓코드 → Candle) */
  candles: Map<string, WebSocketCandle>;

  /** 마지막 업데이트 시간 */
  lastUpdated: number;

  /** 에러 메시지 */
  error: string | null;
}

export interface UpbitWebSocketActions {
  /** WebSocket 연결 */
  connect: (subscriptions: SubscriptionConfig[]) => void;

  /** WebSocket 연결 해제 */
  disconnect: () => void;

  /** 구독 추가 */
  subscribe: (subscription: SubscriptionConfig) => void;

  /** 구독 해제 */
  unsubscribe: (type: SubscriptionType, codes?: string[]) => void;

  /** 특정 마켓의 Ticker 조회 */
  getTicker: (code: string) => WebSocketTicker | undefined;

  /** 특정 마켓의 Orderbook 조회 */
  getOrderbook: (code: string) => WebSocketOrderbook | undefined;

  /** 특정 마켓의 Candle 조회 */
  getCandle: (code: string) => WebSocketCandle | undefined;

  /** 상태 초기화 */
  reset: () => void;
}

export type UpbitWebSocketStore = UpbitWebSocketState & UpbitWebSocketActions;

// ============================================================
// 내부 버퍼 타입
// ============================================================

export interface WebSocketBuffer {
  tickers: WebSocketTicker[];
  orderbooks: WebSocketOrderbook[];
  candles: WebSocketCandle[];
}
