// ============================================================
// Types
// ============================================================
export type {
  // 공통
  ChangeType,
  StreamType,
  MinuteUnit,
  CandleTimeframe,
  WebSocketCandleType,
  // 마켓
  Market,
  MarketEvent,
  MarketCaution,
  MarketsParams,
  // 현재가
  Ticker,
  TickerParams,
  // 캔들
  CandleBase,
  MinuteCandle,
  DayCandle,
  WeekCandle,
  MonthCandle,
  Candle,
  MinuteCandlesParams,
  DayCandlesParams,
  PeriodCandlesParams,
  // WebSocket
  WebSocketTicker,
  WebSocketOrderbook,
  WebSocketCandle,
  OrderbookUnit,
  WebSocketTicket,
  WebSocketFormat,
  WebSocketTickerRequest,
  WebSocketOrderbookRequest,
  WebSocketCandleRequest,
  WebSocketRequest,
  WebSocketResponse,
  // 유틸
  ParsedMarketCode,
} from './model/types';

// ============================================================
// Constants
// ============================================================
export {
  // API URL
  UPBIT_API_BASE_URL,
  UPBIT_WEBSOCKET_URL,
  UPBIT_ENDPOINTS,
  // 캔들 단위
  MINUTE_UNITS,
  MINUTE_UNIT_LABELS,
  CANDLE_TYPE_LABELS,
  MINUTE_UNIT_TO_WS_TYPE,
  // Query
  UPBIT_QUERY_KEYS,
  UPBIT_STALE_TIME,
  UPBIT_GC_TIME,
  // 제한
  MAX_CANDLE_COUNT,
  DEFAULT_CANDLE_COUNT,
  // 변동 상태
  CHANGE_TYPE,
  CHANGE_TYPE_LABELS,
  CHANGE_TYPE_COLORS,
  // 마켓
  DEFAULT_MARKET,
  POPULAR_KRW_MARKETS,
  MARKET_TYPES,
} from './model/constants';

// ============================================================
// API Client
// ============================================================
export { upbitClient } from './api/client';

// ============================================================
// API Functions
// ============================================================
export { fetchMarkets, filterKrwMarkets, filterBtcMarkets, filterUsdtMarkets } from './api/markets';
export { fetchTicker, fetchSingleTicker } from './api/ticker';
export { fetchMinuteCandles, fetchDayCandles, fetchWeekCandles, fetchMonthCandles, fetchCandles } from './api/candles';

// ============================================================
// Hooks
// ============================================================
export { useMarkets, useKrwMarkets, useBtcMarkets, useUsdtMarkets } from './hooks/use-markets';
export { useTicker, useSingleTicker, useTickerMap } from './hooks/use-ticker';
export { useCandles, useMinuteCandles, useDayCandles, useWeekCandles, useMonthCandles } from './hooks/use-candles';

// ============================================================
// Utilities
// ============================================================
export {
  parseMarketCode,
  getMarketLabel,
  formatPrice,
  formatChangeRate,
  formatChangePrice,
  formatVolume,
  formatCoinVolume,
  getChangeLabel,
  getChangeColor,
  formatTimestamp,
  formatCandleTime,
} from './lib/format';

// ============================================================
// WebSocket Types
// ============================================================
export type {
  WebSocketStatus,
  SubscriptionType,
  SubscriptionConfig,
  UpbitWebSocketState,
  UpbitWebSocketActions,
  UpbitWebSocketStore,
} from './model/websocket-types';

// ============================================================
// WebSocket Store (Zustand)
// ============================================================
export {
  useUpbitWebSocketStore,
  selectWebSocketStatus,
  selectTicker,
  selectOrderbook,
  selectCandle,
  selectAllTickers,
  selectTickerArray,
  selectLastUpdated,
} from './model/store';

// ============================================================
// WebSocket Hooks
// ============================================================
export {
  // 기본 훅
  useUpbitSocketStatus,
  useUpbitSocketActions,
  // Ticker 훅
  useRealtimeTicker,
  useRealtimeTickerMap,
  useRealtimeTickerArray,
  useRealtimeTickers,
  // Orderbook 훅
  useRealtimeOrderbook,
  // Candle 훅
  useRealtimeCandle,
  // 통합 훅
  useUpbitSocket,
} from './hooks/use-upbit-socket';

// ============================================================
// WebSocket Manager
// ============================================================
export { UpbitWebSocketManager, getUpbitWebSocketManager, resetUpbitWebSocketManager } from './lib/websocket-manager';
