import { Box, Paper, Typography, Button, Chip, Stack, useMediaQuery, useTheme } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import Link from 'next/link';
import type { Variants } from 'motion/react';
import { motion } from 'motion/react';

import { CandlestickChart } from '@/features/trading-chart/ui/candlestick-chart';
import { MarketList } from '@/features/market-list';
import { layoutColors, tradingColors } from '@/shared/config/colors';

export const TradeSection = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, md: 4 },
          minHeight: 500,
        }}
      >
        {/* Background Decorative Element */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '40%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Main Chart Dashboard - Full Width */}
        <motion.div
          variants={itemVariants}
          style={{
            width: '100%',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Decorative background glow */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
              filter: 'blur(60px)',
              zIndex: -1,
            }}
          />

          <Paper
            sx={{
              width: '100%',
              maxWidth: '1440px',
              height: 520,
              bgcolor: 'rgba(30, 30, 34, 0.7)', // Slightly darker variant of paper
              backdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor: layoutColors.dark.border,
              p: 2,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.005)',
                boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${tradingColors.rise.main}40`, // Rise accent glow
                borderColor: tradingColors.rise.main,
              },
            }}
          >
            {/* Cyber Corners */}
            {[
              { top: 12, left: 12, borderLeft: `2px solid ${tradingColors.rise.main}`, borderTop: `2px solid ${tradingColors.rise.main}` },
              { top: 12, right: 12, borderRight: `2px solid ${tradingColors.rise.main}`, borderTop: `2px solid ${tradingColors.rise.main}` },
              { bottom: 12, left: 12, borderLeft: `2px solid ${tradingColors.rise.main}`, borderBottom: `2px solid ${tradingColors.rise.main}` },
              { bottom: 12, right: 12, borderRight: `2px solid ${tradingColors.rise.main}`, borderBottom: `2px solid ${tradingColors.rise.main}` },
            ].map((style, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  opacity: 0.6,
                  pointerEvents: 'none',
                  zIndex: 5,
                  ...style,
                }}
              />
            ))}

            {/* Holographic Scanline */}
            <motion.div
              animate={{
                top: ['-10%', '110%'],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                height: '40px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 215, 0, 0.03), transparent)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ width: '100%', flex: 1, minHeight: 0, position: 'relative', mt: 3, overflow: 'hidden' }}>
              {!isTablet ? (
                <>
                  <CandlestickChart
                    market="KRW-BTC"
                    timeframe={{ type: 'minutes', unit: 15 }}
                    showToolbar={true}
                    realtime
                    options={{
                      height: 440,
                      darkMode: true,
                      showVolume: true,
                      showMovingAverage: true,
                      movingAveragePeriods: [5, 20, 60],
                    }}
                  />
                  {/* Permanent overlay to prevent chart interaction (zoom/scroll) on homepage */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10,
                      cursor: 'default',
                      bgcolor: 'transparent',
                    }}
                  />
                </>
              ) : (
                <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                  <MarketList showTitle={false}>
                    <MarketList.Paper sx={{ height: '100%', bgcolor: 'transparent', border: 'none', boxShadow: 'none' }}>
                      <MarketList.Header />
                      <MarketList.Body />
                    </MarketList.Paper>
                  </MarketList>
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>

        {/* Callout Area: Separated Section */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: '32px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              px: { xs: 2.5, md: 8 },
              py: { xs: 4, md: 5 },
              bgcolor: 'rgba(23, 23, 28, 0.4)',
              backdropFilter: 'blur(8px)',
              borderTop: `1px solid ${layoutColors.dark.border}`,
              borderBottom: `1px solid ${layoutColors.dark.border}`,
              gap: { xs: 3, md: 4 },
            }}
          >
            {/* Top row: Description and CTA */}
            <Box
              sx={{
                width: '100%',
                maxWidth: '1440px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: 3,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
                  flexGrow: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <InfoOutlined sx={{ color: tradingColors.rise.main, fontSize: { xs: 24, sm: 28 } }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '0.85rem', sm: '1.1rem' },
                    lineHeight: 1.5,
                    fontWeight: 400,
                  }}
                >
                  더 빠르고 정확한 실시간 시세 예측과 전문적인 차트 분석은{' '}
                  <Typography component="span" variant="h6" sx={{ color: tradingColors.rise.main, fontWeight: 'bold', fontSize: 'inherit' }}>
                    거래소 페이지
                  </Typography>
                  에서 확인하세요.
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/trade"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: tradingColors.rise.main,
                  color: '#fff',
                  fontWeight: 900,
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.8, sm: 2.2 },
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  borderRadius: '100px',
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  boxShadow: `0 20px 40px ${tradingColors.rise.main}30`,
                  position: 'relative',
                  overflow: 'hidden',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    bgcolor: tradingColors.rise.main,
                    transform: 'scale(1.05) rotate(3deg)',
                    boxShadow: `0 25px 50px ${tradingColors.rise.main}50`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                거래소 시세 확인하기 →
              </Button>
            </Box>

            {/* Bottom row: Tech Stack Chips */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              sx={{
                width: '100%',
                mt: { xs: 0, sm: 1 },
                gap: { xs: 1, sm: 1.5 },
                opacity: 0.8,
              }}
            >
              {['Bithumb API', 'CoinGecko API', 'WebSocket', 'Lightweight Charts', 'D3.js', 'Zustand', '@tanstack/react-virtual', 'React Concurrency'].map(
                (tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(79, 195, 247, 0.05)',
                      color: 'rgba(79, 195, 247, 0.6)',
                      border: '1px solid rgba(79, 195, 247, 0.15)',
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      fontWeight: 600,
                      cursor: 'default',
                      height: { xs: '22px', sm: '26px' },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(79, 195, 247, 0.1)',
                        color: '#4FC3F7',
                        borderColor: '#4FC3F7',
                        transform: 'rotate(3deg)',
                      },
                    }}
                  />
                ),
              )}
            </Stack>
          </Box>
        </motion.div>
      </Box>
    </motion.section>
  );
};
