import { useState, useRef, useEffect, useCallback } from 'react';

import type { WebSocketTicker } from '@/entities/upbit';

export interface HighlightState {
  isHighlighted: boolean;
  isRise: boolean;
}

/**
 * 가격 변경 하이라이트 훅
 * - 실시간 가격 변경 시 0.3초간 하이라이트 표시
 */
export function useMarketListHighlights(realtimeTickers: Map<string, WebSocketTicker>) {
  const [highlights, setHighlights] = useState<Map<string, HighlightState>>(new Map());
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 실시간 가격 변경 시 하이라이트 처리
  useEffect(() => {
    realtimeTickers.forEach((ticker, market) => {
      const prevPrice = prevPricesRef.current.get(market);
      const currentPrice = ticker.trade_price;

      if (prevPrice !== undefined && prevPrice !== currentPrice && currentPrice > 0) {
        const isRise = currentPrice > prevPrice;

        // 기존 timeout 취소
        const existingTimeout = timeoutsRef.current.get(market);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // 하이라이트 활성화
        setHighlights((prev) => new Map(prev).set(market, { isHighlighted: true, isRise }));

        // 0.3초 후 하이라이트 제거
        const timeoutId = setTimeout(() => {
          setHighlights((prev) => {
            const newMap = new Map(prev);
            newMap.delete(market);
            return newMap;
          });
          timeoutsRef.current.delete(market);
        }, 300);

        timeoutsRef.current.set(market, timeoutId);
      }

      prevPricesRef.current.set(market, currentPrice);
    });
  }, [realtimeTickers]);

  const getHighlight = useCallback(
    (market: string): HighlightState | undefined => {
      return highlights.get(market);
    },
    [highlights],
  );

  return {
    highlights,
    getHighlight,
  };
}
