'use client';

import { useState, useCallback, useMemo, useDeferredValue, useEffect, type ReactNode } from 'react';
import { Box, CircularProgress, Chip, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { Virtualizer } from '@tanstack/react-virtual';
import { getChoseong } from 'es-hangul';

import { parseMarketCode } from '@/entities/bithumb';

import type { SortField, SortOrder } from '../../model/types';
import { useMarketListData, useMarketListSort, useMarketListFavorites } from '../../hooks';

import { MarketListProvider, type MarketListContextValue } from './market-list-context';
import { DEFAULT_COLUMNS } from './column-config';

export interface MarketListRootProps {
  /** 초기 정렬 필드 */
  initialSortBy?: SortField;
  /** 초기 정렬 순서 */
  initialSortOrder?: SortOrder;
  /** 초기 선택된 마켓 */
  initialSelectedMarket?: string | null;
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
  /** 검색어 */
  searchQuery?: string;
}

/**
 * MarketList Root 컴포넌트
 * - Context Provider 역할
 * - 데이터 fetching, 정렬, 즐겨찾기, 하이라이트 상태 관리
 */
export function MarketListRoot({
  initialSortBy = 'acc_trade_price_24h',
  initialSortOrder = 'desc',
  initialSelectedMarket = null,
  onRowClick,
  children,
  sx,
  className,
  showTitle = true,
  title = '암호화폐 시세',
  showStatusChip = true,
  columns = DEFAULT_COLUMNS,
  searchQuery = '',
}: MarketListRootProps) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(initialSelectedMarket);
  const [virtualizer, setVirtualizerState] = useState<Virtualizer<HTMLElement, Element> | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // CSS Grid 템플릿 컬럼 생성
  const gridTemplateColumns = useMemo(() => columns.join(' '), [columns]);

  // 1. 데이터 fetching & WebSocket
  const { data, realtimeTickers, isLoading, wsStatus } = useMarketListData();

  // 검색 인덱스 데이터 (초성 사전 계산 유지)
  const [searchIndex, setSearchIndex] = useState<Map<string, string>>(new Map());

  // 데이터 로드 시 브라우저 유휴 시간에 초성 인덱싱 수행
  useEffect(() => {
    if (!data.length) return;

    const computeIndex = () => {
      const newIndex = new Map<string, string>();
      data.forEach((m) => {
        newIndex.set(m.market, getChoseong(m.korean_name));
      });
      setSearchIndex(newIndex);
    };

    if ('requestIdleCallback' in window) {
      const handle = (
        window as unknown as { requestIdleCallback: (cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void) => number }
      ).requestIdleCallback(computeIndex);
      return () => (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
    } else {
      // 폴백: 메인 스레드 부하 분산을 위해 다음 틱에 실행
      const timer = setTimeout(computeIndex, 0);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const filteredData = useMemo(() => {
    if (!deferredSearchQuery) return data;
    const lowerQuery = deferredSearchQuery.toLowerCase();

    return data.filter((m) => {
      const { base } = parseMarketCode(m.market);
      const choseong = searchIndex.get(m.market) || '';

      return (
        m.korean_name.includes(deferredSearchQuery) ||
        choseong.includes(deferredSearchQuery) || // 미리 계산된 초성 사용
        m.english_name.toLowerCase().includes(lowerQuery) ||
        base.toLowerCase().includes(lowerQuery) ||
        m.market.toLowerCase().includes(lowerQuery)
      );
    });
  }, [data, deferredSearchQuery, searchIndex]);

  // 2. 정렬
  const { sortedData, sortBy, sortOrder, handleSort } = useMarketListSort({
    data: filteredData,
    initialSortBy,
    initialSortOrder,
  });

  // 3. 즐겨찾기
  const { favorites, toggleFavorite, isFavorite } = useMarketListFavorites();

  // 4. 하이라이트 (이제 개별 셀에서 처리하므로 제거)

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
      realtimeTickers, // Map 자체는 전유물이므로 일단 유지하되, 내부 값 변경이 컨텍스트 참조 변경을 일으키지 않도록 함 (이미 useMarketListData에서 분리됨)
      isLoading,
      sortBy,
      sortOrder,
      handleSort,
      toggleFavorite,
      isFavorite,
      favorites,
      selectedMarket,
      selectMarket,
      getHighlight: () => undefined, // 하이라이트는 셀 내부에서 처리
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
      favorites,
      selectedMarket,
      selectMarket,
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
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 600,
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
