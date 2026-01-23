'use client';

import { memo, useCallback, useMemo, type ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { VirtualItem } from '@tanstack/react-virtual';

import type { MarketRowData } from '../../model/types';

import { useMarketListContext, type RowRenderState } from './market-list-context';
import { FavoriteCell, NameCell, PriceCell, ChangeCell, VolumeCell } from './cells';

export interface MarketListRowProps {
  /** 행 데이터 */
  row: MarketRowData;
  /** 행 상태 */
  state: RowRenderState;
  /** 가상화 행 정보 */
  virtualRow?: VirtualItem;
  /** 측정 요소 ref */
  measureElement?: (node: Element | null) => void;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /**
   * Render props - 커스텀 셀 렌더링
   * children이 함수이면 호출됨
   */
  children?: ((row: MarketRowData, state: RowRenderState) => ReactNode) | ReactNode;
}

/**
 * MarketList Row 컴포넌트
 * - CSS Grid를 사용하여 컬럼 너비 적용 (Header와 동일한 gridTemplateColumns)
 * - 기본 셀 렌더링 또는 render props로 커스텀 렌더링
 * - React.memo로 불필요한 리렌더링 방지
 */
export const MarketListRow = memo(function MarketListRow({ row, state, virtualRow, measureElement, sx, children }: MarketListRowProps) {
  const { selectMarket, onRowClick, gridTemplateColumns } = useMarketListContext();

  const { isSelected } = state;

  // 행 클릭 핸들러 안정화
  const handleRowClick = useCallback(() => {
    selectMarket(row.market);
  }, [selectMarket, row.market]);

  // children이 함수인지 확인 (render props)
  const isRenderProps = typeof children === 'function';

  // 기본 셀 렌더링 메모이제이션
  const defaultCells = useMemo(
    () => (
      <>
        <FavoriteCell row={row} state={state} />
        <NameCell row={row} />
        <PriceCell row={row} />
        <ChangeCell row={row} />
        <VolumeCell row={row} />
      </>
    ),
    [row, state],
  );

  // sx 스타일 메모이제이션
  const rowSx = useMemo(
    () =>
      ({
        position: virtualRow ? ('absolute' as const) : ('relative' as const),
        top: 0,
        left: 0,
        width: '100%',
        transform: virtualRow ? `translateY(${virtualRow.start}px)` : 'none',
        display: 'grid',
        gridTemplateColumns,
        alignItems: 'center',
        borderBottom: '1px solid #f5f5f5',
        ...(isSelected && {
          boxShadow: 'inset 3px 0 0 0 #dd3c44',
        }),
        backgroundColor: isSelected ? '#f5f5f5 !important' : 'transparent',
        cursor: onRowClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: '#f5f5f5 !important',
        },
        ...sx,
      }) as const,
    [virtualRow, gridTemplateColumns, isSelected, onRowClick, sx],
  );

  return (
    <Box data-index={virtualRow?.index} ref={measureElement} onClick={handleRowClick} sx={rowSx}>
      {isRenderProps ? children(row, state) : (children ?? defaultCells)}
    </Box>
  );
});
