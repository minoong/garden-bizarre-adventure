'use client';

import type { ReactNode } from 'react';
import { Box, TableSortLabel } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

import type { SortField } from '../../model/types';

import { DEFAULT_HEADER_COLUMNS } from './column-config';
import { useMarketListContext } from './market-list-context';

export interface MarketListHeaderProps {
  /** 자식 요소 (HeaderCell들) - 없으면 기본 헤더 렌더링 */
  children?: ReactNode;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
}

/**
 * MarketList Header 컴포넌트
 * - CSS Grid를 사용하여 컬럼 너비 적용
 * - children이 없으면 기본 헤더 렌더링
 * - children이 있으면 커스텀 헤더 렌더링
 */
export function MarketListHeader({ children, sx }: MarketListHeaderProps) {
  const { gridTemplateColumns } = useMarketListContext();

  // 기본 헤더 렌더링
  const defaultHeader = (
    <>
      {DEFAULT_HEADER_COLUMNS.map((col, index) => (
        <MarketListHeaderCell key={index} field={col.sortField} align={col.align} sortable={!!col.sortField}>
          {col.label}
        </MarketListHeaderCell>
      ))}
    </>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns,
        alignItems: 'center',
        bgcolor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        ...sx,
      }}
    >
      {children ?? defaultHeader}
    </Box>
  );
}

export interface MarketListHeaderCellProps {
  /** 정렬 필드 (null이면 정렬 불가) */
  field?: SortField | null;
  /** 정렬 가능 여부 */
  sortable?: boolean;
  /** 정렬 */
  align?: 'left' | 'right' | 'center';
  /** 자식 요소 */
  children?: ReactNode;
  /** 커스텀 스타일 */
  sx?: SxProps<Theme>;
  /** Render props */
  render?: (props: { sortBy: SortField; sortOrder: 'asc' | 'desc'; handleSort: (field: SortField) => void }) => ReactNode;
}

/**
 * MarketList HeaderCell 컴포넌트
 * - CSS Grid 셀로 렌더링 (너비는 부모 Grid에서 결정)
 */
export function MarketListHeaderCell({ field, sortable = false, align = 'left', children, sx, render }: MarketListHeaderCellProps) {
  const { sortBy, sortOrder, handleSort } = useMarketListContext();

  const cellSx = {
    padding: '6px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
    minWidth: 0, // Grid 셀 overflow 방지
    ...sx,
  };

  // Render props 지원
  if (render) {
    return <Box sx={cellSx}>{render({ sortBy, sortOrder, handleSort })}</Box>;
  }

  const isSortable = sortable && field != null;
  const isActive = isSortable && sortBy === field;

  return (
    <Box sx={cellSx}>
      {isSortable && field ? (
        <TableSortLabel
          active={isActive}
          direction={isActive ? sortOrder : 'asc'}
          onClick={() => handleSort(field)}
          IconComponent={ArrowDropDownIcon}
          sx={{
            fontSize: '0.65rem',
            fontWeight: 500,
            color: '#666',
            '& .MuiTableSortLabel-icon': {
              fontSize: '1rem',
              marginLeft: '2px',
            },
          }}
        >
          {children}
        </TableSortLabel>
      ) : (
        children
      )}
    </Box>
  );
}
