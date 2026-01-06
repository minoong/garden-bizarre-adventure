'use client';

import { createContext, useContext } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';

import type { WebSocketTicker } from '@/entities/upbit/model/types';

import type { MarketRowData, SortField, SortOrder } from '../../model/types';
import type { HighlightState } from '../../hooks';

/**
 * Row 렌더링 시 전달되는 상태
 */
export interface RowRenderState {
  /** 즐겨찾기 여부 */
  isFavorite: boolean;
  /** 선택 여부 */
  isSelected: boolean;
  /** 하이라이트 상태 */
  highlight: HighlightState | undefined;
  /** 가격 변화 정보 */
  priceChange: {
    changeAmount: number;
    changeRate: number;
    changeColor: string;
    formattedRate: string;
    formattedPriceChange: string;
  };
  /** 파싱된 마켓 코드 */
  marketCode: {
    base: string;
    quote: string;
  };
}

/**
 * MarketList Context 값
 */
export interface MarketListContextValue {
  // 데이터
  data: MarketRowData[];
  sortedData: MarketRowData[];
  realtimeTickers: Map<string, WebSocketTicker>;
  isLoading: boolean;

  // 정렬
  sortBy: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;

  // 즐겨찾기
  toggleFavorite: (market: string) => void;
  isFavorite: (market: string) => boolean;

  // 선택
  selectedMarket: string | null;
  selectMarket: (market: string) => void;

  // 하이라이트
  getHighlight: (market: string) => HighlightState | undefined;

  // 가상화
  virtualizer: Virtualizer<HTMLElement, Element> | null;
  setVirtualizer: (v: Virtualizer<HTMLElement, Element>) => void;

  // WebSocket
  wsStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

  // 콜백
  onRowClick?: (market: string) => void;

  // CSS Grid 컬럼 설정
  gridTemplateColumns: string;
}

const MarketListContext = createContext<MarketListContextValue | null>(null);

/**
 * MarketList Context Hook
 */
export function useMarketListContext() {
  const context = useContext(MarketListContext);
  if (!context) {
    throw new Error('useMarketListContext must be used within MarketList');
  }
  return context;
}

/**
 * MarketList Context Provider
 */
export const MarketListProvider = MarketListContext.Provider;
