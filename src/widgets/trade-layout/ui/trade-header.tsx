'use client';

import { memo } from 'react';
import { Box, Paper, Grid, Typography, useTheme } from '@mui/material';

import { useRealtimeTicker, useSingleTicker, formatPrice, formatChangeRate, formatChangePrice, formatVolume } from '@/entities/bithumb';
import { MiniBaselineChart } from '@/features/trading-chart/ui/mini-baseline-chart';

import { MarketHeaderInfo, AnimatedPrice } from './market-header-info';
import { SyncingOverlay } from './syncing-overlay';

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
 */
export const TradeHeader = memo(function TradeHeader({ market, koreanName, base, quote, isLoading = false }: TradeHeaderProps) {
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 프리미엄 블러 오버레이 */}
      {isLoading && <SyncingOverlay message="SYNCING MARKET DATA" />}

      <Grid container alignItems="center" spacing={2} sx={{ filter: isLoading ? 'blur(1px)' : 'none', transition: 'filter 0.4s' }}>
        {/* 왼쪽 그룹: 코인 이름 및 가격 정보 */}
        <Grid>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <MarketHeaderInfo base={base} quote={quote} koreanName={koreanName} />
            <AnimatedPrice price={ticker ? formatPrice(ticker.trade_price) : '---'} quote={quote} color={changeColor} change={ticker?.change} />
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
                }}
              >
                {ticker ? formatChangeRate(ticker.signed_change_rate) : '0.00%'}
              </Box>
              <Typography variant="body2" sx={{ color: changeColor, fontWeight: 600, ml: 0.5 }}>
                {ticker ? (ticker.change === 'RISE' ? '▲' : ticker.change === 'FALL' ? '▼' : '') : ''}
                {ticker ? formatChangePrice(ticker.signed_change_price) : '0'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* 중앙: 미니 차트 */}
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

        {/* 고가/저가/거래량 상세 */}
        <Grid container size="grow" justifyContent="flex-end" sx={{ ml: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
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
                <Typography variant="caption" color="text.secondary">
                  고가
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#c84a31">
                  {ticker ? formatPrice(ticker.high_price) : '---'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  저가
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#1261c4">
                  {ticker ? formatPrice(ticker.low_price) : '---'}
                </Typography>
              </Box>
            </Box>
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
                <Typography variant="caption" color="text.secondary">
                  거래량(24H)
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {ticker ? formatVolume(ticker.acc_trade_volume_24h) : '---'}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {base}
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  거래대금(24H)
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {ticker ? formatVolume(ticker.acc_trade_price_24h) : '---'}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
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
