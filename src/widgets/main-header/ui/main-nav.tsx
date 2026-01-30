'use client';

import { memo, useState } from 'react';
import { Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

const NAV_ITEMS = [
  { label: '거래소', href: '/trade' },
  { label: '포스트', href: '/posts' },
  { label: '관리자', href: '/admin/posts/new' },
  { label: '로그인', href: '/login' },
];

/**
 * GNB 메인 네비게이션 메뉴
 */
export const MainNav = memo(function MainNav() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <Box
      component="nav"
      onMouseLeave={() => setHoveredItem(null)}
      sx={{
        display: 'flex',
        gap: 0.5,
        height: 60,
        position: 'relative',
        alignItems: 'center',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const isHovered = hoveredItem === item.label;

        return (
          <Box
            key={item.href}
            onMouseEnter={() => setHoveredItem(item.label)}
            sx={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              cursor: 'pointer',
            }}
          >
            <NextLink href={item.href} passHref legacyBehavior>
              <Link
                underline="none"
                sx={{
                  zIndex: 1,
                  fontSize: '1rem',
                  fontWeight: isActive ? 800 : 500,
                  color: isActive || isHovered ? 'primary.main' : 'text.primary',
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </Link>
            </NextLink>

            {/* Sliding Indicator */}
            <AnimatePresence mode="popLayout">
              {(isHovered || (isActive && !hoveredItem)) && (
                <Box
                  component={motion.div}
                  layoutId="main-nav-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    bgcolor: 'primary.main',
                  }}
                />
              )}
            </AnimatePresence>
          </Box>
        );
      })}
    </Box>
  );
});
