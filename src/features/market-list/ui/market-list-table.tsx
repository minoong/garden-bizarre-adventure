'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import { Box, TableSortLabel, Paper, Typography, CircularProgress, Chip, IconButton } from '@mui/material';
import { Star, StarBorder, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

import 'overlayscrollbars/overlayscrollbars.css';

import { useKrwMarkets, useTicker, useUpbitSocket, formatPrice, parseMarketCode } from '@/entities/upbit';
import type { Ticker, WebSocketTicker } from '@/entities/upbit';
import { D3Candle } from '@/features/upbit-chart/ui/d3-candle';
import { calculatePriceChange } from '@/features/upbit-chart/lib';

import type { MarketListTableProps, MarketRowData, SortField, SortOrder } from '../model/types';
import { sortMarketData } from '../lib/utils';

// 색상 상수 (업비트 스타일)
const COLORS = {
  rise: '#c84a47', // 상승 (빨간색)
  fall: '#1261c4', // 하락 (파란색)
  even: '#000000', // 보합 (검은색)
};

/**
 * 거래대금을 백만원 단위로 포맷 (단위 제외, 숫자만 반환)
 */
function formatTradePrice(price: number): string {
  const million = price / 1000000; // 백만원 변환

  if (million >= 1) {
    // 1 백만 이상이면 정수로 표시
    return Math.floor(million).toLocaleString('ko-KR');
  } else {
    // 1 백만 미만이면 소수점 2자리
    return million.toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
}

/**
 * 암호화폐 마켓 리스트 테이블 (업비트 스타일)
 * - REST API로 초기 데이터 로드
 * - WebSocket으로 실시간 가격 업데이트
 */
export function MarketListTable({ initialSortBy = 'acc_trade_price_24h', initialSortOrder = 'desc', onRowClick, className }: MarketListTableProps) {
  const [sortBy, setSortBy] = useState<SortField>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  // 가격 하이라이트 상태 (market -> { isHighlighted: boolean, isRise: boolean })
  const [highlights, setHighlights] = useState<Map<string, { isHighlighted: boolean; isRise: boolean }>>(new Map());
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // OverlayScrollbars ref
  const osRef = useRef<OverlayScrollbarsComponentRef>(null);

  // 가상화를 위한 스크롤 요소 가져오기
  const getScrollElement = useCallback(() => {
    const osInstance = osRef.current?.osInstance();
    return osInstance?.elements().viewport || null;
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = (market: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(market)) {
        newFavorites.delete(market);
      } else {
        newFavorites.add(market);
      }
      return newFavorites;
    });
  };

  // 1. KRW 마켓 목록 조회 (REST API)
  const { data: markets, isLoading: isLoadingMarkets } = useKrwMarkets();

  // 2. 초기 현재가 조회 (REST API)
  const marketCodes = useMemo(() => markets?.map((m) => m.market) ?? [], [markets]);
  const { data: tickers, isLoading: isLoadingTickers } = useTicker(marketCodes, {
    enabled: marketCodes.length > 0,
  });

  // 3. 실시간 ticker WebSocket 구독
  const {
    tickers: realtimeTickers,
    connect,
    status: wsStatus,
  } = useUpbitSocket(marketCodes.length > 0 ? marketCodes : [], marketCodes.length > 0 ? ['ticker'] : []);

  useEffect(() => {
    if (wsStatus === 'disconnected' && marketCodes.length > 0) {
      connect();
    }
  }, [connect, marketCodes.length, wsStatus]);

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

  // 4. 테이블 데이터 생성 (REST + WebSocket 병합)
  const tableData = useMemo<MarketRowData[]>(() => {
    if (!markets || !tickers) return [];

    return markets.map((market) => {
      // WebSocket 데이터 우선 사용, 없으면 REST API 데이터 사용
      const realtimeTicker = realtimeTickers.get(market.market);
      const restTicker = tickers.find((t) => t.market === market.market);
      const ticker: WebSocketTicker | Ticker | undefined = realtimeTicker || restTicker;

      if (!ticker) {
        return {
          market: market.market,
          korean_name: market.korean_name,
          english_name: market.english_name,
          trade_price: 0,
          opening_price: 0,
          high_price: 0,
          low_price: 0,
          change: 'EVEN' as const,
          change_rate: 0,
          change_price: 0,
          acc_trade_price_24h: 0,
          acc_trade_volume_24h: 0,
        };
      }

      // WebSocketTicker 타입 가드
      const isWebSocketTicker = (t: WebSocketTicker | Ticker): t is WebSocketTicker => 'opening_price' in t;

      return {
        market: market.market,
        korean_name: market.korean_name,
        english_name: market.english_name,
        trade_price: ticker.trade_price,
        opening_price: isWebSocketTicker(ticker) ? ticker.opening_price : ticker.prev_closing_price,
        high_price: ticker.high_price,
        low_price: ticker.low_price,
        change: isWebSocketTicker(ticker) ? ticker.change : 'EVEN',
        change_rate: isWebSocketTicker(ticker) ? ticker.change_rate : ticker.signed_change_rate,
        change_price: isWebSocketTicker(ticker) ? ticker.signed_change_price : ticker.signed_change_price,
        acc_trade_price_24h: ticker.acc_trade_price_24h,
        acc_trade_volume_24h: ticker.acc_trade_volume_24h,
      };
    });
  }, [markets, tickers, realtimeTickers]);

  // 5. 정렬된 데이터
  const sortedData = useMemo(() => {
    return sortMarketData(tableData, sortBy, sortOrder);
  }, [tableData, sortBy, sortOrder]);

  // 6. 가상화 설정
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual은 React Compiler와 알려진 호환성 문제가 있음
  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement,
    estimateSize: () => 56, // 행 높이 (px) - 업비트 스타일로 컴팩트하게
    overscan: 10, // 화면 밖 10개 행 미리 렌더링
  });

  const virtualItems = virtualizer.getVirtualItems();

  // 정렬 변경 핸들러
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 로딩 상태
  if (isLoadingMarkets || isLoadingTickers) {
    return (
      <Box className={className} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* WebSocket 연결 상태 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">암호화폐 시세</Typography>
        {wsStatus === 'connected' && (
          <Chip
            label="실시간"
            size="small"
            sx={{
              bgcolor: '#26a69a',
              color: 'white',
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>

      {/* 테이블 (가상화) */}
      <Paper
        sx={{
          border: '1px solid #e0e0e0',
          boxShadow: 'none',
          width: 'fit-content',
          '& .os-scrollbar-handle': {
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
            },
          },
          '& .os-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#fafafa',
            borderBottom: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          {/* 즐겨찾기 */}
          <Box
            sx={{
              width: '26px',
              minWidth: '26px',
              maxWidth: '26px',
              flexShrink: 0,
              padding: '6px 2px',
              display: 'flex',
              alignItems: 'center',
            }}
          />

          {/* 한글명 */}
          <Box
            sx={{
              width: '120px',
              minWidth: '120px',
              maxWidth: '120px',
              flexShrink: 0,
              padding: '6px 4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TableSortLabel
              active={sortBy === 'korean_name'}
              direction={sortBy === 'korean_name' ? sortOrder : 'asc'}
              onClick={() => handleSort('korean_name')}
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
              한글명
            </TableSortLabel>
          </Box>

          {/* 현재가 */}
          <Box
            sx={{
              width: '88px',
              minWidth: '88px',
              maxWidth: '88px',
              flexShrink: 0,
              padding: '6px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TableSortLabel
              active={sortBy === 'trade_price'}
              direction={sortBy === 'trade_price' ? sortOrder : 'desc'}
              onClick={() => handleSort('trade_price')}
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
              현재가
            </TableSortLabel>
          </Box>

          {/* 전일대비 */}
          <Box
            sx={{
              width: '76px',
              minWidth: '76px',
              maxWidth: '76px',
              flexShrink: 0,
              padding: '6px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TableSortLabel
              active={sortBy === 'change_rate'}
              direction={sortBy === 'change_rate' ? sortOrder : 'desc'}
              onClick={() => handleSort('change_rate')}
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
              전일대비
            </TableSortLabel>
          </Box>

          {/* 거래대금 */}
          <Box
            sx={{
              width: '88px',
              minWidth: '88px',
              maxWidth: '88px',
              flexShrink: 0,
              padding: '6px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TableSortLabel
              active={sortBy === 'acc_trade_price_24h'}
              direction={sortBy === 'acc_trade_price_24h' ? sortOrder : 'desc'}
              onClick={() => handleSort('acc_trade_price_24h')}
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
              거래대금
            </TableSortLabel>
          </Box>
        </Box>

        {/* 바디 (가상 스크롤) */}
        <OverlayScrollbarsComponent
          ref={osRef}
          element="div"
          options={{
            scrollbars: {
              autoHide: 'never',
              autoHideDelay: 0,
            },
            overflow: {
              x: 'hidden',
              y: 'scroll',
            },
          }}
          defer
          style={{ maxHeight: '600px' }}
        >
          {/* 가상 스크롤 공간 */}
          <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {/* 보이는 행만 렌더링 */}
            {virtualItems.map((virtualRow) => {
              const row = sortedData[virtualRow.index];
              const isFavorite = favorites.has(row.market);
              const isSelected = selectedMarket === row.market;

              // 마켓 코드 파싱
              const { base, quote } = parseMarketCode(row.market);

              // 가격 변화 계산
              const priceChange = calculatePriceChange(row.opening_price, row.trade_price, COLORS.rise, COLORS.fall);

              // 하이라이트 상태
              const highlight = highlights.get(row.market);
              const highlightBgColor = highlight?.isHighlighted ? (highlight.isRise ? 'rgba(200, 74, 71, 0.15)' : 'rgba(18, 97, 196, 0.15)') : 'transparent';

              // 행 클릭 핸들러
              const handleRowClick = () => {
                setSelectedMarket(row.market);
                onRowClick?.(row.market);
              };

              return (
                <Box
                  key={row.market}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  onClick={handleRowClick}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #f5f5f5',
                    ...(isSelected && {
                      boxShadow: 'inset 3px 0 0 0 #dd3c44',
                    }),
                    backgroundColor: isSelected ? '#f5f5f5 !important' : 'transparent',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: isSelected ? '#f5f5f5 !important' : '#f5f5f5 !important',
                    },
                  }}
                >
                  {/* 즐겨찾기 */}
                  <Box
                    sx={{
                      width: '26px',
                      minWidth: '26px',
                      maxWidth: '26px',
                      flexShrink: 0,
                      padding: '6px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(row.market);
                      }}
                      sx={{ padding: '2px' }}
                    >
                      {isFavorite ? <Star sx={{ fontSize: '1rem', color: '#fbbf24' }} /> : <StarBorder sx={{ fontSize: '1rem', color: '#d1d5db' }} />}
                    </IconButton>
                  </Box>

                  {/* 한글명 */}
                  <Box
                    sx={{
                      width: '120px',
                      minWidth: '120px',
                      maxWidth: '120px',
                      flexShrink: 0,
                      padding: '6px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                      {/* 캔들 차트 */}
                      <Box
                        sx={{
                          flexShrink: 0,
                          backgroundColor: '#f5f5f5',
                          padding: '2px',
                          borderRadius: '4px',
                        }}
                      >
                        <svg width={16} height={20} style={{ display: 'block' }}>
                          <D3Candle
                            open={row.opening_price}
                            close={row.trade_price}
                            high={row.high_price}
                            low={row.low_price}
                            x={8}
                            width={5}
                            height={20}
                            minPrice={row.low_price}
                            maxPrice={row.high_price}
                          />
                        </svg>
                      </Box>
                      {/* 코인 정보 */}
                      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.75rem', wordBreak: 'break-word' }}>
                          {row.korean_name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }}>
                          {base}/{quote}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* 현재가 */}
                  <Box
                    sx={{
                      width: '88px',
                      minWidth: '88px',
                      maxWidth: '88px',
                      flexShrink: 0,
                      padding: '6px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      bgcolor: highlightBgColor,
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.75rem', color: priceChange.changeColor }}>
                      {formatPrice(row.trade_price)}
                    </Typography>
                  </Box>

                  {/* 전일대비 */}
                  <Box
                    sx={{
                      width: '76px',
                      minWidth: '76px',
                      maxWidth: '76px',
                      flexShrink: 0,
                      padding: '6px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {/* 변동률 */}
                      <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '0.75rem', color: priceChange.changeColor }}>
                        {priceChange.formattedRate}
                      </Typography>
                      {/* 변화 금액 */}
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: priceChange.changeColor }}>
                        {priceChange.formattedPriceChange}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 거래대금 */}
                  <Box
                    sx={{
                      width: '88px',
                      minWidth: '88px',
                      maxWidth: '88px',
                      flexShrink: 0,
                      padding: '6px 4px',
                      display: 'flex',
                      gap: 0.3,
                      alignItems: 'baseline',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#333' }}>
                      {formatTradePrice(row.acc_trade_price_24h)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }}>
                      백만
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </OverlayScrollbarsComponent>
      </Paper>
    </Box>
  );
}
