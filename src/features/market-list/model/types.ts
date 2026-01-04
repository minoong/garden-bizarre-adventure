/**
 * market-list 타입 정의
 */

export type SortField = 'korean_name' | 'trade_price' | 'change_rate' | 'acc_trade_price_24h';
export type SortOrder = 'asc' | 'desc';

export interface MarketListTableProps {
  /** 초기 정렬 필드 */
  initialSortBy?: SortField;
  /** 초기 정렬 순서 */
  initialSortOrder?: SortOrder;
  /** 행 클릭 핸들러 */
  onRowClick?: (market: string) => void;
  /** 클래스명 */
  className?: string;
}

export interface MarketRowData {
  /** 마켓 코드 (KRW-BTC) */
  market: string;
  /** 한글명 (비트코인) */
  korean_name: string;
  /** 영문명 (Bitcoin) */
  english_name: string;
  /** 현재가 */
  trade_price: number;
  /** 시가 */
  opening_price: number;
  /** 고가 */
  high_price: number;
  /** 저가 */
  low_price: number;
  /** 전일 종가 대비 변화 */
  change: 'RISE' | 'EVEN' | 'FALL';
  /** 변화율 (%) */
  change_rate: number;
  /** 변화 금액 */
  change_price: number;
  /** 24시간 거래대금 */
  acc_trade_price_24h: number;
  /** 24시간 거래량 */
  acc_trade_volume_24h: number;
}
