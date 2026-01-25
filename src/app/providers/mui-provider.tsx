'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect, useMemo } from 'react';
import type { PaletteMode } from '@mui/material';
import type * as React from 'react';

import { getTheme } from '@/app/theme';

/**
 * MUI 테마와 next-themes를 동기화하는 컴포넌트
 */
function MUIThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 하이드레이션 오류 방지를 위해 마운트된 후 렌더링
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const mode = useMemo<PaletteMode>(() => {
    return (resolvedTheme === 'dark' ? 'dark' : 'light') as PaletteMode;
  }, [resolvedTheme]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  if (!mounted) {
    // 초기 로딩 시 레이아웃 깜빡임 방지용 빈 박스 또는 기본 테마 설정 유지
    return (
      <MUIThemeProvider theme={getTheme('dark')}>
        <CssBaseline />
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </MUIThemeProvider>
    );
  }

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

export function MUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <MUIThemeWrapper>{children}</MUIThemeWrapper>
      </AppRouterCacheProvider>
    </NextThemesProvider>
  );
}
