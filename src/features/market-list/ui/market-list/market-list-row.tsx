'use client';

import type { ReactNode } from 'react';
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
 */
export function MarketListRow({ row, state, virtualRow, measureElement, sx, children }: MarketListRowProps) {
  const { selectMarket, onRowClick, gridTemplateColumns } = useMarketListContext();

  const { isSelected, highlight } = state;

  // 하이라이트 배경색
  const highlightBgColor = highlight?.isHighlighted ? (highlight.isRise ? 'rgba(200, 74, 71, 0.15)' : 'rgba(18, 97, 196, 0.15)') : 'transparent';

  // 행 클릭 핸들러
  const handleRowClick = () => {
    selectMarket(row.market);
  };

  // children이 함수인지 확인 (render props)
  const isRenderProps = typeof children === 'function';

  // 기본 셀 렌더링
  const defaultCells = (
    <>
      <FavoriteCell row={row} state={state} />
      <NameCell row={row} state={state} />
      <PriceCell row={row} state={state} highlightBgColor={highlightBgColor} />
      <ChangeCell row={row} state={state} />
      <VolumeCell row={row} state={state} />
    </>
  );

  return (
    <Box
      data-index={virtualRow?.index}
      ref={measureElement}
      onClick={handleRowClick}
      sx={{
        position: virtualRow ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        width: '100%',
        transform: virtualRow ? `translateY(${virtualRow.start}px)` : undefined,
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
      }}
    >
      {isRenderProps ? children(row, state) : (children ?? defaultCells)}
    </Box>
  );
}
