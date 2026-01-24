'use client';

import { memo, useCallback, useMemo, type ReactNode } from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
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
 * - React.memo로 최적화
 */
export const FavoriteCell = memo(function FavoriteCell({ row, state, sx, render }: FavoriteCellProps) {
  const theme = useTheme();
  const { toggleFavorite, isFavorite: checkFavorite } = useMarketListContext();

  const isFavorite = state?.isFavorite ?? checkFavorite(row.market);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(row.market);
    },
    [toggleFavorite, row.market],
  );

  const cellSx = useMemo(
    () => ({
      padding: '6px 2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
      ...sx,
    }),
    [sx],
  );

  if (render) {
    return <Box sx={cellSx}>{render({ isFavorite, toggleFavorite: () => toggleFavorite(row.market) })}</Box>;
  }

  return (
    <Box sx={cellSx}>
      <IconButton size="small" onClick={handleToggle} sx={{ padding: '2px' }}>
        {isFavorite ? <Star sx={{ fontSize: '1rem', color: '#fbbf24' }} /> : <StarBorder sx={{ fontSize: '1rem', color: theme.palette.text.disabled }} />}
      </IconButton>
    </Box>
  );
});
