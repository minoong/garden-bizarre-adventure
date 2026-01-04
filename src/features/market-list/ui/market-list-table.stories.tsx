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
 * 기본 마켓 리스트 테이블 (기존 컴포넌트)
 * - REST API로 KRW 마켓 목록과 초기 현재가 조회
 * - WebSocket으로 실시간 가격 업데이트
 * - 거래대금 순으로 정렬 (기본)
 *
 * ⚠️ 레거시 컴포넌트: 하위 호환성을 위해 유지됩니다.
 * 새로운 프로젝트는 MarketList (Compound Component)를 사용하세요.
 */
export const Default: Story = {
  args: {
    initialSortBy: 'acc_trade_price_24h',
    initialSortOrder: 'desc',
  },
};

/**
 * 가격 순 정렬
 * - 현재가 기준 내림차순 정렬
 */
export const SortByPrice: Story = {
  args: {
    initialSortBy: 'trade_price',
    initialSortOrder: 'desc',
  },
};

/**
 * 변동률 순 정렬
 * - 전일대비 변동률 기준 내림차순 정렬
 */
export const SortByChangeRate: Story = {
  args: {
    initialSortBy: 'change_rate',
    initialSortOrder: 'desc',
  },
};

/**
 * 코인명 순 정렬 (가나다순)
 * - 한글명 기준 오름차순 정렬
 */
export const SortByName: Story = {
  args: {
    initialSortBy: 'korean_name',
    initialSortOrder: 'asc',
  },
};

/**
 * Row 클릭 핸들러
 * - onRowClick 콜백으로 클릭 이벤트 처리
 */
export const WithRowClick: Story = {
  args: {
    initialSortBy: 'acc_trade_price_24h',
    initialSortOrder: 'desc',
    onRowClick: (market: string) => {
      console.log('Clicked:', market);
      alert(`선택된 마켓: ${market}`);
    },
  },
};
