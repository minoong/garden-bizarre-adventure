import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { D3CandlestickChart } from './d3-candlestick-chart';

// QueryClient for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      retry: 1,
    },
  },
});

const meta: Meta<typeof D3CandlestickChart> = {
  title: 'Features/UpbitChart/D3CandlestickChart',
  component: D3CandlestickChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof D3CandlestickChart>;

/**
 * 기본 D3 캔들스틱 차트 (그리드, 가격축, 시간축 포함)
 */
export const Default: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 15 },
    height: 400,
    width: 800,
    initialCount: 100,
    showGrid: true,
    showPriceAxis: true,
    showTimeAxis: true,
  },
};

/**
 * 일봉 차트
 */
export const DailyChart: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'days' },
    height: 500,
    width: 1000,
    initialCount: 100,
  },
};

/**
 * 커스텀 색상
 */
export const CustomColors: Story = {
  args: {
    market: 'KRW-ETH',
    timeframe: { type: 'minutes', unit: 60 },
    height: 400,
    width: 800,
    upColor: '#00ff00',
    downColor: '#ff0000',
    backgroundColor: '#000000',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Box sx={{ bgcolor: '#000', p: 2 }}>
          <Story />
        </Box>
      </QueryClientProvider>
    ),
  ],
};

/**
 * 넓은 캔들
 */
export const WideCandles: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'days' },
    height: 400,
    width: 800,
    candleWidth: 20,
    candleSpacing: 5,
    initialCount: 50,
  },
};

/**
 * 좁은 캔들
 */
export const NarrowCandles: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 5 },
    height: 400,
    width: 800,
    candleWidth: 4,
    candleSpacing: 1,
    initialCount: 200,
  },
};

/**
 * 다크 모드
 */
export const DarkMode: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 15 },
    height: 500,
    width: 1000,
    backgroundColor: '#1a1a1a',
    upColor: '#26a69a',
    downColor: '#ef5350',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Box sx={{ bgcolor: '#0a0a0a', p: 3 }}>
          <Story />
        </Box>
      </QueryClientProvider>
    ),
  ],
};

/**
 * 단일 캔들
 */
export const SingleCandle: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'days' },
    height: 400,
    width: 200,
    initialCount: 1,
    candleWidth: 60,
    candleSpacing: 0,
    showGrid: false,
    showPriceAxis: false,
    showTimeAxis: false,
  },
};

/**
 * 축과 그리드 없이
 */
export const WithoutAxes: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 15 },
    height: 400,
    width: 800,
    showGrid: false,
    showPriceAxis: false,
    showTimeAxis: false,
  },
};

/**
 * 여러 차트 비교
 */
function MultiChartExample() {
  const markets = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f5f5f5', p: 2 }}>
      {markets.map((market) => (
        <D3CandlestickChart key={market} market={market} timeframe={{ type: 'minutes', unit: 15 }} height={250} width={600} initialCount={50} />
      ))}
    </Box>
  );
}

export const MultiChart: Story = {
  render: () => <MultiChartExample />,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
