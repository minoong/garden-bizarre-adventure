'use client';

import { useState, useMemo, useCallback, memo, useTransition } from 'react';
import { Box, Paper, Grid, Typography, useTheme } from '@mui/material';
import Lottie from 'lottie-react';

import { MiniBaselineChart } from '@/features/trading-chart/ui/mini-baseline-chart';
import {
  useRealtimeTicker,
  useSingleTicker,
  useMarkets,
  useKrwMarkets,
  formatPrice,
  formatChangeRate,
  formatChangePrice,
  formatVolume,
  parseMarketCode,
  useBithumbSocket,
  type CandleTimeframe,
} from '@/entities/bithumb';
import { CandlestickChart } from '@/features/trading-chart';
import { MarketList } from '@/features/market-list';
import tradingLottie from '@/shared/assets/lottie/trading-lottie.json';

import { MarketHeaderInfo, AnimatedPrice } from './market-header-info';

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
 * 트레이딩 헤더 컴포넌트
 * - 선택된 마켓의 실시간 데이터를 직접 구독하여 성능 최적화
 */
const TradeHeader = memo(function TradeHeader({ market, koreanName, base, quote }: { market: string; koreanName?: string; base: string; quote: string }) {
  const realtimeTicker = useRealtimeTicker(market);
  const { data: initialTicker } = useSingleTicker(market);
  const theme = useTheme();

  const ticker = realtimeTicker || initialTicker;
  const changeColor = ticker ? (ticker.change === 'RISE' ? '#c84a31' : ticker.change === 'FALL' ? '#1261c4' : '#333') : '#333';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Grid container alignItems="center" spacing={2}>
        {/* 왼쪽 그룹: 코인 이름 및 가격 정보 (세로 배치) */}
        <Grid>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* 1줄: 코인 이름 */}
            <MarketHeaderInfo base={base} quote={quote} koreanName={koreanName} />

            {/* 2줄: 가격 */}
            <AnimatedPrice price={ticker ? formatPrice(ticker.trade_price) : '---'} quote={quote} color={changeColor} change={ticker?.change} />

            {/* 3줄: 변동률 및 변동액 */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.5 }}>
              <Box
                sx={{
                  bgcolor: changeColor === '#c84a31' ? 'rgba(200, 74, 49, 0.1)' : changeColor === '#1261c4' ? 'rgba(18, 97, 196, 0.1)' : 'transparent',
                  color: changeColor,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {ticker ? formatChangeRate(ticker.signed_change_rate) : '0.00%'}
              </Box>
              <Typography variant="body2" sx={{ color: changeColor, fontWeight: 600, ml: 0.5, letterSpacing: '0.02em' }}>
                {ticker ? (ticker.change === 'RISE' ? '▲' : ticker.change === 'FALL' ? '▼' : '') : ''}
                {ticker ? formatChangePrice(ticker.signed_change_price) : '0'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* 중앙: 미니 차트 (Baseline) */}
        <Grid
          sx={{
            width: 180,
            maxWidth: 180,
            height: 80,
            mx: 4,
            display: { xs: 'none', md: 'block' },
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {ticker ? (
            <MiniBaselineChart market={`${quote}-${base}`} basePrice={ticker.prev_closing_price} currentPrice={ticker.trade_price} />
          ) : (
            <Box sx={{ width: '100%', height: '100%' }} />
          )}
        </Grid>

        {/* 고가/저가/거래량 */}
        <Grid container size="grow" justifyContent="flex-end" sx={{ ml: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* 왼쪽 컬럼: 고가, 저가 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 180 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  pb: 1,
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.02em', fontSize: '0.65rem' }}>
                  고가
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#c84a31" sx={{ letterSpacing: '0.02em', fontSize: '0.75rem' }}>
                  {ticker ? formatPrice(ticker.high_price) : '---'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.02em', fontSize: '0.65rem' }}>
                  저가
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#1261c4" sx={{ letterSpacing: '0.02em', fontSize: '0.75rem' }}>
                  {ticker ? formatPrice(ticker.low_price) : '---'}
                </Typography>
              </Box>
            </Box>

            {/* 오른쪽 컬럼: 거래량, 거래대금 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 220 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  pb: 1,
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.02em', fontSize: '0.65rem' }}>
                  거래량(24H)
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: '0.02em', fontSize: '0.75rem' }}>
                  {ticker ? formatVolume(ticker.acc_trade_volume_24h) : '---'}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, letterSpacing: '0.02em', fontSize: '0.6rem' }}>
                    {base}
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.02em', fontSize: '0.65rem' }}>
                  거래대금(24H)
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: '0.02em', fontSize: '0.75rem' }}>
                  {ticker ? formatVolume(ticker.acc_trade_price_24h) : '---'}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, letterSpacing: '0.02em', fontSize: '0.6rem' }}>
                    {quote}
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
});

/**
 * 트레이딩 레이아웃 위젯
 * - 핵심 렌더링 최적화 적용
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
        bgcolor: theme.palette.mode === 'dark' ? '#0B1219' : '#f4f7fa',
      }}
    >
      {/* 좌측 메인 영역: 헤더 + 차트 + 추가 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        {/* 프리미엄 헤더 (실시간 구독 분리됨) */}
        <TradeHeader market={selectedMarket} koreanName={currentMarketInfo?.korean_name} base={base} quote={quote} />

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
            <Paper elevation={0} sx={{ height: 400, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                호가
              </Typography>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  빗썸 호가 위젯 연동 예정
                </Typography>
              </Box>
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
            onRowClick={handleMarketSelect}
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
