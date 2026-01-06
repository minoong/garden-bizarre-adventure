/**
 * MarketList Compound Component
 *
 * @example 기본 사용법
 * ```tsx
 * <MarketList>
 *   <MarketList.Header />
 *   <MarketList.Body />
 * </MarketList>
 * ```
 *
 * @example 커스텀 헤더
 * ```tsx
 * <MarketList>
 *   <MarketList.Header>
 *     <MarketList.HeaderCell field="korean_name" sortable>이름</MarketList.HeaderCell>
 *     <MarketList.HeaderCell field="trade_price" sortable align="right">가격</MarketList.HeaderCell>
 *   </MarketList.Header>
 *   <MarketList.Body />
 * </MarketList>
 * ```
 *
 * @example Render Props (Body)
 * ```tsx
 * <MarketList>
 *   <MarketList.Header />
 *   <MarketList.Body>
 *     {(row, state) => (
 *       <MarketList.Row row={row} state={state}>
 *         <MarketList.FavoriteCell row={row} state={state} />
 *         <MarketList.NameCell row={row} state={state} />
 *         <MarketList.PriceCell row={row} state={state} />
 *       </MarketList.Row>
 *     )}
 *   </MarketList.Body>
 * </MarketList>
 * ```
 *
 * @example Render Props (Cell)
 * ```tsx
 * <MarketList.NameCell
 *   row={row}
 *   state={state}
 *   render={({ koreanName, base, quote }) => (
 *     <CustomNameDisplay name={koreanName} symbol={`${base}/${quote}`} />
 *   )}
 * />
 * ```
 */

import { MarketListRoot, type MarketListRootProps } from './market-list-root';
import { MarketListHeader, MarketListHeaderCell, type MarketListHeaderProps, type MarketListHeaderCellProps } from './market-list-header';
import { MarketListBody, type MarketListBodyProps } from './market-list-body';
import { MarketListRow, type MarketListRowProps } from './market-list-row';
import {
  FavoriteCell,
  NameCell,
  PriceCell,
  ChangeCell,
  VolumeCell,
  Cell,
  type FavoriteCellProps,
  type NameCellProps,
  type PriceCellProps,
  type ChangeCellProps,
  type VolumeCellProps,
  type CellProps,
  type FavoriteCellRenderProps,
  type NameCellRenderProps,
  type PriceCellRenderProps,
  type ChangeCellRenderProps,
  type VolumeCellRenderProps,
} from './cells';
import { useMarketListContext, type MarketListContextValue, type RowRenderState } from './market-list-context';
import { MarketListPaper, type MarketListPaperProps } from './market-list-paper';
import { DEFAULT_COLUMNS, DEFAULT_HEADER_COLUMNS, type HeaderColumnConfig } from './column-config';

// Compound Component 패턴
export const MarketList = Object.assign(MarketListRoot, {
  Header: MarketListHeader,
  HeaderCell: MarketListHeaderCell,
  Body: MarketListBody,
  Row: MarketListRow,
  Paper: MarketListPaper,
  FavoriteCell,
  NameCell,
  PriceCell,
  ChangeCell,
  VolumeCell,
  Cell,
});

// Context Hook
export { useMarketListContext };

// Column Config
export { DEFAULT_COLUMNS, DEFAULT_HEADER_COLUMNS };

// Types
export type {
  // Root
  MarketListRootProps,
  // Header
  MarketListHeaderProps,
  MarketListHeaderCellProps,
  // Body
  MarketListBodyProps,
  // Row
  MarketListRowProps,
  // Paper
  MarketListPaperProps,
  // Cells
  FavoriteCellProps,
  NameCellProps,
  PriceCellProps,
  ChangeCellProps,
  VolumeCellProps,
  CellProps,
  // Render Props
  FavoriteCellRenderProps,
  NameCellRenderProps,
  PriceCellRenderProps,
  ChangeCellRenderProps,
  VolumeCellRenderProps,
  // Context
  MarketListContextValue,
  RowRenderState,
  // Column Config
  HeaderColumnConfig,
};
