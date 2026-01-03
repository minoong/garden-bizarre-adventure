import type { CandlestickData, HistogramData, Time } from 'lightweight-charts';

import type { CandleTimeframe, DayCandle, MinuteCandle, MonthCandle, WeekCandle, WebSocketCandle } from '@/entities/upbit';

/**
 * KST 시간 문자열을 Unix timestamp로 변환
 * candle_date_time_kst는 타임존 정보가 없으므로 명시적으로 KST(+09:00)로 처리
 */
function parseKstToTimestamp(kstDateString: string): number {
  // KST 타임존을 명시적으로 추가
  return Math.floor(new Date(kstDateString + '+09:00').getTime() / 1000);
}

/**
 * 타임프레임에 따라 이전 캔들 시간 계산 (무한 스크롤용)
 * API의 `to` parameter는 inclusive이므로, 중복을 피하기 위해 1 단위 이전 시간을 반환
 */
export function getPreviousCandleTime(kstDateString: string, timeframe: CandleTimeframe): string {
  const date = new Date(kstDateString + '+09:00');

  if (timeframe.type === 'minutes') {
    date.setMinutes(date.getMinutes() - timeframe.unit);
  } else if (timeframe.type === 'days') {
    date.setDate(date.getDate() - 1);
  } else if (timeframe.type === 'weeks') {
    date.setDate(date.getDate() - 7);
  } else if (timeframe.type === 'months') {
    date.setMonth(date.getMonth() - 1);
  }

  // ISO 8601 형식으로 변환 (timezone 제거: YYYY-MM-DDTHH:mm:ss)
  return date.toISOString().slice(0, 19);
}

/**
 * 업비트 캔들을 차트 캔들로 변환
 */
export function toChartCandle(candle: MinuteCandle | DayCandle | WeekCandle | MonthCandle): CandlestickData<Time> {
  // KST 시간을 Unix timestamp로 변환 (타임존 명시)
  const time = parseKstToTimestamp(candle.candle_date_time_kst) as Time;

  return {
    time,
    open: candle.opening_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.trade_price,
  };
}

/**
 * 업비트 캔들 배열을 차트 캔들 배열로 변환
 * (API 응답은 최신순이므로 reverse 필요)
 */
export function toChartCandles(candles: (MinuteCandle | DayCandle | WeekCandle | MonthCandle)[]): CandlestickData<Time>[] {
  return candles.map(toChartCandle).reverse();
}

/**
 * 업비트 캔들을 볼륨 히스토그램 데이터로 변환
 */
export function toVolumeData(candle: MinuteCandle | DayCandle | WeekCandle | MonthCandle, upColor: string, downColor: string): HistogramData<Time> {
  const time = parseKstToTimestamp(candle.candle_date_time_kst) as Time;
  const isUp = candle.trade_price >= candle.opening_price;

  return {
    time,
    value: candle.candle_acc_trade_volume,
    color: isUp ? upColor : downColor,
  };
}

/**
 * 업비트 캔들 배열을 볼륨 데이터 배열로 변환
 */
export function toVolumeDataArray(candles: (MinuteCandle | DayCandle | WeekCandle | MonthCandle)[], upColor: string, downColor: string): HistogramData<Time>[] {
  return candles.map((c) => toVolumeData(c, upColor, downColor)).reverse();
}

/**
 * WebSocket 캔들을 차트 캔들로 변환
 */
export function wsToChartCandle(candle: WebSocketCandle): CandlestickData<Time> {
  const time = parseKstToTimestamp(candle.candle_date_time_kst) as Time;

  return {
    time,
    open: candle.opening_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.trade_price,
  };
}

/**
 * WebSocket 캔들을 볼륨 데이터로 변환
 */
export function wsToVolumeData(candle: WebSocketCandle, upColor: string, downColor: string): HistogramData<Time> {
  const time = parseKstToTimestamp(candle.candle_date_time_kst) as Time;
  const isUp = candle.trade_price >= candle.opening_price;

  return {
    time,
    value: candle.candle_acc_trade_volume,
    color: isUp ? upColor : downColor,
  };
}
