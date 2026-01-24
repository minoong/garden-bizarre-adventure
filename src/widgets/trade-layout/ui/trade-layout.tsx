'use client';

import { useState, useMemo, useCallback, memo, useTransition } from 'react';
import { Box, Paper, Grid, Typography, useTheme } from '@mui/material';
import Lottie from 'lottie-react';

import { useMarkets, useKrwMarkets, parseMarketCode, useBithumbSocket, type CandleTimeframe } from '@/entities/bithumb';
import { CandlestickChart } from '@/features/trading-chart';
import { MarketList } from '@/features/market-list';
import tradingLottie from '@/shared/assets/lottie/trading-lottie.json';
import { Orderbook } from '@/features/orderbook';

import { TradeHeader } from './trade-header';

export interface TradeLayoutProps {
  /** 초기 선택된 마켓 */
  initialMarket?: string;
}

/**
 * 트레이딩 레이아웃 위젯
 */
const DEFAULT_TIMEFRAME: CandleTimeframe = { type: 'minutes', unit: 1 };
const CHART_OPTIONS = { height: 600, darkMode: false };

/**
 * 트레이딩 레이아웃 위젯 (핵심 렌더링 최적화 적용)
 */
export const TradeLayout = memo(function TradeLayout({ initialMarket = 'KRW-BTC' }: TradeLayoutProps) {
  const [selectedMarket, setSelectedMarket] = useState(initialMarket);
  const [chartTimeframe, setChartTimeframe] = useState<CandleTimeframe>(DEFAULT_TIMEFRAME);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const theme = useTheme();

  // 마켓 정보 (한글명 등)
  const { data: markets } = useMarkets();
  const currentMarketInfo = useMemo(() => markets?.find((m) => m.market === selectedMarket), [markets, selectedMarket]);

  // 전역 웹소켓 연결 관리 (컨테이너 역할)
  const { data: krwMarkets } = useKrwMarkets();
  const marketCodes = useMemo(() => krwMarkets?.map((m) => m.market) ?? [], [krwMarkets]);

  // 모든 KRW 마켓에 대한 ticker 구독
  useBithumbSocket(marketCodes, ['ticker']);

  // 선택된 마켓에 대한 호가(Orderbook) 구독
  useBithumbSocket([selectedMarket], ['orderbook']);

  const { base, quote } = useMemo(() => parseMarketCode(selectedMarket), [selectedMarket]);

  // 콜백 핸들러 안정화
  const handleMarketSelect = useCallback((market: string) => {
    // 마켓 전환 작업을 낮은 우선순위로 돌려 UI 프리징을 방지합니다.
    startTransition(() => {
      setSelectedMarket(market);
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 행 클릭 핸들러 (커스텀 동작이 필요한 경우)
  const onRowClick = useCallback(
    (market: string) => {
      handleMarketSelect(market);
    },
    [handleMarketSelect],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        width: '1440px',
        margin: '0 auto',
        gap: 2,
        p: 2,
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* 좌측 메인 영역: 헤더 + 차트 + 추가 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        {/* 프리미엄 헤더 (분리된 컴포넌트) */}
        <TradeHeader market={selectedMarket} koreanName={currentMarketInfo?.korean_name} base={base} quote={quote} isLoading={isPending} />

        {/* 차트 영역 */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            position: 'relative', // 레이어 겹치기를 위해 상대 경로 설정
          }}
        >
          {/* 차트 전환 중 블러 처리 레이어 */}
          {isPending && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ width: 500, height: 500, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lottie
                  style={{
                    scale: 1.3,
                  }}
                  animationData={tradingLottie}
                  loop={true}
                />
              </Box>
            </Box>
          )}

          <Box sx={{ height: 600 }}>
            <CandlestickChart market={selectedMarket} timeframe={chartTimeframe} realtime options={CHART_OPTIONS} onTimeframeChange={setChartTimeframe} />
          </Box>
        </Paper>

        {/* 추가 영역 (호가, 거래내역 등) */}
        <Grid container spacing={2}>
          <Grid size={6}>
            <Paper elevation={0} sx={{ height: 400, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
              <Orderbook market={selectedMarket} isLoading={isPending} />
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper elevation={0} sx={{ height: 400, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                최근 거래내역
              </Typography>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  실시간 체결 내역 연동 예정
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 우측 사이드바: 마켓 리스트 (Sticky) */}
      <Box
        sx={{
          position: 'sticky',
          top: 16,
          height: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <MarketList
            showTitle={false}
            showStatusChip={false}
            initialSelectedMarket={selectedMarket}
            onRowClick={onRowClick}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            searchQuery={searchQuery}
          >
            <MarketList.Search onSearch={handleSearchChange} value={searchQuery} />
            <MarketList.Header />
            <MarketList.Body maxHeight="100%" sx={{ flex: 1 }} />
          </MarketList>
        </Paper>
      </Box>
    </Box>
  );
});
