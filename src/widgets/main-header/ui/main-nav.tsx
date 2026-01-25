'use client';

import { memo } from 'react';
import { Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [{ label: '거래소', href: '/trade' }];

/**
 * GNB 메인 네비게이션 메뉴
 */
export const MainNav = memo(function MainNav() {
  const pathname = usePathname();

  return (
    <Box component="nav" sx={{ display: 'flex', gap: 0.5, height: 60 }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <NextLink key={item.href} href={item.href} passHref legacyBehavior>
            <Link
              underline="none"
              sx={{
                px: 2,
                height: '100%',
                fontSize: '1.25rem',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? 'primary.main' : 'text.primary',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'primary.main',
                },
                ...(isActive && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: 'primary.main',
                  },
                }),
              }}
            >
              {item.label}
            </Link>
          </NextLink>
        );
      })}
    </Box>
  );
});
