'use client';

import { memo, useCallback, useMemo, type ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { VirtualItem } from '@tanstack/react-virtual';

import type { MarketRowData } from '../../model/types';

import type { RowRenderState } from './market-list-context';
import { DEFAULT_COLUMNS } from './column-config';
import { FavoriteCell, NameCell, PriceCell, ChangeCell, VolumeCell } from './cells';

export interface MarketListRowProps {
  /** 행 데이터 */
  row: MarketRowData;
  /** 즐겨찾기 여부 */
  isFavorite?: boolean;
  /** 선택 여부 */
  isSelected?: boolean;
  /** 행 상태 (커스텀 렌더링용) */
  state?: RowRenderState;
  /** 가상화 행 정보 */
  virtualRow?: VirtualItem;
  /** 고정 행 높이 */
  rowHeight?: number;
  /** 측정 요소 ref */
  measureElement?: (node: Element | null) => void;
  /** 행 선택 핸들러 */
  onSelectMarket?: (market: string) => void;
  /** 클릭 가능 여부 */
  isClickable?: boolean;
  /** CSS Grid 컬럼 설정 */
  gridTemplateColumns?: string;
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
export const MarketListRow = memo(
  function MarketListRow({
    row,
    isFavorite = false,
    isSelected = false,
    state,
    virtualRow,
    rowHeight,
    measureElement,
    onSelectMarket,
    isClickable = false,
    gridTemplateColumns = DEFAULT_COLUMNS.join(' '),
    sx,
    children,
  }: MarketListRowProps) {
    // 행 클릭 핸들러 안정화
    const handleRowClick = useCallback(() => {
      onSelectMarket?.(row.market);
    }, [onSelectMarket, row.market]);

    // children이 함수인지 확인 (render props)
    const isRenderProps = typeof children === 'function';

    const finalIsFavorite = state?.isFavorite ?? isFavorite;
    const finalIsSelected = state?.isSelected ?? isSelected;

    // 기본 셀 렌더링 메모이제이션
    const defaultCells = useMemo(
      () => (
        <>
          <FavoriteCell row={row} isFavorite={finalIsFavorite} />
          <NameCell row={row} />
          <PriceCell row={row} />
          <ChangeCell row={row} />
          <VolumeCell row={row} />
        </>
      ),
      [row, finalIsFavorite],
    );

    // sx 스타일 메모이제이션
    const rowSx = useMemo(
      () =>
        ({
          position: virtualRow ? ('absolute' as const) : ('relative' as const),
          top: 0,
          left: 0,
          width: '100%',
          height: rowHeight,
          transform: virtualRow ? `translateY(${virtualRow.start}px)` : 'none',
          willChange: virtualRow ? 'transform' : 'auto',
          display: 'grid',
          gridTemplateColumns,
          alignItems: 'center',
          borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`,
          ...(finalIsSelected && {
            boxShadow: (theme: Theme) => `inset 3px 0 0 0 ${theme.palette.primary.main}`,
          }),
          backgroundColor: (theme: Theme) =>
            finalIsSelected ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : 'transparent',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: (theme: Theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          },
          ...sx,
        }) as const,
      [virtualRow, rowHeight, gridTemplateColumns, finalIsSelected, isClickable, sx],
    );

    return (
      <Box data-index={virtualRow?.index} ref={measureElement} onClick={handleRowClick} sx={rowSx}>
        {isRenderProps ? children(row, state as RowRenderState) : (children ?? defaultCells)}
      </Box>
    );
  },
  function areEqual(prevProps, nextProps) {
    return (
      prevProps.row === nextProps.row &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.state === nextProps.state &&
      prevProps.rowHeight === nextProps.rowHeight &&
      prevProps.measureElement === nextProps.measureElement &&
      prevProps.onSelectMarket === nextProps.onSelectMarket &&
      prevProps.isClickable === nextProps.isClickable &&
      prevProps.gridTemplateColumns === nextProps.gridTemplateColumns &&
      prevProps.sx === nextProps.sx &&
      prevProps.children === nextProps.children &&
      prevProps.virtualRow?.index === nextProps.virtualRow?.index &&
      prevProps.virtualRow?.start === nextProps.virtualRow?.start &&
      prevProps.virtualRow?.size === nextProps.virtualRow?.size
    );
  },
);
