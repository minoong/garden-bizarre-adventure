import type { SortField } from '../../model/types';

/**
 * 기본 컬럼 너비 배열
 * - MarketList Root의 columns prop 기본값
 * - 순서: 즐겨찾기, 이름, 가격, 변동률, 거래대금
 */
export const DEFAULT_COLUMNS = ['26px', '120px', '88px', '76px', '88px'] as const;

/**
 * 헤더 컬럼 설정 타입
 */
export interface HeaderColumnConfig {
  /** 컬럼 너비 */
  width: string;
  /** 정렬 */
  align: 'left' | 'right' | 'center';
  /** 정렬 필드 (없으면 정렬 불가) */
  sortField?: SortField;
  /** 헤더 라벨 */
  label: string;
}

/**
 * 기본 헤더 컬럼 설정
 * - Header 기본 렌더링에서만 사용
 * - 순서대로 렌더링됨
 */
export const DEFAULT_HEADER_COLUMNS: HeaderColumnConfig[] = [
  { width: '26px', align: 'center', label: '' },
  { width: '120px', align: 'left', sortField: 'korean_name', label: '한글명' },
  { width: '88px', align: 'right', sortField: 'trade_price', label: '현재가' },
  { width: '76px', align: 'right', sortField: 'change_rate', label: '전일대비' },
  { width: '88px', align: 'right', sortField: 'acc_trade_price_24h', label: '거래대금' },
];
