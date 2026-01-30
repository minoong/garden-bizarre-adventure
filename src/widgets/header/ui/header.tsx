'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useTheme, alpha, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

import { layoutColors } from '@/shared/config/colors';
import { useSpyElem } from '@/shared/lib/use-spy-elem';

const navigationItems = [
  { label: '거래소', href: '/trade' },
  { label: '포스트', href: '/posts' },
  { label: '관리자', href: '/admin/posts/new' },
  { label: '로그인', href: '/login' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const theme = useTheme();
  const pathname = usePathname();
  const { ref, marginTop } = useSpyElem({ elemHeight: 64, threshold: 15 });

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const renderDesktopNavigation = () => (
    <Box
      component="nav"
      onMouseLeave={() => setHoveredItem(null)}
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 1,
        position: 'relative',
        height: '100%',
      }}
    >
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const isHovered = hoveredItem === item.label;

        return (
          <Box key={item.label} onMouseEnter={() => setHoveredItem(item.label)} sx={{ position: 'relative', px: 1.5, py: 1, cursor: 'pointer' }}>
            <Typography
              component={Link}
              href={item.href}
              sx={{
                color: isActive || isHovered ? 'primary.main' : '#fff',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: isActive ? 800 : 500,
                transition: 'color 0.2s ease',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {item.label}
            </Typography>

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

  const renderMobileNavigation = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 280,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo Section inside Drawer */}
        <Box
          component={Link}
          href="/"
          onClick={handleMobileMenuToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
            mb: 4,
          }}
        >
          <Box sx={{ position: 'relative', width: 32, height: 32 }}>
            <NextImage src="/images/logo.webp" alt="Logo" fill style={{ objectFit: 'contain' }} priority />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.1rem',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(45deg, #fff 30%, #999 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GARDEN BIZARRE
          </Typography>
        </Box>
        <List sx={{ flex: 1 }}>
          {navigationItems.map((item, index) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <motion.div style={{ width: '100%' }} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.05 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={handleMobileMenuToggle}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    bgcolor: pathname === item.href ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: pathname === item.href ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: pathname === item.href ? 800 : 500,
                      fontSize: '1.1rem',
                    }}
                  />
                </ListItemButton>
              </motion.div>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box>
      <AppBar
        ref={ref as React.RefObject<HTMLDivElement>}
        position="fixed"
        elevation={0}
        sx={{
          height: 64,
          background: alpha(layoutColors.dark.background, 0.8),
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          color: 'text.primary',
          boxShadow: 'none',
          transition: 'margin-top 0.3s ease-out',
          marginTop: `${marginTop}px`,
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: '1440px',
            height: '100%',
            px: { xs: 2, md: 4, lg: 6 },
          }}
        >
          <Toolbar disableGutters sx={{ height: '100%', display: 'flex', justifyContent: 'space-between' }}>
            {/* Logo Section */}
            <Box
              component={Link}
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box sx={{ position: 'relative', width: 36, height: 36 }}>
                <NextImage src="/images/logo.webp" alt="Logo" fill style={{ objectFit: 'contain' }} priority />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(45deg, #fff 30%, #999 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                GARDEN BIZARRE
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {renderDesktopNavigation()}

            {/* Mobile Toggle */}
            <IconButton color="inherit" aria-label="open drawer" onClick={handleMobileMenuToggle} sx={{ display: { xs: 'flex', md: 'none' }, ml: 2 }}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      {renderMobileNavigation()}
    </Box>
  );
};
