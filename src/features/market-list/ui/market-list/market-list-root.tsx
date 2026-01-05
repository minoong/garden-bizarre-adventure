'use client';

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { Box, CircularProgress, Chip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Virtualizer } from '@tanstack/react-virtual';

import type { SortField, SortOrder } from '../../model/types';
import { useMarketListData, useMarketListSort, useMarketListFavorites, useMarketListHighlights } from '../../hooks';

import { MarketListProvider, type MarketListContextValue } from './market-list-context';
import { DEFAULT_COLUMNS } from './column-config';

export interface MarketListRootProps {
  /** 초기 정렬 필드 */
  initialSortBy?: SortField;
  /** 초기 정렬 순서 */
  initialSortOrder?: SortOrder;
  /** 행 클릭 핸들러 */
  onRowClick?: (market: string) => void;
  /** 자식 요소 */
  children?: ReactNode;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /** 클래스명 */
  className?: string;
  /** 타이틀 표시 여부 */
  showTitle?: boolean;
  /** 커스텀 타이틀 */
  title?: string;
  /** WebSocket 상태 칩 표시 여부 */
  showStatusChip?: boolean;
  /**
   * 컬럼 너비 배열
   * Header의 컬럼 순서와 동일하게 Body의 셀에 적용됨
   * @example ['26px', '120px', '88px', '76px', '88px']
   */
  columns?: readonly string[];
}

/**
 * MarketList Root 컴포넌트
 * - Context Provider 역할
 * - 데이터 fetching, 정렬, 즐겨찾기, 하이라이트 상태 관리
 */
export function MarketListRoot({
  initialSortBy = 'acc_trade_price_24h',
  initialSortOrder = 'desc',
  onRowClick,
  children,
  sx,
  className,
  showTitle = true,
  title = '암호화폐 시세',
  showStatusChip = true,
  columns = DEFAULT_COLUMNS,
}: MarketListRootProps) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [virtualizer, setVirtualizerState] = useState<Virtualizer<HTMLElement, Element> | null>(null);

  // CSS Grid 템플릿 컬럼 생성
  const gridTemplateColumns = useMemo(() => columns.join(' '), [columns]);

  // 1. 데이터 fetching & WebSocket
  const { data, realtimeTickers, isLoading, wsStatus } = useMarketListData();

  // 2. 정렬
  const { sortedData, sortBy, sortOrder, handleSort } = useMarketListSort({
    data,
    initialSortBy,
    initialSortOrder,
  });

  // 3. 즐겨찾기
  const { toggleFavorite, isFavorite } = useMarketListFavorites();

  // 4. 하이라이트
  const { getHighlight } = useMarketListHighlights(realtimeTickers);

  // 선택 핸들러
  const selectMarket = useCallback(
    (market: string) => {
      setSelectedMarket(market);
      onRowClick?.(market);
    },
    [onRowClick],
  );

  // Virtualizer 설정
  const setVirtualizer = useCallback((v: Virtualizer<HTMLElement, Element>) => {
    setVirtualizerState((prev) => {
      // 동일한 virtualizer인 경우 업데이트하지 않음
      if (prev === v) return prev;
      return v;
    });
  }, []);

  // Context 값
  const contextValue = useMemo<MarketListContextValue>(
    () => ({
      data,
      sortedData,
      realtimeTickers,
      isLoading,
      sortBy,
      sortOrder,
      handleSort,
      toggleFavorite,
      isFavorite,
      selectedMarket,
      selectMarket,
      getHighlight,
      virtualizer,
      setVirtualizer,
      wsStatus,
      onRowClick,
      gridTemplateColumns,
    }),
    [
      data,
      sortedData,
      realtimeTickers,
      isLoading,
      sortBy,
      sortOrder,
      handleSort,
      toggleFavorite,
      isFavorite,
      selectedMarket,
      selectMarket,
      getHighlight,
      virtualizer,
      setVirtualizer,
      wsStatus,
      onRowClick,
      gridTemplateColumns,
    ],
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <Box className={className} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, ...sx }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MarketListProvider value={contextValue}>
      <Box className={className} sx={sx}>
        {/* 타이틀 & WebSocket 상태 */}
        {(showTitle || showStatusChip) && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {showTitle && <Typography variant="h6">{title}</Typography>}
            {showStatusChip && wsStatus === 'connected' && (
              <Chip
                label="실시간"
                size="small"
                sx={{
                  bgcolor: '#26a69a',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
        )}
        {children}
      </Box>
    </MarketListProvider>
  );
}
