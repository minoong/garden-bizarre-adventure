import type { ChangeType, Market, ParsedMarketCode } from '../model/types';
import { CHANGE_TYPE_COLORS, CHANGE_TYPE_LABELS } from '../model/constants';

/**
 * 마켓 코드 파싱
 * @param market - 마켓 코드 (예: 'KRW-BTC')
 * @returns 파싱된 마켓 코드
 * @example parseMarketCode('KRW-BTC') // { quote: 'KRW', base: 'BTC' }
 */
export function parseMarketCode(market: string): ParsedMarketCode {
  const [quote, base] = market.split('-');
  return { quote, base };
}

/**
 * 마켓 표시 라벨 생성
 * @param market - 마켓 정보
 * @returns 포맷팅된 라벨 (예: '비트코인 (BTC/KRW)')
 * @example getMarketLabel({ market: 'KRW-BTC', korean_name: '비트코인', ... }) // '비트코인 (BTC/KRW)'
 */
export function getMarketLabel(market: Market): string {
  const { quote, base } = parseMarketCode(market.market);
  return `${market.korean_name} (${base}/${quote})`;
}

/**
 * 가격 포맷팅
 * @param price - 가격
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 가격 문자열
 * @example formatPrice(135000000) // '135,000,000'
 * @example formatPrice(0.00001234, { maximumFractionDigits: 8 }) // '0.00001234'
 */
export function formatPrice(
  price: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  const { locale = 'ko-KR', minimumFractionDigits, maximumFractionDigits } = options ?? {};

  // 소수점 자릿수 자동 결정
  let fractionDigits = maximumFractionDigits;
  if (fractionDigits === undefined) {
    if (price >= 1000) {
      fractionDigits = 0;
    } else if (price >= 1) {
      fractionDigits = 2;
    } else if (price >= 0.01) {
      fractionDigits = 4;
    } else {
      fractionDigits = 8;
    }
  }

  return price.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/**
 * 변동률 포맷팅
 * @param rate - 변동률 (예: 0.0074626866)
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 변동률 문자열 (예: '+0.75%')
 */
export function formatChangeRate(
  rate: number,
  options?: {
    showSign?: boolean;
    fractionDigits?: number;
  },
): string {
  const { showSign = true, fractionDigits = 2 } = options ?? {};

  const percentage = rate * 100;
  const formatted = Math.abs(percentage).toFixed(fractionDigits);

  if (showSign) {
    if (rate > 0) return `+${formatted}%`;
    if (rate < 0) return `-${formatted}%`;
  }

  return `${formatted}%`;
}

/**
 * 변동 금액 포맷팅
 * @param price - 변동 금액
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 변동 금액 문자열
 */
export function formatChangePrice(
  price: number,
  options?: {
    showSign?: boolean;
  },
): string {
  const { showSign = true } = options ?? {};
  const formatted = formatPrice(Math.abs(price));

  if (showSign) {
    if (price > 0) return `+${formatted}`;
    if (price < 0) return `-${formatted}`;
  }

  return formatted;
}

/**
 * 거래량 포맷팅 (한글 단위)
 * @param volume - 거래량 또는 거래대금
 * @returns 포맷팅된 거래량 문자열
 * @example formatVolume(54201045000) // '542억'
 * @example formatVolume(1234567) // '123만'
 */
export function formatVolume(volume: number): string {
  const units = [
    { value: 1_0000_0000_0000, label: '조' },
    { value: 1_0000_0000, label: '억' },
    { value: 1_0000, label: '만' },
  ];

  for (const unit of units) {
    if (volume >= unit.value) {
      const value = volume / unit.value;
      // 소수점 첫째 자리까지만 표시 (0이면 생략)
      const formatted = value >= 100 ? Math.floor(value).toString() : value.toFixed(1).replace(/\.0$/, '');
      return `${formatted}${unit.label}`;
    }
  }

  return formatPrice(volume);
}

/**
 * 거래량 포맷팅 (코인 단위)
 * @param volume - 거래량
 * @param symbol - 코인 심볼 (예: 'BTC')
 * @returns 포맷팅된 거래량 문자열
 * @example formatCoinVolume(0.5234, 'BTC') // '0.5234 BTC'
 */
export function formatCoinVolume(volume: number, symbol?: string): string {
  const formatted = volume.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * 변동 상태 라벨 반환
 * @param change - 변동 상태
 * @returns 한글 라벨
 */
export function getChangeLabel(change: ChangeType): string {
  return CHANGE_TYPE_LABELS[change];
}

/**
 * 변동 상태 색상 반환
 * @param change - 변동 상태
 * @returns 색상 코드
 */
export function getChangeColor(change: ChangeType): string {
  return CHANGE_TYPE_COLORS[change];
}

/**
 * 타임스탬프를 날짜 문자열로 변환
 * @param timestamp - 타임스탬프 (ms)
 * @param options - 포맷팅 옵션
 * @returns 날짜 문자열
 */
export function formatTimestamp(
  timestamp: number,
  options?: {
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
  },
): string {
  const { locale = 'ko-KR', dateStyle = 'short', timeStyle = 'medium' } = options ?? {};

  return new Date(timestamp).toLocaleString(locale, {
    dateStyle,
    timeStyle,
  });
}

/**
 * 캔들 시간 포맷팅
 * @param dateTimeKst - KST 시간 문자열 (예: '2026-01-02T14:40:00')
 * @returns 포맷팅된 시간 문자열
 */
export function formatCandleTime(dateTimeKst: string): string {
  const date = new Date(dateTimeKst);
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
