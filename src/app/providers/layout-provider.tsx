'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';

interface LayoutProviderProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const LayoutProvider = ({ children, showFooter = true }: LayoutProviderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#000000',
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          flex: 1,
        }}
      >
        {children}
      </Box>
      {showFooter && <Footer />}
    </Box>
  );
};
