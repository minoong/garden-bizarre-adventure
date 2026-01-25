import type { Preview } from '@storybook/nextjs-vite';
import { Noto_Sans_KR } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { MUIProvider } from '../src/app/providers';
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
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className={`${notoSansKr.className} ${notoSansKr.variable} antialiased`} style={{ fontFamily: 'var(--font-noto-sans-kr)' }}>
        <QueryClientProvider client={queryClient}>
          <MUIProvider>
            <Story />
          </MUIProvider>
        </QueryClientProvider>
      </div>
    ),
  ],
};

export default preview;
