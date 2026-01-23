import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, useEffect } from 'react';

import { AnimatedPrice, MarketHeaderInfo } from './market-header-info';

const meta: Meta<typeof AnimatedPrice> = {
  title: 'Widgets/UpbitTradeLayout/MarketHeader',
  component: AnimatedPrice,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 4, bgcolor: '#0B1219', minWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderInfo: StoryObj<typeof MarketHeaderInfo> = {
  render: () => <MarketHeaderInfo base="BTC" quote="KRW" koreanName="비트코인" />,
};

export const PriceRolling: Story = {
  args: {
    price: '95,420,000',
    quote: 'KRW',
    color: '#c84a31',
    change: 'RISE',
  },
  render: (args) => {
    // 실시간 가격 변동 시뮬레이션
    const [price, setPrice] = useState(95420000);
    const [change, setChange] = useState<'RISE' | 'FALL'>('RISE');

    useEffect(() => {
      const interval = setInterval(() => {
        const diff = Math.floor(Math.random() * 100000) - 50000;
        setPrice((prev) => prev + diff);
        setChange(diff > 0 ? 'RISE' : 'FALL');
      }, 1500);
      return () => clearInterval(interval);
    }, []);

    const formattedPrice = new Intl.NumberFormat('ko-KR').format(price);
    const color = change === 'RISE' ? '#c84a31' : '#1261c4';

    return <AnimatedPrice {...args} price={formattedPrice} color={color} change={change} />;
  },
};

export const ManualControl: Story = {
  args: {
    price: '95,420,000',
    quote: 'KRW',
    color: '#c84a31',
    change: 'RISE',
  },
};
