'use client';

import { useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useRealtimeOrderbook, useRealtimeTicker, useSingleTicker, type OrderbookUnit } from '@/entities/bithumb';
import { SyncingOverlay } from '@/widgets/trade-layout/ui/syncing-overlay';

import { OrderbookItem } from './orderbook-item';

interface OrderbookProps {
  market: string;
  /** 외부 로딩 상태 (예: 마켓 전환 중) */
  isLoading?: boolean;
}

const ROW_HEIGHT = 30;

/**
 * 오더북 컴포넌트
 * - 글래스모피즘 기반 블러 오버레이 로딩 UI 적용
 */
export const Orderbook = memo(function Orderbook({ market, isLoading = false }: OrderbookProps) {
  const theme = useTheme();
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Fetch Realtime Data
  const orderbook = useRealtimeOrderbook(market);
  const realtimeTicker = useRealtimeTicker(market);
  const { data: initialTicker } = useSingleTicker(market);
  const ticker = realtimeTicker || initialTicker;
  const prevClosingPrice = ticker?.prev_closing_price ?? 0;

  // Process Data into a single flat list for virtualization
  const { allUnits, totalMax } = useMemo(() => {
    if (!orderbook?.orderbook_units) {
      return { allUnits: [], totalMax: 0 };
    }

    const units = orderbook.orderbook_units;

    // Asks: API [Low ... High] -> We want [High ... Low]
    const sortedAsks = [...units].reverse().map((u: OrderbookUnit) => ({
      price: u.ask_price,
      size: u.ask_size,
      type: 'ASK' as const,
    }));

    // Bids: API [High ... Low] -> Use as is
    const sortedBids = units.map((u: OrderbookUnit) => ({
      price: u.bid_price,
      size: u.bid_size,
      type: 'BID' as const,
    }));

    const all = [...sortedAsks, ...sortedBids];
    const maxSize = Math.max(...all.map((u) => u.size), 0.00000001);

    return {
      allUnits: all,
      totalMax: maxSize,
    };
  }, [orderbook]);

  // Virtualization
  const virtualizer = useVirtualizer({
    count: allUnits.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: 10,
  });

  // Center on initial load or market change
  const isInitialized = useRef(false);
  useEffect(() => {
    if (!isInitialized.current && allUnits.length > 0 && scrollElementRef.current) {
      const askCount = allUnits.filter((u) => u.type === 'ASK').length;
      const viewportHeight = scrollElementRef.current.clientHeight || 0;
      const centerScroll = askCount * ROW_HEIGHT - viewportHeight / 2 + ROW_HEIGHT / 2;

      virtualizer.scrollToOffset(centerScroll);
      isInitialized.current = true;
    }
  }, [allUnits, virtualizer]);

  // Reset initialization flag on market change
  useEffect(() => {
    isInitialized.current = false;
  }, [market]);

  const isSyncing = isLoading || !orderbook;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
        position: 'relative',
      }}
    >
      {/* Premium Blur Overlay */}
      {isSyncing && <SyncingOverlay message="SYNCING ORDERBOOK" top={40} blur={3} />}

      {/* Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr 1fr',
          px: 1,
          py: 0.8,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          zIndex: 10,
        }}
      >
        <Typography variant="caption" color="text.secondary" align="right" sx={{ pr: 1, fontWeight: 600 }}>
          매도잔량
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ fontWeight: 600 }}>
          가격(KRW)
        </Typography>
        <Typography variant="caption" color="text.secondary" align="left" sx={{ pl: 1, fontWeight: 600 }}>
          매수잔량
        </Typography>
      </Box>

      {/* Content Area with filter */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', filter: isSyncing ? 'blur(1px)' : 'none', transition: 'filter 0.3s' }}>
        {/* Virtualized Scroll Area */}
        <Box
          ref={scrollElementRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2 },
          }}
        >
          {allUnits.length > 0 && (
            <Box sx={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const unit = allUnits[virtualItem.index];
                if (!unit) return null;
                const changeRate = prevClosingPrice ? (unit.price - prevClosingPrice) / prevClosingPrice : 0;
                const isCurrentPrice = ticker?.trade_price === unit.price;

                return (
                  <Box
                    key={`${unit.type}-${unit.price}-${virtualItem.index}`}
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <OrderbookItem
                      type={unit.type}
                      price={unit.price}
                      size={unit.size}
                      changeRate={changeRate}
                      maxSize={totalMax}
                      isCurrentPrice={isCurrentPrice}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Footer Area with gauge */}
        {orderbook && (
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', mb: 1, bgcolor: 'rgba(0,0,0,0.1)' }}>
              <Box
                sx={{
                  width: `${(orderbook.total_ask_size / (orderbook.total_ask_size + orderbook.total_bid_size)) * 100}%`,
                  bgcolor: '#1261c4',
                  transition: 'width 0.5s ease-in-out',
                }}
              />
              <Box sx={{ flex: 1, bgcolor: '#c84a31', transition: 'all 0.5s ease-in-out' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 0.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ color: '#1261c4', fontWeight: 900, fontSize: '13px', lineHeight: 1.1 }}>
                  {Math.round((orderbook.total_ask_size / (orderbook.total_ask_size + orderbook.total_bid_size)) * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                  {orderbook.total_ask_size.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography sx={{ color: '#c84a31', fontWeight: 900, fontSize: '13px', lineHeight: 1.1 }}>
                  {Math.round((orderbook.total_bid_size / (orderbook.total_ask_size + orderbook.total_bid_size)) * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                  {orderbook.total_bid_size.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
});
