import { useMemo, useCallback } from 'react';

import { useFavoriteStore } from '@/entities/bithumb/model/favorite-store';

/**
 * 마켓 즐겨찾기 훅
 */
export function useMarketListFavorites() {
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  // 효율적인 조회를 위해 렌더링 시점에 Set으로 변환 (메모이제이션)
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (market: string) => {
      return favoritesSet.has(market);
    },
    [favoritesSet],
  );

  return {
    favorites, // 현재는 배열
    favoritesSet, // 필요한 경우 대비
    toggleFavorite,
    isFavorite,
  };
}
