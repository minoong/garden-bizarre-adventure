import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MainHeader } from '@/widgets/main-header';

import { TradeLayout } from './trade-layout';

const meta: Meta<typeof TradeLayout> = {
  title: '트레이딩/Trade Layout',
  component: TradeLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7f9' }}>
        <MainHeader />
        <Box component="main" sx={{ flex: 1 }}>
          <Story />
        </Box>
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
