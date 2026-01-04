/**
 * market-list 유틸리티 함수
 */

import type { MarketRowData, SortField, SortOrder } from '../model/types';

/**
 * 마켓 데이터 정렬
 */
export function sortMarketData(data: MarketRowData[], sortBy: SortField, sortOrder: SortOrder): MarketRowData[] {
  return [...data].sort((a, b) => {
    let aValue: string | number = a[sortBy];
    let bValue: string | number = b[sortBy];

    // 문자열 비교 (코인명)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue, 'ko') : bValue.localeCompare(aValue, 'ko');
    }

    // 숫자 비교 (가격, 변동률, 거래대금)
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
}
