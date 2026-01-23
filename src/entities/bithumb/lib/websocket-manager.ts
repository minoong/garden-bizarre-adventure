/**
 * 빗썸 거래소 WebSocket 매니저
 *
 * 참고: 빗썸 V2 WebSocket 사용 (업비트 호환)
 *
 * 최적화:
 * - requestAnimationFrame 기반 버퍼 플러시 (초당 60회 제한)
 * - Map 사용으로 O(1) 조회/업데이트
 * - 자동 재연결
 * - 메모리 효율적인 버퍼 관리
 */

import type { WebSocketOrderbook, WebSocketTicker, WebSocketTrade } from '../model/types';
import type { SubscriptionConfig, WebSocketBuffer, WebSocketStatus } from '../model/websocket-types';
import { BITHUMB_WEBSOCKET_URL } from '../model/constants';

type MessageHandler = (tickers: Map<string, WebSocketTicker>, orderbooks: Map<string, WebSocketOrderbook>, trades: Map<string, WebSocketTrade>) => void;

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
  flushInterval: 0, // 100ms = 초당 10회 업데이트
};

/**
 * Binary 데이터를 JSON으로 디코딩
 */
function decodeMessage(data: ArrayBuffer): WebSocketTicker | WebSocketOrderbook | WebSocketTrade {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(new Uint8Array(data));
  return JSON.parse(text);
}

/**
 * 구독 요청 메시지 생성
 */
function createSubscribeMessage(subscriptions: SubscriptionConfig[]): string {
  const ticket = { ticket: `bithumb-${Date.now()}` };
  const format = { format: 'DEFAULT' };

  const typeMessages = subscriptions.map((sub) => {
    const base: Record<string, unknown> = {
      type: sub.type,
      codes: sub.codes.map((code) => code.toUpperCase()),
    };

    if (sub.isOnlySnapshot) base.isOnlySnapshot = true;
    if (sub.isOnlyRealtime) base.isOnlyRealtime = true;

    return base;
  });

  return JSON.stringify([ticket, ...typeMessages, format]);
}

export class BithumbWebSocketManager {
  private socket: WebSocket | null = null;
  private options: Required<WebSocketManagerOptions>;

  // 구독 관리 (Reference Counting)
  // Key (Type+Flags) -> Code -> Count
  private subscribers = new Map<string, Map<string, number>>();
  // Key에서 Config 복원용
  private subscriberConfigs = new Map<string, Omit<SubscriptionConfig, 'codes'>>();

  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // 버퍼링
  private buffer: WebSocketBuffer = { tickers: [], orderbooks: [], trades: [] };
  private flushScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  // 핸들러
  private onMessage: MessageHandler | null = null;
  private onStatusChange: StatusHandler | null = null;

  // 현재 상태 (Map으로 O(1) 조회)
  private tickerMap = new Map<string, WebSocketTicker>();
  private orderbookMap = new Map<string, WebSocketOrderbook>();
  private tradeMap = new Map<string, WebSocketTrade>();

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
   * WebSocket 연결 및 구독 추가
   */
  connect(subscriptions: SubscriptionConfig[]): void {
    // 1. 구독 목록 추가 (Ref Count 증가)
    subscriptions.forEach((sub) => this.addSubscription(sub));

    // 2. 연결이 안되어 있으면 연결
    if (!this.isConnected && !this.isConnecting) {
      this.reconnectAttempts = 0;
      this.doConnect();
    } else if (this.isConnected) {
      // 3. 이미 연결되어 있으면 구독 갱신 요청
      this.sendSubscribeMessage();
    }
  }

  /**
   * 실제 연결 수행
   */
  private doConnect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.onStatusChange?.('connecting');

    try {
      this.socket = new WebSocket(BITHUMB_WEBSOCKET_URL);
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

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendSubscribeMessage();
    }
  }

  /**
   * 구독 Key 생성
   */
  private getSubscriptionKey(config: SubscriptionConfig): string {
    return `${config.type}|${config.isOnlySnapshot ?? false}|${config.isOnlyRealtime ?? false}`;
  }

  /**
   * 현재 구독 목록을 바탕으로 구독 메시지 전송
   */
  private sendSubscribeMessage(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const activeSubscriptions: SubscriptionConfig[] = [];

    this.subscribers.forEach((codeMap, key) => {
      const codes = Array.from(codeMap.keys());
      if (codes.length > 0) {
        const configBase = this.subscriberConfigs.get(key);
        if (configBase) {
          activeSubscriptions.push({
            ...configBase,
            codes: codes,
          });
        }
      }
    });

    if (activeSubscriptions.length > 0) {
      const message = createSubscribeMessage(activeSubscriptions);
      this.socket.send(message);
    }
  }

  /**
   * 메시지 수신 핸들러
   */
  private handleMessage(event: MessageEvent<ArrayBuffer>): void {
    try {
      const data = decodeMessage(event.data);
      if ('status' in data) return; // 연결 성공 메시지 무시

      // 타입별로 버퍼에 추가
      if ('type' in data) {
        if (data.type === 'ticker') {
          this.buffer.tickers.push(data as WebSocketTicker);
        } else if (data.type === 'orderbook') {
          this.buffer.orderbooks.push(data as WebSocketOrderbook);
        } else if (data.type === 'trade') {
          this.buffer.trades.push(data as WebSocketTrade);
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

    const { tickers, orderbooks, trades } = this.buffer;

    // 버퍼가 비어있으면 스킵
    if (tickers.length === 0 && orderbooks.length === 0 && trades.length === 0) {
      return;
    }

    // Map에 병합 (마지막 값만 유지 - 최신 데이터)
    for (const ticker of tickers) {
      this.tickerMap.set(ticker.code, ticker);
    }
    for (const orderbook of orderbooks) {
      this.orderbookMap.set(orderbook.code, orderbook);
    }
    for (const trade of trades) {
      this.tradeMap.set(trade.code, trade);
    }

    // 버퍼 초기화
    this.buffer = { tickers: [], orderbooks: [], trades: [] };

    // 핸들러 호출
    this.onMessage?.(this.tickerMap, this.orderbookMap, this.tradeMap);
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
   * 구독 목록에 추가 (Reference Counting)
   */
  private addSubscription(subscription: SubscriptionConfig): void {
    const key = this.getSubscriptionKey(subscription);

    let codeMap = this.subscribers.get(key);
    if (!codeMap) {
      codeMap = new Map();
      this.subscribers.set(key, codeMap);
      // Config 정보 저장 (codes 제외)
      const { codes: _codes, ...configRest } = subscription;
      this.subscriberConfigs.set(key, configRest);
    }

    subscription.codes.forEach((code) => {
      const count = codeMap!.get(code) || 0;
      codeMap!.set(code, count + 1);
    });
  }

  /**
   * 구독 추가 (공개 메서드)
   */
  subscribe(subscription: SubscriptionConfig): void {
    this.addSubscription(subscription);

    // 연결되어 있으면 구독 메시지 갱신
    if (this.isConnected) {
      this.sendSubscribeMessage();
    }
  }

  /**
   * 구독 해제 (특정 타입의 특정 코드만)
   */
  unsubscribe(type: SubscriptionConfig['type'], codes?: string[]): void {
    const targetKeys: string[] = [];
    this.subscribers.forEach((_, key) => {
      if (key.startsWith(`${type}|`)) {
        targetKeys.push(key);
      }
    });

    if (targetKeys.length === 0) return;

    let needsUpdate = false;

    if (codes) {
      // 특정 코드만 제거
      codes.forEach((code) => {
        targetKeys.forEach((key) => {
          const codeMap = this.subscribers.get(key);
          if (codeMap) {
            const count = codeMap.get(code);
            if (count !== undefined) {
              if (count > 1) {
                codeMap.set(code, count - 1);
              } else {
                codeMap.delete(code);
                // 데이터 Map에서도 제거 (더 이상 구독자가 없을 때)
                if (!this.isSubscribedAnywhere(type, code)) {
                  if (type === 'ticker') this.tickerMap.delete(code);
                  else if (type === 'orderbook') this.orderbookMap.delete(code);
                  else if (type === 'trade') this.tradeMap.delete(code);
                }
                needsUpdate = true;
              }
            }
          }
        });
      });
    } else {
      // 해당 타입 전체 제거
      targetKeys.forEach((key) => {
        this.subscribers.delete(key);
        this.subscriberConfigs.delete(key);
      });

      if (type === 'ticker') this.tickerMap.clear();
      else if (type === 'orderbook') this.orderbookMap.clear();
      else if (type === 'trade') this.tradeMap.clear();

      needsUpdate = true;
    }

    if (needsUpdate && this.isConnected) {
      this.sendSubscribeMessage();
    }
  }

  /**
   * 특정 코드가 어떤 플래그로든 구독되어 있는지 확인
   */
  private isSubscribedAnywhere(type: SubscriptionConfig['type'], code: string): boolean {
    for (const [key, codeMap] of this.subscribers) {
      if (key.startsWith(`${type}|`) && codeMap.has(code)) {
        return true;
      }
    }
    return false;
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

    this.subscribers.clear();
    this.subscriberConfigs.clear();
    this.buffer = { tickers: [], orderbooks: [], trades: [] };
    this.tickerMap.clear();
    this.orderbookMap.clear();
    this.tradeMap.clear();

    this.onStatusChange?.('disconnected');
  }

  /**
   * 현재 연결 상태
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  get isConnecting(): boolean {
    return this.socket?.readyState === WebSocket.CONNECTING;
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
   * 현재 Trade Map 반환
   */
  getTrades(): Map<string, WebSocketTrade> {
    return this.tradeMap;
  }
}

// 싱글톤 인스턴스
let managerInstance: BithumbWebSocketManager | null = null;

/**
 * 싱글톤 매니저 인스턴스 반환
 */
export function getBithumbWebSocketManager(options?: WebSocketManagerOptions): BithumbWebSocketManager {
  if (!managerInstance) {
    managerInstance = new BithumbWebSocketManager(options);
  }
  return managerInstance;
}

/**
 * 싱글톤 매니저 인스턴스 리셋
 */
export function resetBithumbWebSocketManager(): void {
  if (managerInstance) {
    managerInstance.disconnect();
    managerInstance = null;
  }
}
