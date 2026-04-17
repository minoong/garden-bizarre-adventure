'use client';

import { Box, Container, Link, Button, useTheme, alpha } from '@mui/material';
import { memo } from 'react';
import NextImage from 'next/image';
import NextLink from 'next/link';

import { MainNav } from './main-nav';
import { HeaderClock } from './header-clock';

/**
 * 전역 네비게이션 바 (GNB)
 * - 로고, 메인 메뉴, 실시간 시계, 유저 메뉴 포함
 */
export const MainHeader = memo(function MainHeader() {
  const theme = useTheme();

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        height: 60,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          minWidth: '1440px',
          width: '1440px',
          mx: 'auto',
          px: '16px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 왼쪽 섹션: 로고 + 주 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link component={NextLink} href="/" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
            <NextImage src="/images/logo.webp" alt="Logo" width={24} height={34} style={{ display: 'block' }} priority />
          </Link>

          <MainNav />
        </Box>

        {/* 오른쪽 섹션: 유틸리티 메뉴 */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <HeaderClock />

            <Link
              href="#"
              underline="none"
              sx={{
                color: 'text.secondary',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'color 0.2s',
                '&:hover': { color: 'text.primary' },
              }}
            >
              My
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                color: 'text.secondary',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'color 0.2s',
                '&:hover': { color: 'text.primary' },
              }}
            >
              고객센터
            </Link>
          </Box>

          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: theme.palette.divider,
              color: 'text.primary',
              fontWeight: 800,
              fontSize: '0.85rem',
              px: 2,
              borderRadius: 1,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            로그인
          </Button>
        </Box>
      </Container>
    </Box>
  );
});
