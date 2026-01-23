import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { UpbitTradeLayout } from './upbit-trade-layout';

const meta: Meta<typeof UpbitTradeLayout> = {
  title: 'Widgets/UpbitTradeLayout',
  component: UpbitTradeLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box sx={{ minHeight: '150vh', bgcolor: '#f5f7f9' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialMarket: 'KRW-BTC',
  },
};

export const SelectedETH: Story = {
  args: {
    initialMarket: 'KRW-ETH',
  },
};
