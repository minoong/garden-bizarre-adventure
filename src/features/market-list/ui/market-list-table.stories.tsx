import type { FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MarketListTable } from './market-list-table';

// Storybook용 QueryClient 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const meta = {
  title: 'Features/MarketList/MarketListTable',
  component: MarketListTable,
  decorators: [
    (Story: FC) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MarketListTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 마켓 리스트 테이블
 * - REST API로 KRW 마켓 목록과 초기 현재가 조회
 * - WebSocket으로 실시간 가격 업데이트
 * - 거래대금 순으로 정렬 (기본)
 */
export const Default: Story = {
  args: {
    initialSortBy: 'acc_trade_price_24h',
  },
};
