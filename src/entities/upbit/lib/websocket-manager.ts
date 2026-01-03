/**
 * 암호화폐 거래소 WebSocket 매니저
 *
 * 참고: 빗썸 WebSocket 사용 (업비트 호환)
 * - Rate limit 회피를 위해 빗썸 WebSocket 사용
 * - 요청/응답 형식은 업비트와 동일
 *
 * 최적화:
 * - requestAnimationFrame 기반 버퍼 플러시 (초당 60회 제한)
 * - Map 사용으로 O(1) 조회/업데이트
 * - 자동 재연결
 * - 메모리 효율적인 버퍼 관리
 */

import type { WebSocketCandle, WebSocketOrderbook, WebSocketTicker } from '../model/types';
import type { SubscriptionConfig, WebSocketBuffer, WebSocketStatus } from '../model/websocket-types';
import { UPBIT_WEBSOCKET_URL } from '../model/constants';

type MessageHandler = (tickers: Map<string, WebSocketTicker>, orderbooks: Map<string, WebSocketOrderbook>, candles: Map<string, WebSocketCandle>) => void;

type StatusHandler = (status: WebSocketStatus, error?: string) => void;

interface WebSocketManagerOptions {
  /** 재연결 시도 간격 (ms) */
  reconnectInterval?: number;
  /** 최대 재연결 시도 횟수 */
  maxReconnectAttempts?: number;
  /** 버퍼 플러시 간격 (ms) - 0이면 rAF 사용 */
  flushInterval?: number;
}

const DEFAULT_OPTIONS: Required<WebSocketManagerOptions> = {
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  flushInterval: 100, // 100ms = 초당 10회 업데이트
};

/**
 * Binary 데이터를 JSON으로 디코딩
 */
function decodeMessage(data: ArrayBuffer): WebSocketTicker | WebSocketOrderbook | WebSocketCandle {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(new Uint8Array(data));
  return JSON.parse(text);
}

/**
 * 구독 요청 메시지 생성
 */
function createSubscribeMessage(subscriptions: SubscriptionConfig[]): string {
  const ticket = { ticket: `upbit-${Date.now()}` };
  const format = { format: 'DEFAULT' };

  const typeMessages = subscriptions.map((sub) => {
    const base: Record<string, unknown> = {
      type: sub.type === 'candle' ? sub.candleType : sub.type,
      codes: sub.codes,
    };

    if (sub.isOnlySnapshot) base.isOnlySnapshot = true;
    if (sub.isOnlyRealtime) base.isOnlyRealtime = true;

    return base;
  });

  return JSON.stringify([ticket, ...typeMessages, format]);
}

export class UpbitWebSocketManager {
  private socket: WebSocket | null = null;
  private options: Required<WebSocketManagerOptions>;
  private subscriptions: SubscriptionConfig[] = [];
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // 버퍼링
  private buffer: WebSocketBuffer = { tickers: [], orderbooks: [], candles: [] };
  private flushScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  // 핸들러
  private onMessage: MessageHandler | null = null;
  private onStatusChange: StatusHandler | null = null;

  // 현재 상태 (Map으로 O(1) 조회)
  private tickerMap = new Map<string, WebSocketTicker>();
  private orderbookMap = new Map<string, WebSocketOrderbook>();
  private candleMap = new Map<string, WebSocketCandle>();

  constructor(options?: WebSocketManagerOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 메시지 핸들러 설정
   */
  setMessageHandler(handler: MessageHandler): void {
    this.onMessage = handler;
  }

  /**
   * 상태 변경 핸들러 설정
   */
  setStatusHandler(handler: StatusHandler): void {
    this.onStatusChange = handler;
  }

  /**
   * WebSocket 연결
   */
  connect(subscriptions: SubscriptionConfig[]): void {
    this.subscriptions = subscriptions;
    this.reconnectAttempts = 0;
    this.doConnect();
  }

  /**
   * 실제 연결 수행
   */
  private doConnect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    this.onStatusChange?.('connecting');

    try {
      this.socket = new WebSocket(UPBIT_WEBSOCKET_URL);
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      this.onStatusChange?.('disconnected', String(error));
      this.scheduleReconnect();
    }
  }

  /**
   * 연결 성공 핸들러
   */
  private handleOpen(): void {
    this.reconnectAttempts = 0;
    this.onStatusChange?.('connected');

    if (this.socket?.readyState === WebSocket.OPEN && this.subscriptions.length > 0) {
      const message = createSubscribeMessage(this.subscriptions);
      this.socket.send(message);
    }
  }

  /**
   * 메시지 수신 핸들러
   */
  private handleMessage(event: MessageEvent<ArrayBuffer>): void {
    try {
      const data = decodeMessage(event.data);

      // 타입별로 버퍼에 추가
      if ('type' in data) {
        if (data.type === 'ticker') {
          this.buffer.tickers.push(data as WebSocketTicker);
        } else if (data.type === 'orderbook') {
          this.buffer.orderbooks.push(data as WebSocketOrderbook);
        } else if (typeof data.type === 'string' && data.type.startsWith('candle')) {
          this.buffer.candles.push(data as WebSocketCandle);
        }
      }

      // 플러시 스케줄링
      this.scheduleFlush();
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error);
    }
  }

  /**
   * 버퍼 플러시 스케줄링
   */
  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;

    if (this.options.flushInterval === 0) {
      // requestAnimationFrame 사용
      requestAnimationFrame(() => this.flushBuffer());
    } else {
      // 타이머 사용
      this.flushTimer = setTimeout(() => this.flushBuffer(), this.options.flushInterval);
    }
  }

  /**
   * 버퍼 플러시 - Map에 병합 후 핸들러 호출
   */
  private flushBuffer(): void {
    this.flushScheduled = false;

    const { tickers, orderbooks, candles } = this.buffer;

    // 버퍼가 비어있으면 스킵
    if (tickers.length === 0 && orderbooks.length === 0 && candles.length === 0) {
      return;
    }

    // Map에 병합 (마지막 값만 유지 - 최신 데이터)
    for (const ticker of tickers) {
      this.tickerMap.set(ticker.code, ticker);
    }
    for (const orderbook of orderbooks) {
      this.orderbookMap.set(orderbook.code, orderbook);
    }
    for (const candle of candles) {
      this.candleMap.set(candle.code, candle);
    }

    // 버퍼 초기화
    this.buffer = { tickers: [], orderbooks: [], candles: [] };

    // 핸들러 호출
    this.onMessage?.(this.tickerMap, this.orderbookMap, this.candleMap);
  }

  /**
   * 연결 종료 핸들러
   */
  private handleClose(): void {
    this.onStatusChange?.('disconnected');
    this.scheduleReconnect();
  }

  /**
   * 에러 핸들러
   */
  private handleError(): void {
    this.socket?.close();
  }

  /**
   * 재연결 스케줄링
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.onStatusChange?.('disconnected', 'Max reconnect attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.onStatusChange?.('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.doConnect();
    }, this.options.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * 구독 추가
   */
  subscribe(subscription: SubscriptionConfig): void {
    // 기존 구독에 추가
    const existingIndex = this.subscriptions.findIndex((s) => s.type === subscription.type);

    if (existingIndex >= 0) {
      // 같은 타입이면 codes 병합
      const existing = this.subscriptions[existingIndex];
      const mergedCodes = [...new Set([...existing.codes, ...subscription.codes])];
      this.subscriptions[existingIndex] = { ...existing, codes: mergedCodes };
    } else {
      this.subscriptions.push(subscription);
    }

    // 연결되어 있으면 구독 메시지 전송
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = createSubscribeMessage([subscription]);
      this.socket.send(message);
    }
  }

  /**
   * 구독 해제 (특정 타입의 특정 코드만)
   */
  unsubscribe(type: SubscriptionConfig['type'], codes?: string[]): void {
    if (codes) {
      // 특정 코드만 제거
      const index = this.subscriptions.findIndex((s) => s.type === type);
      if (index >= 0) {
        const sub = this.subscriptions[index];
        sub.codes = sub.codes.filter((c) => !codes.includes(c));
        if (sub.codes.length === 0) {
          this.subscriptions.splice(index, 1);
        }
      }

      // Map에서도 제거
      for (const code of codes) {
        if (type === 'ticker') this.tickerMap.delete(code);
        else if (type === 'orderbook') this.orderbookMap.delete(code);
        else if (type === 'candle') this.candleMap.delete(code);
      }
    } else {
      // 해당 타입 전체 제거
      this.subscriptions = this.subscriptions.filter((s) => s.type !== type);

      if (type === 'ticker') this.tickerMap.clear();
      else if (type === 'orderbook') this.orderbookMap.clear();
      else if (type === 'candle') this.candleMap.clear();
    }
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.socket) {
      this.socket.onclose = null; // 재연결 방지
      this.socket.close();
      this.socket = null;
    }

    this.subscriptions = [];
    this.buffer = { tickers: [], orderbooks: [], candles: [] };
    this.tickerMap.clear();
    this.orderbookMap.clear();
    this.candleMap.clear();

    this.onStatusChange?.('disconnected');
  }

  /**
   * 현재 연결 상태
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * 현재 Ticker Map 반환
   */
  getTickers(): Map<string, WebSocketTicker> {
    return this.tickerMap;
  }

  /**
   * 현재 Orderbook Map 반환
   */
  getOrderbooks(): Map<string, WebSocketOrderbook> {
    return this.orderbookMap;
  }

  /**
   * 현재 Candle Map 반환
   */
  getCandles(): Map<string, WebSocketCandle> {
    return this.candleMap;
  }
}

// 싱글톤 인스턴스
let managerInstance: UpbitWebSocketManager | null = null;

/**
 * 싱글톤 매니저 인스턴스 반환
 */
export function getUpbitWebSocketManager(options?: WebSocketManagerOptions): UpbitWebSocketManager {
  if (!managerInstance) {
    managerInstance = new UpbitWebSocketManager(options);
  }
  return managerInstance;
}

/**
 * 싱글톤 매니저 인스턴스 리셋
 */
export function resetUpbitWebSocketManager(): void {
  if (managerInstance) {
    managerInstance.disconnect();
    managerInstance = null;
  }
}
