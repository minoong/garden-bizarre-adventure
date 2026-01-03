/**
 * 암호화폐 거래소 API 상수 정의
 *
 * 참고: 빗썸 API 사용 (업비트 호환)
 * - 업비트 API rate limit (HTTP 429) 회피를 위해 빗썸 API 사용
 * - 빗썸은 업비트와 동일한 REST/WebSocket API 스펙 제공
 * - 엔드포인트와 응답 형식은 업비트와 호환
 */

import type { MinuteUnit, WebSocketCandleType } from './types';

// ============================================================
// API URL
// ============================================================

/** 빗썸 REST API 기본 URL (업비트 호환) */
export const UPBIT_API_BASE_URL = process.env.NEXT_PUBLIC_BITHUMB_REST_API_URL || 'https://api.bithumb.com';

/** 빗썸 WebSocket URL */
export const UPBIT_WEBSOCKET_URL = `${process.env.NEXT_PUBLIC_BITHUMB_WEBSOCKET_API_URL}/websocket/v1` || 'wss://ws-api.bithumb.com/websocket/v1';

// ============================================================
// API 엔드포인트
// ============================================================

export const UPBIT_ENDPOINTS = {
  /** 마켓 목록 조회 */
  MARKETS: '/v1/market/all',
  /** 현재가 조회 */
  TICKER: '/v1/ticker',
  /** 분봉 캔들 조회 */
  CANDLES_MINUTES: '/v1/candles/minutes',
  /** 일봉 캔들 조회 */
  CANDLES_DAYS: '/v1/candles/days',
  /** 주봉 캔들 조회 */
  CANDLES_WEEKS: '/v1/candles/weeks',
  /** 월봉 캔들 조회 */
  CANDLES_MONTHS: '/v1/candles/months',
} as const;

// ============================================================
// 캔들 단위
// ============================================================

/** 사용 가능한 분봉 단위 */
export const MINUTE_UNITS: MinuteUnit[] = [1, 3, 5, 10, 15, 30, 60, 240];

/** 분봉 단위 라벨 */
export const MINUTE_UNIT_LABELS: Record<MinuteUnit, string> = {
  1: '1분',
  3: '3분',
  5: '5분',
  10: '10분',
  15: '15분',
  30: '30분',
  60: '1시간',
  240: '4시간',
};

/** 캔들 타입 라벨 */
export const CANDLE_TYPE_LABELS = {
  minutes: '분',
  days: '일',
  weeks: '주',
  months: '월',
} as const;

/** 분봉 단위 → WebSocket 타입 매핑 */
export const MINUTE_UNIT_TO_WS_TYPE: Record<MinuteUnit, WebSocketCandleType> = {
  1: 'candle.1m',
  3: 'candle.3m',
  5: 'candle.5m',
  10: 'candle.10m',
  15: 'candle.15m',
  30: 'candle.30m',
  60: 'candle.60m',
  240: 'candle.240m',
};

// ============================================================
// TanStack Query 키
// ============================================================

export const UPBIT_QUERY_KEYS = {
  /** 마켓 목록 */
  markets: ['upbit', 'markets'] as const,
  /** 마켓 목록 (상세) */
  marketsWithDetails: ['upbit', 'markets', { isDetails: true }] as const,
  /** 현재가 */
  ticker: (markets: string[]) => ['upbit', 'ticker', markets] as const,
  /** 분봉 캔들 */
  minuteCandles: (market: string, unit: MinuteUnit) => ['upbit', 'candles', 'minutes', market, unit] as const,
  /** 일봉 캔들 */
  dayCandles: (market: string) => ['upbit', 'candles', 'days', market] as const,
  /** 주봉 캔들 */
  weekCandles: (market: string) => ['upbit', 'candles', 'weeks', market] as const,
  /** 월봉 캔들 */
  monthCandles: (market: string) => ['upbit', 'candles', 'months', market] as const,
  /** 캔들 (통합) */
  candles: (market: string, timeframe: string) => ['upbit', 'candles', timeframe, market] as const,
} as const;

// ============================================================
// TanStack Query 캐싱 시간 (ms)
// ============================================================

export const UPBIT_STALE_TIME = {
  /** 마켓 목록: 5분 */
  MARKETS: 5 * 60 * 1000,
  /** 현재가: 3초 */
  TICKER: 3 * 1000,
  /** 캔들: 10초 */
  CANDLES: 10 * 1000,
} as const;

export const UPBIT_GC_TIME = {
  /** 마켓 목록: 30분 */
  MARKETS: 30 * 60 * 1000,
  /** 현재가: 1분 */
  TICKER: 60 * 1000,
  /** 캔들: 5분 */
  CANDLES: 5 * 60 * 1000,
} as const;

// ============================================================
// 기본 요청 제한
// ============================================================

/** 캔들 최대 요청 개수 */
export const MAX_CANDLE_COUNT = 200;

/** 기본 캔들 요청 개수 */
export const DEFAULT_CANDLE_COUNT = 200;

// ============================================================
// 변동 상태
// ============================================================

export const CHANGE_TYPE = {
  RISE: 'RISE',
  EVEN: 'EVEN',
  FALL: 'FALL',
} as const;

export const CHANGE_TYPE_LABELS = {
  RISE: '상승',
  EVEN: '보합',
  FALL: '하락',
} as const;

export const CHANGE_TYPE_COLORS = {
  RISE: '#c84a31',
  EVEN: '#000000',
  FALL: '#1261c4',
} as const;

// ============================================================
// 주요 마켓
// ============================================================

/** 기본 마켓 코드 */
export const DEFAULT_MARKET = 'KRW-BTC' as const;

/** KRW 마켓 주요 코인 */
export const POPULAR_KRW_MARKETS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-SOL', 'KRW-DOGE', 'KRW-ADA'] as const;

/** 마켓 타입 */
export const MARKET_TYPES = {
  KRW: 'KRW',
  BTC: 'BTC',
  USDT: 'USDT',
} as const;
