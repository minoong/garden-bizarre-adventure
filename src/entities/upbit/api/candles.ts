import type {
  CandleTimeframe,
  DayCandle,
  DayCandlesParams,
  MinuteCandle,
  MinuteCandlesParams,
  MinuteUnit,
  MonthCandle,
  PeriodCandlesParams,
  WeekCandle,
} from '../model/types';
import { DEFAULT_CANDLE_COUNT, UPBIT_ENDPOINTS } from '../model/constants';

import { upbitClient } from './client';

/**
 * 분봉 캔들 조회
 * @param unit - 분 단위 (1, 3, 5, 10, 15, 30, 60, 240)
 * @param params - 조회 옵션
 * @returns 분봉 캔들 목록
 */
export async function fetchMinuteCandles(unit: MinuteUnit, params: MinuteCandlesParams): Promise<MinuteCandle[]> {
  const { data } = await upbitClient.get<MinuteCandle[]>(`${UPBIT_ENDPOINTS.CANDLES_MINUTES}/${unit}`, {
    params: {
      market: params.market,
      to: params.to,
      count: params.count ?? DEFAULT_CANDLE_COUNT,
    },
  });

  return data;
}

/**
 * 일봉 캔들 조회
 * @param params - 조회 옵션
 * @returns 일봉 캔들 목록
 */
export async function fetchDayCandles(params: DayCandlesParams): Promise<DayCandle[]> {
  const { data } = await upbitClient.get<DayCandle[]>(UPBIT_ENDPOINTS.CANDLES_DAYS, {
    params: {
      market: params.market,
      to: params.to,
      count: params.count ?? DEFAULT_CANDLE_COUNT,
      convertingPriceUnit: params.converting_price_unit,
    },
  });

  return data;
}

/**
 * 주봉 캔들 조회
 * @param params - 조회 옵션
 * @returns 주봉 캔들 목록
 */
export async function fetchWeekCandles(params: PeriodCandlesParams): Promise<WeekCandle[]> {
  const { data } = await upbitClient.get<WeekCandle[]>(UPBIT_ENDPOINTS.CANDLES_WEEKS, {
    params: {
      market: params.market,
      to: params.to,
      count: params.count ?? DEFAULT_CANDLE_COUNT,
    },
  });

  return data;
}

/**
 * 월봉 캔들 조회
 * @param params - 조회 옵션
 * @returns 월봉 캔들 목록
 */
export async function fetchMonthCandles(params: PeriodCandlesParams): Promise<MonthCandle[]> {
  const { data } = await upbitClient.get<MonthCandle[]>(UPBIT_ENDPOINTS.CANDLES_MONTHS, {
    params: {
      market: params.market,
      to: params.to,
      count: params.count ?? DEFAULT_CANDLE_COUNT,
    },
  });

  return data;
}

/**
 * 캔들 조회 (통합)
 * @param market - 마켓 코드
 * @param timeframe - 캔들 타임프레임
 * @param options - 추가 옵션
 * @returns 캔들 목록
 */
export async function fetchCandles(
  market: string,
  timeframe: CandleTimeframe,
  options?: { to?: string; count?: number },
): Promise<MinuteCandle[] | DayCandle[] | WeekCandle[] | MonthCandle[]> {
  const { to, count } = options ?? {};

  switch (timeframe.type) {
    case 'minutes':
      return fetchMinuteCandles(timeframe.unit, { market, to, count });
    case 'days':
      return fetchDayCandles({ market, to, count });
    case 'weeks':
      return fetchWeekCandles({ market, to, count });
    case 'months':
      return fetchMonthCandles({ market, to, count });
  }
}
