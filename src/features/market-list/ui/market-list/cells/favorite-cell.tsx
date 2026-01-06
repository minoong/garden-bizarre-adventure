'use client';

import type { ReactNode } from 'react';
import { Box, IconButton } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

import { useMarketListContext } from '../market-list-context';

import type { BaseCellProps } from './types';

export interface FavoriteCellRenderProps {
  isFavorite: boolean;
  toggleFavorite: () => void;
}

export interface FavoriteCellProps extends BaseCellProps {
  render?: (props: FavoriteCellRenderProps) => ReactNode;
}

/**
 * 즐겨찾기 셀
 * - CSS Grid 셀로 렌더링 (너비는 부모 Row의 Grid에서 결정)
 */
export function FavoriteCell({ row, state, sx, render }: FavoriteCellProps) {
  const { toggleFavorite } = useMarketListContext();
  const { isFavorite } = state;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(row.market);
  };

  const cellSx = {
    padding: '6px 2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0, // Grid 셀 overflow 방지
    ...sx,
  };

  if (render) {
    return <Box sx={cellSx}>{render({ isFavorite, toggleFavorite: () => toggleFavorite(row.market) })}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <IconButton size="small" onClick={handleToggle} sx={{ padding: '2px' }}>
        {isFavorite ? <Star sx={{ fontSize: '1rem', color: '#fbbf24' }} /> : <StarBorder sx={{ fontSize: '1rem', color: '#d1d5db' }} />}
      </IconButton>
    </Box>
  );
}
