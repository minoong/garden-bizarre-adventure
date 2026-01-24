import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, Paper } from '@mui/material';

import { Orderbook } from './orderbook';

const meta: Meta<typeof Orderbook> = {
  title: 'Trading/Orderbook',
  component: Orderbook,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <Box sx={{ p: 4, bgcolor: '#f4f7fa', minHeight: '600px', display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ width: 400, height: 400, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <Story />
        </Paper>
      </Box>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    market: 'KRW-BTC',
  },
};

export const Ethereum: Story = {
  args: {
    market: 'KRW-ETH',
  },
};

export const Solana: Story = {
  args: {
    market: 'KRW-SOL',
  },
};
