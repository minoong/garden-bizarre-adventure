'use client';

import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Box, Typography, Link, Chip, Skeleton, Grid } from '@mui/material';

import { useCoinInfo } from '@/entities/coingecko/hooks/use-coin-info';

interface InfoViewProps {
  base: string;
  enabled?: boolean;
}

export function InfoView({ base, enabled = true }: InfoViewProps) {
  const { data: info, isLoading } = useCoinInfo(base, enabled);

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {/* 1. 기본 정보 스켈레톤 */}
        <Grid size={{ xs: 12, md: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="text" width={80} height={24} />
              <Skeleton variant="rectangular" width={40} height={18} sx={{ borderRadius: 0.5 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Skeleton variant="text" width={40} height={16} />
              <Skeleton variant="text" width={40} height={16} />
            </Box>
          </Box>
        </Grid>

        {/* 2. 설명문 스켈레톤 */}
        <Grid size={{ xs: 12, md: 5.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="95%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
        </Grid>

        {/* 3. 마켓 통계 스켈레톤 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: { md: 2 }, borderLeft: { md: (theme) => `1px solid ${theme.palette.divider}` } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton variant="text" width={60} height={14} />
              <Skeleton variant="text" width={80} height={14} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton variant="text" width={60} height={14} />
              <Skeleton variant="text" width={80} height={14} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton variant="text" width={60} height={14} />
              <Skeleton variant="text" width={80} height={14} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (!info) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">코인 정보를 불러올 수 없습니다.</Typography>
      </Box>
    );
  }

  // 간단한 설명 (영문 우선, 한글이 있다면 한글)
  const description = info.description?.ko || info.description?.en || '설명이 없습니다.';
  const cleanDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 150) + (description.length > 150 ? '...' : '');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNum = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* 1. 기본 정보 & 링크 */}
        <Grid size={{ xs: 12, md: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="900" noWrap>
                {info.name}
              </Typography>
              <Chip
                label={`#${info.market_cap_rank || '?'}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 900, height: 18, fontSize: '0.6rem', borderRadius: 0.5 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {info.links.homepage[0] && (
                <Link
                  href={info.links.homepage[0]}
                  target="_blank"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}
                >
                  <TravelExploreIcon sx={{ fontSize: 13 }} />
                  <Typography variant="caption" fontWeight={700} fontSize="0.65rem">
                    WEB
                  </Typography>
                </Link>
              )}
              {info.links.twitter_screen_name && (
                <Link
                  href={`https://twitter.com/${info.links.twitter_screen_name}`}
                  target="_blank"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1DA1F2' }}
                >
                  <TwitterIcon sx={{ fontSize: 13 }} />
                  <Typography variant="caption" fontWeight={700} fontSize="0.65rem">
                    SNS
                  </Typography>
                </Link>
              )}
            </Box>
          </Box>
        </Grid>

        {/* 2. 설명문 (중앙 집중) */}
        <Grid size={{ xs: 12, md: 5.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              opacity: 0.85,
              fontSize: '0.725rem',
            }}
          >
            {cleanDescription}
          </Typography>
        </Grid>

        {/* 3. 마켓 통계 (심플하게) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              pl: { md: 2 },
              borderLeft: { md: (theme) => `1px solid ${theme.palette.divider}` },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem" fontWeight={600}>
                Market Cap
              </Typography>
              <Typography variant="caption" fontWeight={800} fontSize="0.65rem">
                {formatCurrency(info.market_data.market_cap.usd)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem" fontWeight={600}>
                Supply
              </Typography>
              <Typography variant="caption" fontWeight={800} fontSize="0.65rem">
                {formatNum(info.market_data.circulating_supply)} {info.symbol.toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem" fontWeight={600}>
                24h Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8 }}>
                <Typography variant="caption" fontWeight={900} color="trading.rise.main" fontSize="0.65rem">
                  {formatNum(info.market_data.high_24h.usd)}
                </Typography>
                <Typography
                  variant="caption"
                  borderLeft="1px solid"
                  borderColor="divider"
                  pl={0.8}
                  fontWeight={900}
                  color="trading.fall.main"
                  fontSize="0.65rem"
                >
                  {formatNum(info.market_data.low_24h.usd)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.disabled" sx={{ position: 'absolute', bottom: -18, right: 0, fontSize: '0.6rem', opacity: 0.6 }}>
        Powered by CoinGecko
      </Typography>
    </Box>
  );
}
