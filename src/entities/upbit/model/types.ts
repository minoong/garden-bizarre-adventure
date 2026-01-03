/**
 * 업비트 API 타입 정의
 */

// ============================================================
// 공통 타입
// ============================================================

/** 변동 상태 */
export type ChangeType = 'RISE' | 'EVEN' | 'FALL';

/** 스트림 타입 (WebSocket) */
export type StreamType = 'SNAPSHOT' | 'REALTIME';

/** 분봉 단위 */
export type MinuteUnit = 1 | 3 | 5 | 10 | 15 | 30 | 60 | 240;

/** 캔들 타임프레임 */
export type CandleTimeframe = { type: 'minutes'; unit: MinuteUnit } | { type: 'days' } | { type: 'weeks' } | { type: 'months' };

/** WebSocket 캔들 타입 */
export type WebSocketCandleType =
  | 'candle.1s'
  | 'candle.1m'
  | 'candle.3m'
  | 'candle.5m'
  | 'candle.10m'
  | 'candle.15m'
  | 'candle.30m'
  | 'candle.60m'
  | 'candle.240m';

// ============================================================
// REST API - 마켓 (Market)
// ============================================================

/** 주의 종목 상세 */
export interface MarketCaution {
  PRICE_FLUCTUATIONS: boolean;
  TRADING_VOLUME_SOARING: boolean;
  DEPOSIT_AMOUNT_SOARING: boolean;
  GLOBAL_PRICE_DIFFERENCES: boolean;
  CONCENTRATION_OF_SMALL_ACCOUNTS: boolean;
}

/** 종목 경보 정보 */
export interface MarketEvent {
  warning: boolean;
  caution: MarketCaution;
}

/** 마켓 정보 */
export interface Market {
  /** 마켓 코드 (예: KRW-BTC) */
  market: string;
  /** 한글명 */
  korean_name: string;
  /** 영문명 */
  english_name: string;
  /** 종목 경보 정보 (is_details=true 시) */
  market_event?: MarketEvent;
}

/** 마켓 목록 조회 파라미터 */
export interface MarketsParams {
  /** 상세 정보 포함 여부 */
  is_details?: boolean;
}

// ============================================================
// REST API - 현재가 (Ticker)
// ============================================================

/** 현재가 정보 */
export interface Ticker {
  /** 마켓 코드 */
  market: string;
  /** 최근 체결 일자 (UTC, yyyyMMdd) */
  trade_date: string;
  /** 최근 체결 시각 (UTC, HHmmss) */
  trade_time: string;
  /** 최근 체결 일자 (KST, yyyyMMdd) */
  trade_date_kst: string;
  /** 최근 체결 시각 (KST, HHmmss) */
  trade_time_kst: string;
  /** 시가 */
  opening_price: number;
  /** 고가 */
  high_price: number;
  /** 저가 */
  low_price: number;
  /** 현재가 (종가) */
  trade_price: number;
  /** 전일 종가 */
  prev_closing_price: number;
  /** 변동 상태 */
  change: ChangeType;
  /** 전일 대비 변화 금액 (절대값) */
  change_price: number;
  /** 전일 대비 변화율 (절대값) */
  change_rate: number;
  /** 부호가 있는 전일 대비 변화 금액 */
  signed_change_price: number;
  /** 부호가 있는 전일 대비 변화율 */
  signed_change_rate: number;
  /** 24시간 누적 거래 금액 */
  acc_trade_price_24h: number;
  /** 24시간 누적 거래량 */
  acc_trade_volume_24h: number;
  /** 52주 신고가 */
  highest_52_week_price: number;
  /** 52주 신고가 달성일 (yyyy-MM-dd) */
  highest_52_week_date: string;
  /** 52주 신저가 */
  lowest_52_week_price: number;
  /** 52주 신저가 달성일 (yyyy-MM-dd) */
  lowest_52_week_date: string;
  /** 타임스탬프 (ms) */
  timestamp: number;
}

/** 현재가 조회 파라미터 */
export interface TickerParams {
  /** 마켓 코드 (쉼표로 구분) */
  markets: string;
}

// ============================================================
// REST API - 캔들 (Candle)
// ============================================================

/** 캔들 기본 필드 */
export interface CandleBase {
  /** 마켓 코드 */
  market: string;
  /** 캔들 시작 시각 (UTC) */
  candle_date_time_utc: string;
  /** 캔들 시작 시각 (KST) */
  candle_date_time_kst: string;
  /** 시가 */
  opening_price: number;
  /** 고가 */
  high_price: number;
  /** 저가 */
  low_price: number;
  /** 종가 */
  trade_price: number;
  /** 마지막 틱 저장 시각 (ms) */
  timestamp: number;
  /** 누적 거래 금액 */
  candle_acc_trade_price: number;
  /** 누적 거래량 */
  candle_acc_trade_volume: number;
}

/** 분봉 캔들 */
export interface MinuteCandle extends CandleBase {
  /** 캔들 집계 단위 (분) */
  unit: MinuteUnit;
}

/** 일봉 캔들 */
export interface DayCandle extends CandleBase {
  /** 전일 종가 */
  prev_closing_price: number;
  /** 전일 대비 변화 금액 */
  change_price: number;
  /** 전일 대비 변화율 */
  change_rate: number;
  /** 종가 환산 가격 (환산 통화 요청 시) */
  converted_trade_price?: number;
}

/** 주봉 캔들 */
export interface WeekCandle extends CandleBase {
  /** 캔들 기간의 첫날 */
  first_day_of_period: string;
}

/** 월봉 캔들 */
export interface MonthCandle extends CandleBase {
  /** 캔들 기간의 첫날 */
  first_day_of_period: string;
}

/** 캔들 타입 (통합) */
export type Candle = MinuteCandle | DayCandle | WeekCandle | MonthCandle;

/** 분봉 조회 파라미터 */
export interface MinuteCandlesParams {
  /** 마켓 코드 */
  market: string;
  /** 마지막 캔들 시각 (ISO 8601) */
  to?: string;
  /** 캔들 개수 (최대 200) */
  count?: number;
}

/** 일봉 조회 파라미터 */
export interface DayCandlesParams {
  /** 마켓 코드 */
  market: string;
  /** 마지막 캔들 시각 (ISO 8601) */
  to?: string;
  /** 캔들 개수 (최대 200) */
  count?: number;
  /** 종가 환산 통화 (KRW) */
  converting_price_unit?: string;
}

/** 주봉/월봉 조회 파라미터 */
export interface PeriodCandlesParams {
  /** 마켓 코드 */
  market: string;
  /** 마지막 캔들 시각 (ISO 8601) */
  to?: string;
  /** 캔들 개수 (최대 200) */
  count?: number;
}

// ============================================================
// WebSocket - Ticker
// ============================================================

/** WebSocket Ticker 응답 */
export interface WebSocketTicker {
  /** 타입 */
  type: 'ticker';
  /** 마켓 코드 */
  code: string;
  /** 시가 */
  opening_price: number;
  /** 고가 */
  high_price: number;
  /** 저가 */
  low_price: number;
  /** 현재가 */
  trade_price: number;
  /** 전일 종가 */
  prev_closing_price: number;
  /** 변동 상태 */
  change: ChangeType;
  /** 변화 금액 */
  change_price: number;
  /** 변화율 */
  change_rate: number;
  /** 부호가 있는 변화 금액 */
  signed_change_price: number;
  /** 부호가 있는 변화율 */
  signed_change_rate: number;
  /** 거래량 */
  trade_volume: number;
  /** 누적 거래량 (KST 0시 기준) */
  acc_trade_volume: number;
  /** 24시간 누적 거래량 */
  acc_trade_volume_24h: number;
  /** 누적 거래대금 (KST 0시 기준) */
  acc_trade_price: number;
  /** 24시간 누적 거래 금액 */
  acc_trade_price_24h: number;
  /** 체결 일자 (KST, yyyyMMdd) */
  trade_date: string;
  /** 체결 시각 (KST, HHmmss) */
  trade_time: string;
  /** 체결 타임스탬프 (ms) */
  trade_timestamp: number;
  /** 매수/매도 구분 */
  ask_bid: 'ASK' | 'BID';
  /** 누적 매도량 */
  acc_ask_volume: number;
  /** 누적 매수량 */
  acc_bid_volume: number;
  /** 52주 최고가 */
  highest_52_week_price: number;
  /** 52주 최고가 달성일 */
  highest_52_week_date: string;
  /** 52주 최저가 */
  lowest_52_week_price: number;
  /** 52주 최저가 달성일 */
  lowest_52_week_date: string;
  /** 거래 상태 */
  market_state: string;
  /** 거래 정지 여부 */
  is_trading_suspended: boolean;
  /** 거래지원 종료일 */
  delisting_date: string | null;
  /** 유의 종목 여부 */
  market_warning: 'NONE' | 'CAUTION';
  /** 타임스탬프 (ms) */
  timestamp: number;
  /** 스트림 타입 */
  stream_type: StreamType;
}

// ============================================================
// WebSocket - Orderbook
// ============================================================

/** 호가 단위 */
export interface OrderbookUnit {
  /** 매도 호가 */
  ask_price: number;
  /** 매수 호가 */
  bid_price: number;
  /** 매도 잔량 */
  ask_size: number;
  /** 매수 잔량 */
  bid_size: number;
}

/** WebSocket Orderbook 응답 */
export interface WebSocketOrderbook {
  /** 타입 */
  type: 'orderbook';
  /** 마켓 코드 */
  code: string;
  /** 호가 매도 총 잔량 */
  total_ask_size: number;
  /** 호가 매수 총 잔량 */
  total_bid_size: number;
  /** 호가 데이터 배열 */
  orderbook_units: OrderbookUnit[];
  /** 타임스탬프 (ms) */
  timestamp: number;
  /** 모아보기 단위 */
  level?: number;
  /** 스트림 타입 */
  stream_type: StreamType;
}

// ============================================================
// WebSocket - Candle
// ============================================================

/** WebSocket Candle 응답 */
export interface WebSocketCandle {
  /** 캔들 타입 */
  type: WebSocketCandleType;
  /** 마켓 코드 */
  code: string;
  /** 캔들 시작 시각 (UTC) */
  candle_date_time_utc: string;
  /** 캔들 시작 시각 (KST) */
  candle_date_time_kst: string;
  /** 시가 */
  opening_price: number;
  /** 고가 */
  high_price: number;
  /** 저가 */
  low_price: number;
  /** 종가 */
  trade_price: number;
  /** 누적 거래량 */
  candle_acc_trade_volume: number;
  /** 누적 거래 금액 */
  candle_acc_trade_price: number;
  /** 타임스탬프 (ms) */
  timestamp: number;
  /** 스트림 타입 */
  stream_type: StreamType;
}

// ============================================================
// WebSocket - 요청 메시지
// ============================================================

/** WebSocket 티켓 */
export interface WebSocketTicket {
  ticket: string;
}

/** WebSocket 포맷 */
export interface WebSocketFormat {
  format: 'DEFAULT' | 'SIMPLE';
}

/** WebSocket Ticker 요청 */
export interface WebSocketTickerRequest {
  type: 'ticker';
  codes: string[];
  is_only_snapshot?: boolean;
  is_only_realtime?: boolean;
}

/** WebSocket Orderbook 요청 */
export interface WebSocketOrderbookRequest {
  type: 'orderbook';
  codes: string[];
  is_only_snapshot?: boolean;
  is_only_realtime?: boolean;
}

/** WebSocket Candle 요청 */
export interface WebSocketCandleRequest {
  type: WebSocketCandleType;
  codes: string[];
  is_only_snapshot?: boolean;
  is_only_realtime?: boolean;
}

/** WebSocket 요청 메시지 타입 */
export type WebSocketRequest = WebSocketTickerRequest | WebSocketOrderbookRequest | WebSocketCandleRequest;

/** WebSocket 응답 메시지 타입 */
export type WebSocketResponse = WebSocketTicker | WebSocketOrderbook | WebSocketCandle;

// ============================================================
// 파싱된 마켓 코드
// ============================================================

/** 파싱된 마켓 코드 */
export interface ParsedMarketCode {
  /** 기준 통화 (예: KRW) */
  quote: string;
  /** 거래 대상 (예: BTC) */
  base: string;
}
