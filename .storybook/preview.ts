import type { Preview } from '@storybook/nextjs-vite';
import { Noto_Sans_KR } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

import theme from '../src/app/theme';
import '../src/app/globals.css';

// Noto Sans KR 폰트 설정
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
});

// Storybook용 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['트레이딩', ['Trade Layout'], '*', 'Widgets', 'Features', 'Shared'],
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) =>
      createElement(
        'div',
        {
          className: `${notoSansKr.className} ${notoSansKr.variable} antialiased`,
          style: { fontFamily: 'var(--font-noto-sans-kr)' },
        },
        createElement(QueryClientProvider, { client: queryClient }, createElement(ThemeProvider, { theme }, createElement(CssBaseline), createElement(Story))),
      ),
  ],
};

export default preview;
