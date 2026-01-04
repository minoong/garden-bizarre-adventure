/**
 * 가격 변화 계산 유틸리티
 */

export interface PriceChange {
  /** 변화 금액 (절대값) */
  changeAmount: number;
  /** 변화율 (%) */
  changeRate: number;
  /** 상승 여부 (true: 상승, false: 하락) */
  isRise: boolean;
  /** 변화 색상 (상승: upColor, 하락: downColor) */
  changeColor: string;
  /** 포맷된 변화 문자열 (예: "+1,200 (+2.46%)") */
  formattedChange: string;
  /** 포맷된 변화율만 (예: "+2.46%") */
  formattedRate: string;
  /** 포맷된 변화 금액만 (예: "+1,200") */
  formattedPriceChange: string;
}

/**
 * 시가 대비 종가 변화율 계산
 *
 * @param open - 시가
 * @param close - 종가
 * @param upColor - 상승 색상 (기본: '#c84a31')
 * @param downColor - 하락 색상 (기본: '#1261c4')
 * @returns PriceChange 객체
 *
 * @example
 * ```typescript
 * const change = calculatePriceChange(48800, 50000);
 * console.log(change.formattedChange); // "+1,200 (+2.46%)"
 * console.log(change.isRise); // true
 * console.log(change.changeColor); // '#c84a31'
 * ```
 */
export function calculatePriceChange(open: number, close: number, upColor = '#c84a31', downColor = '#1261c4'): PriceChange {
  const changeAmount = close - open;
  const changeRate = (changeAmount / open) * 100;
  const isRise = close >= open;
  const changeColor = isRise ? upColor : downColor;

  // 포맷된 문자열 생성
  const sign = isRise ? '+' : '';
  const formattedAmount = changeAmount.toLocaleString();
  const formattedRateNum = changeRate.toFixed(2);

  const formattedChange = `${sign}${formattedAmount} (${sign}${formattedRateNum}%)`;
  const formattedRate = `${sign}${formattedRateNum}%`;
  const formattedPriceChange = `${sign}${formattedAmount}`;

  return {
    changeAmount,
    changeRate,
    isRise,
    changeColor,
    formattedChange,
    formattedRate,
    formattedPriceChange,
  };
}

/**
 * 전일 종가 대비 현재가 변화율 계산
 *
 * @param prevClose - 전일 종가
 * @param currentPrice - 현재가
 * @param upColor - 상승 색상
 * @param downColor - 하락 색상
 * @returns PriceChange 객체
 *
 * @example
 * ```typescript
 * const change = calculateDailyChange(50000, 51500);
 * console.log(change.formattedRate); // "+3.00%"
 * ```
 */
export function calculateDailyChange(prevClose: number, currentPrice: number, upColor = '#c84a31', downColor = '#1261c4'): PriceChange {
  return calculatePriceChange(prevClose, currentPrice, upColor, downColor);
}
