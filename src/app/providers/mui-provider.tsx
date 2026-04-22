'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type * as React from 'react';

import { getTheme } from '@/app/theme';
import { createThemeCookie, type AppThemeMode, type AppThemeSetting } from '@/shared/lib/theme/theme-cookie';

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

function MUIThemeBridge({
  children,
  initialTheme,
  needsThemeBootstrap,
}: {
  children: React.ReactNode;
  initialTheme: AppThemeMode;
  needsThemeBootstrap: boolean;
}) {
  const { resolvedTheme } = useNextTheme();
  const isHydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerSnapshot);
  const resolvedMode = resolvedTheme === 'dark' ? 'dark' : resolvedTheme === 'light' ? 'light' : initialTheme;
  const mode = isHydrated ? resolvedMode : initialTheme;
  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    if (isHydrated && (resolvedTheme === 'dark' || resolvedTheme === 'light')) {
      document.cookie = createThemeCookie(resolvedTheme);
    }
  }, [isHydrated, resolvedTheme]);

  useEffect(() => {
    if (!needsThemeBootstrap || (isHydrated && (resolvedTheme === 'dark' || resolvedTheme === 'light'))) {
      document.body.removeAttribute('data-theme-pending');
    }
  }, [isHydrated, needsThemeBootstrap, resolvedTheme]);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

export function MUIProvider({
  children,
  initialTheme,
  needsThemeBootstrap = false,
}: {
  children: React.ReactNode;
  initialTheme: AppThemeSetting;
  needsThemeBootstrap?: boolean;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={initialTheme}
        enableSystem={initialTheme === 'system'}
        disableTransitionOnChange
        themes={['light', 'dark']}
      >
        <MUIThemeBridge initialTheme={initialTheme === 'dark' ? 'dark' : 'light'} needsThemeBootstrap={needsThemeBootstrap}>
          {children}
        </MUIThemeBridge>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
