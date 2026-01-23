/**
 * WebSocket 관련 타입 정의
 */

import type { WebSocketOrderbook, WebSocketTicker, WebSocketTrade } from './types';

// ============================================================
// WebSocket 연결 상태
// ============================================================

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// ============================================================
// WebSocket 구독 타입
// ============================================================

export type SubscriptionType = 'ticker' | 'orderbook' | 'trade';

export interface SubscriptionConfig {
  type: SubscriptionType;
  codes: string[];
  /** 스냅샷만 수신 */
  isOnlySnapshot?: boolean;
  /** 실시간만 수신 */
  isOnlyRealtime?: boolean;
}

// ============================================================
// WebSocket 스토어 상태
// ============================================================

export interface BithumbWebSocketState {
  /** 연결 상태 */
  status: WebSocketStatus;

  /** 현재가 데이터 (마켓코드 → Ticker) */
  tickers: Map<string, WebSocketTicker>;

  /** 호가 데이터 (마켓코드 → Orderbook) */
  orderbooks: Map<string, WebSocketOrderbook>;

  /** 체결 데이터 (마켓코드 → 최신 체결) */
  trades: Map<string, WebSocketTrade>;

  /** 마지막 업데이트 시간 */
  lastUpdated: number;

  /** 에러 메시지 */
  error: string | null;
}

export interface BithumbWebSocketActions {
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

  /** 특정 마켓의 Trade 조회 */
  getTrade: (code: string) => WebSocketTrade | undefined;

  /** 상태 초기화 */
  reset: () => void;
}

export type BithumbWebSocketStore = BithumbWebSocketState & BithumbWebSocketActions;

// ============================================================
// 내부 버퍼 타입
// ============================================================

export interface WebSocketBuffer {
  tickers: WebSocketTicker[];
  orderbooks: WebSocketOrderbook[];
  trades: WebSocketTrade[];
}
