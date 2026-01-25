import { memo, useState, useEffect, useRef } from 'react';
import { Box, Paper, Grid, Typography, useTheme, Tab, Tabs } from '@mui/material';
import { motion } from 'framer-motion';

import {
  useRealtimeTicker,
  useSingleTicker,
  formatPrice,
  formatChangeRate,
  formatChangePrice,
  formatVolume,
  type Ticker,
  type WebSocketTicker,
} from '@/entities/bithumb';
import { MiniBaselineChart } from '@/features/trading-chart/ui/mini-baseline-chart';

import { MarketHeaderInfo, AnimatedPrice } from './market-header-info';
import { SyncingOverlay } from './syncing-overlay';
import { InfoView } from './trade-header-info-view';

export interface TradeHeaderProps {
  market: string;
  koreanName?: string;
  base: string;
  quote: string;
  isLoading?: boolean;
}

/**
 * 트레이딩 헤더 컴포넌트
 * - 선택된 마켓의 실시간 데이터를 직접 구독하여 성능 최적화
 * - 마켓 전환 중에는 SyncingOverlay 표시
 * - 시세/정보 탭 기능 추가 (Swiper 드래그 지원 및 데이터 깜빡임 방지)
 */
export const TradeHeader = memo(function TradeHeader({ market, koreanName, base, quote, isLoading = false }: TradeHeaderProps) {
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const realtimeTicker = useRealtimeTicker(market);
  const { data: initialTicker } = useSingleTicker(market);
  const theme = useTheme();

  // 데이터 깜빡임 방지: 새로운 마켓 데이터가 올 때까지 이전 데이터를 화면에 유지
  const [persistedTicker, setPersistedTicker] = useState<Ticker | WebSocketTicker | null>(null);

  useEffect(() => {
    const next = realtimeTicker || initialTicker;
    if (next) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersistedTicker(next);
    }
  }, [realtimeTicker, initialTicker]);

  // 마켓이 변경되면 우선순위가 낮은 데이터는 지워줍니다.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersistedTicker(null);
  }, [market]);

  const ticker = realtimeTicker || initialTicker || persistedTicker;

  // 테마에서 중앙화된 트레이딩 색상 가져오기
  const trading = theme.palette.trading;
  const changeColor = ticker
    ? ticker.change === 'RISE'
      ? trading.rise.main
      : ticker.change === 'FALL'
        ? trading.fall.main
        : trading.neutral.main
    : trading.neutral.main;

  const riseColor = trading.rise.main;
  const fallColor = trading.fall.main;
  const riseBg = trading.rise.light;
  const fallBg = trading.fall.light;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 탭 헤더 - Swiper 느낌의 깔끔한 디자인 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 0.5 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="standard"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              minHeight: 44,
              fontWeight: 800,
              fontSize: '0.875rem',
              px: 3,
              color: theme.palette.text.secondary,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <Tab label="시세" />
          <Tab label="정보" />
        </Tabs>
      </Box>

      <Box ref={containerRef} sx={{ position: 'relative', overflow: 'hidden', minHeight: 130 }}>
        {/* 프리미엄 블러 오버레이 */}
        {isLoading && <SyncingOverlay message="SYNCING MARKET DATA" />}

        {/* Swiper 스타일 슬라이딩 컨테이너 */}
        <motion.div
          animate={{ x: `-${activeTab * 50}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          style={{
            display: 'flex',
            width: '200%',
          }}
        >
          {/* 시세 탭 */}
          <Box sx={{ width: '50%', p: 2, flexShrink: 0, userSelect: 'none' }}>
            <Grid container alignItems="center" spacing={2} sx={{ filter: isLoading ? 'blur(1px)' : 'none', transition: 'filter 0.4s' }}>
              {/* 왼쪽 그룹: 코인 이름 및 가격 정보 */}
              <Grid>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <MarketHeaderInfo base={base} quote={quote} koreanName={koreanName} />
                  <AnimatedPrice price={ticker ? formatPrice(ticker.trade_price) : '---'} quote={quote} color={changeColor} change={ticker?.change} />
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.2 }}>
                    <Box
                      sx={{
                        bgcolor: ticker?.change === 'RISE' ? riseBg : ticker?.change === 'FALL' ? fallBg : 'transparent',
                        color: changeColor,
                        px: 0.8,
                        py: 0.1,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      {ticker ? formatChangeRate(ticker.signed_change_rate) : '0.00%'}
                    </Box>
                    <Typography variant="caption" sx={{ color: changeColor, fontWeight: 700, ml: 0.5 }}>
                      {ticker ? (ticker.change === 'RISE' ? '▲' : ticker.change === 'FALL' ? '▼' : '') : ''}
                      {ticker ? formatChangePrice(ticker.signed_change_price) : '0'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* 중앙: 미니 차트 */}
              <Grid
                sx={{
                  width: 160,
                  maxWidth: 160,
                  height: 60,
                  mx: 4,
                  display: { xs: 'none', lg: 'block' },
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

              {/* 고가/저가/거래량 상세 */}
              <Grid container size="grow" justifyContent="flex-end" sx={{ ml: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        pb: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        고가
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color={riseColor}>
                        {ticker ? formatPrice(ticker.high_price) : '---'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        저가
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color={fallColor}>
                        {ticker ? formatPrice(ticker.low_price) : '---'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: 180 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        pb: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        거래량(24H)
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {ticker ? formatVolume(ticker.acc_trade_volume_24h) : '---'}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.65rem' }}>
                          {base}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        거래대금(24H)
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {ticker ? formatVolume(ticker.acc_trade_price_24h) : '---'}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.65rem' }}>
                          {quote}
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* 정보 탭 */}
          <Box sx={{ width: '50%', p: 2, flexShrink: 0, userSelect: 'none' }}>
            <InfoView base={base} enabled={activeTab === 1} />
          </Box>
        </motion.div>
      </Box>
    </Paper>
  );
});
