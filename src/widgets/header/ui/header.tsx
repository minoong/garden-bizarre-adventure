'use client';

import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/shared/ui/container';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const renderDesktopNavigation = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
      {navigationItems.map((item) => (
        <Typography
          key={item.label}
          component="a"
          href={item.href}
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {item.label}
        </Typography>
      ))}
    </Box>
  );

  const renderMobileNavigation = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 240,
        },
      }}
    >
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component="a" href={item.href} onClick={handleMobileMenuToggle}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Container>
        <Toolbar sx={{ px: { xs: 0 } }}>
          <Box
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Box sx={{ position: 'relative', width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
              <Image
                src="/images/logo.webp"
                alt="Garden Bizarre Adventure Logo"
                fill
                style={{
                  objectFit: 'contain',
                }}
                priority
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Garden Bizarre
            </Typography>
          </Box>

          {renderDesktopNavigation()}

          <IconButton
            color="inherit"
            aria-label="open drawer"
            size="large"
            edge="start"
            onClick={handleMobileMenuToggle}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
      {renderMobileNavigation()}
    </AppBar>
  );
};
