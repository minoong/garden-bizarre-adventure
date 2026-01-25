import { type ReactNode } from 'react';
import { Box } from '@mui/material';

import { MainHeader } from '@/widgets/main-header';

export default function TradeLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MainHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
