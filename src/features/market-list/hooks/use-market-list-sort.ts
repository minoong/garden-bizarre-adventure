import { useState, useMemo, useCallback } from 'react';

import type { MarketRowData, SortField, SortOrder } from '../model/types';
import { sortMarketData } from '../lib/utils';

export interface UseMarketListSortProps {
  data: MarketRowData[];
  initialSortBy?: SortField;
  initialSortOrder?: SortOrder;
}

/**
 * 마켓 리스트 정렬 훅
 */
export function useMarketListSort({ data, initialSortBy = 'acc_trade_price_24h', initialSortOrder = 'desc' }: UseMarketListSortProps) {
  const [sortBy, setSortBy] = useState<SortField>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    return sortMarketData(data, sortBy, sortOrder);
  }, [data, sortBy, sortOrder]);

  // 정렬 변경 핸들러
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
    },
    [sortBy],
  );

  return {
    sortedData,
    sortBy,
    sortOrder,
    handleSort,
  };
}
