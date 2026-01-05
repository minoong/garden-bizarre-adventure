'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';

import 'overlayscrollbars/overlayscrollbars.css';

import { parseMarketCode, calculatePriceChange, CHANGE_TYPE_COLORS } from '@/entities/upbit';

import type { MarketRowData } from '../../model/types';

import { useMarketListContext, type RowRenderState } from './market-list-context';
import { MarketListRow } from './market-list-row';

export interface MarketListBodyProps {
  /** 최대 높이 */
  maxHeight?: number | string;
  /** 행 높이 */
  rowHeight?: number;
  /** Overscan (화면 밖 미리 렌더링할 행 수) */
  overscan?: number;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /**
   * Render props - 커스텀 행 렌더링
   * children이 함수이면 각 행에 대해 호출됨
   */
  children?: ((row: MarketRowData, state: RowRenderState, index: number) => React.ReactNode) | React.ReactNode;
}

/**
 * MarketList Body 컴포넌트
 * - 가상화 스크롤 처리
 * - Render props 지원
 */
export function MarketListBody({ maxHeight = 600, rowHeight = 56, overscan = 10, sx, children }: MarketListBodyProps) {
  const { sortedData, isFavorite, selectedMarket, getHighlight, setVirtualizer } = useMarketListContext();

  // OverlayScrollbars ref
  const osRef = useRef<OverlayScrollbarsComponentRef>(null);

  // 스크롤 요소 가져오기
  const getScrollElement = useCallback(() => {
    const osInstance = osRef.current?.osInstance();
    return osInstance?.elements().viewport || null;
  }, []);

  // 가상화 설정
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual은 React Compiler와 알려진 호환성 문제가 있음
  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement,
    estimateSize: () => rowHeight,
    overscan,
  });

  // Context에 virtualizer 등록
  useEffect(() => {
    setVirtualizer(virtualizer);
  }, [virtualizer, setVirtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  // 행 상태 계산 함수
  const getRowState = useCallback(
    (row: MarketRowData): RowRenderState => {
      const { base, quote } = parseMarketCode(row.market);
      const priceChange = calculatePriceChange(row.opening_price, row.trade_price, CHANGE_TYPE_COLORS.RISE, CHANGE_TYPE_COLORS.FALL);

      return {
        isFavorite: isFavorite(row.market),
        isSelected: selectedMarket === row.market,
        highlight: getHighlight(row.market),
        priceChange,
        marketCode: { base, quote },
      };
    },
    [isFavorite, selectedMarket, getHighlight],
  );

  // children이 함수인지 확인 (render props)
  const isRenderProps = typeof children === 'function';

  return (
    <OverlayScrollbarsComponent
      ref={osRef}
      element="div"
      options={{
        scrollbars: {
          autoHide: 'never',
          autoHideDelay: 0,
        },
        overflow: {
          x: 'hidden',
          y: 'scroll',
        },
      }}
      defer
      style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
    >
      <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative', ...sx }}>
        {virtualItems.map((virtualRow) => {
          const row = sortedData[virtualRow.index];
          const state = getRowState(row);

          // Render props 사용
          if (isRenderProps) {
            return (
              <Box
                key={row.market}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {children(row, state, virtualRow.index)}
              </Box>
            );
          }

          // 기본 렌더링
          return <MarketListRow key={row.market} row={row} state={state} virtualRow={virtualRow} measureElement={virtualizer.measureElement} />;
        })}
      </Box>
    </OverlayScrollbarsComponent>
  );
}
