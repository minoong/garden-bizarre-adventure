import { coingeckoClient } from './client';

export interface CoinGeckoInfo {
  id: string;
  symbol: string;
  name: string;
  description: { [key: string]: string };
  links: {
    homepage: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    official_forum_url: string[];
  };
  market_cap_rank: number;
  market_data: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    high_24h: { [key: string]: number };
    low_24h: { [key: string]: number };
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
}

export interface CoinGeckoSearchCoin {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number;
  large: string;
}

export interface CoinGeckoSearchResult {
  coins: CoinGeckoSearchCoin[];
}

/**
 * 심볼로 코인 검색
 */
export async function searchCoinBySymbol(symbol: string): Promise<string | null> {
  try {
    const { data } = await coingeckoClient.get<CoinGeckoSearchResult>(`/search?query=${symbol}`);
    // 심볼이 정확히 일치하거나 가장 유명한 것 선택
    const coin = data.coins.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase()) || data.coins[0];
    return coin ? coin.id : null;
  } catch (error) {
    console.error('Error searching coin on CoinGecko:', error);
    return null;
  }
}

/**
 * 코인 상세 정보 조회
 */
export async function getCoinInfo(id: string): Promise<CoinGeckoInfo | null> {
  try {
    const { data } = await coingeckoClient.get<CoinGeckoInfo>(
      `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    );
    return data;
  } catch (error) {
    console.error('Error fetching coin info from CoinGecko:', error);
    return null;
  }
}
