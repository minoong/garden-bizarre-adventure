import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, useEffect } from 'react';

import { AnimatedPrice, MarketHeaderInfo } from './market-header-info';

const meta: Meta<typeof MarketHeaderInfo> = {
  title: '트레이딩/Layout Components/Market Header',
  component: MarketHeaderInfo,
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

export const HeaderInfo: StoryObj<typeof MarketHeaderInfo> = {
  render: () => <MarketHeaderInfo base="BTC" quote="KRW" koreanName="비트코인" />,
};

export const PriceRolling: StoryObj<typeof AnimatedPrice> = {
  args: {
    price: 95420000,
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
    const color = change === 'RISE' ? '#c84a31' : '#1261c4';

    return <AnimatedPrice {...args} price={price} color={color} change={change} />;
  },
};

export const ManualControl: StoryObj<typeof AnimatedPrice> = {
  args: {
    price: 95420000,
    quote: 'KRW',
    color: '#c84a31',
    change: 'RISE',
  },
};
