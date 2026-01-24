'use client';

import { createTheme, type PaletteMode } from '@mui/material/styles';

import { tradingColors, layoutColors } from '@/shared/config/colors';

declare module '@mui/material/styles' {
  interface Palette {
    trading: typeof tradingColors;
  }
  interface PaletteOptions {
    trading?: typeof tradingColors;
  }
}

export const getTheme = (mode: PaletteMode) => {
  const layout = layoutColors[mode];

  return createTheme({
    typography: {
      fontFamily: 'var(--font-noto-sans-kr)',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
    },
    palette: {
      mode,
      primary: {
        main: '#1261c4',
      },
      background: {
        default: layout.background,
        paper: layout.paper,
      },
      text: {
        primary: layout.textPrimary,
        secondary: layout.textSecondary,
      },
      trading: tradingColors,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: 'var(--font-noto-sans-kr)',
            backgroundColor: layout.background,
            color: layout.textPrimary,
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: layout.paper,
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });
};

// 기본 내보내기 (기존 코드 호환성 유지용, 가급적 getTheme 사용 권장)
const theme = getTheme('light');
export default theme;
