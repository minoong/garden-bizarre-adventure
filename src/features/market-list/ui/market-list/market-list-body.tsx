'use client';

import { useRef, useCallback, useEffect, useMemo, memo } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';

import 'overlayscrollbars/overlayscrollbars.css';

import { parseMarketCode, calculatePriceChange, CHANGE_TYPE_COLORS } from '@/entities/bithumb';

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
 * - 가상화 스크롤 처리 (TanStack Virtual)
 * - 프리미엄 스크롤바 (OverlayScrollbars)
 * - 고성능 렌더링 최적화
 */
export const MarketListBody = memo(function MarketListBody({
  maxHeight = 600,
  rowHeight = 56,
  overscan = 20, // 넉넉한 오버스캔으로 빠른 스크롤 대응
  sx,
  children,
}: MarketListBodyProps) {
  const { sortedData, isFavorite, selectedMarket, setVirtualizer } = useMarketListContext();

  const osRef = useRef<OverlayScrollbarsComponentRef>(null);

  const getScrollElement = useCallback(() => {
    const osInstance = osRef.current?.osInstance();
    return osInstance?.elements().viewport || null;
  }, []);

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan,
  });

  useEffect(() => {
    setVirtualizer(virtualizer);
  }, [virtualizer, setVirtualizer]);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const isRenderProps = typeof children === 'function';

  const osOptions = useMemo(
    () => ({
      scrollbars: {
        autoHide: 'move' as const,
        autoHideDelay: 500,
      },
      overflow: {
        x: 'hidden' as const,
        y: 'scroll' as const,
      },
    }),
    [],
  );

  const osStyle = useMemo(
    () => ({
      maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    }),
    [maxHeight],
  );

  // 컨테이너 스타일 (will-change 추가로 GPU 가속 유도)
  const containerSx = useMemo<SxProps<Theme>>(
    () => [{ height: totalSize, position: 'relative', willChange: 'transform' }, ...(Array.isArray(sx) ? sx : [sx])],
    [totalSize, sx],
  );

  return (
    <OverlayScrollbarsComponent ref={osRef} element="div" options={osOptions} defer style={osStyle}>
      <Box sx={containerSx}>
        {virtualItems.map((virtualRow) => {
          const row = sortedData[virtualRow.index];
          if (!row) return null;

          const { base, quote } = parseMarketCode(row.market);
          const state: RowRenderState = {
            isFavorite: isFavorite(row.market),
            isSelected: selectedMarket === row.market,
            highlight: undefined,
            priceChange: calculatePriceChange(row.prev_closing_price, row.trade_price, CHANGE_TYPE_COLORS.RISE, CHANGE_TYPE_COLORS.FALL),
            marketCode: { base, quote },
          };

          const itemStyle = {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
            willChange: 'transform', // 개별 아이템에도 GPU 가속 힌트
          };

          if (isRenderProps) {
            return (
              <Box key={row.market} data-index={virtualRow.index} ref={virtualizer.measureElement} sx={itemStyle}>
                {children(row, state, virtualRow.index)}
              </Box>
            );
          }

          return (
            <MarketListRow
              key={row.market}
              row={row}
              state={state}
              virtualRow={virtualRow}
              measureElement={virtualizer.measureElement}
              sx={{ willChange: 'transform' }}
            />
          );
        })}
      </Box>
    </OverlayScrollbarsComponent>
  );
});
