import { useState, useCallback } from 'react';

/**
 * 마켓 즐겨찾기 훅
 */
export function useMarketListFavorites(initialFavorites: Set<string> = new Set()) {
  const [favorites, setFavorites] = useState<Set<string>>(initialFavorites);

  const toggleFavorite = useCallback((market: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(market)) {
        newFavorites.delete(market);
      } else {
        newFavorites.add(market);
      }
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback(
    (market: string) => {
      return favorites.has(market);
    },
    [favorites],
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
