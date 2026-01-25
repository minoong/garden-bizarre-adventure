import { useQuery } from '@tanstack/react-query';

import { searchCoinBySymbol, getCoinInfo, type CoinGeckoInfo } from '../api/coin';

export function useCoinInfo(symbol: string, enabled = true) {
  return useQuery<CoinGeckoInfo | null>({
    queryKey: ['coingecko', 'coin', symbol],
    queryFn: async () => {
      const id = await searchCoinBySymbol(symbol);
      if (!id) return null;
      return getCoinInfo(id);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!symbol && enabled,
  });
}
