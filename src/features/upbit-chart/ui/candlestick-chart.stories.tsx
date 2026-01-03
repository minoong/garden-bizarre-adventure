import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, ToggleButton, ToggleButtonGroup, FormControlLabel, Switch, Typography, Stack, Autocomplete, TextField } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { CandleTimeframe, Market } from '@/entities/upbit';
import { DEFAULT_MARKET, getMarketLabel, useKrwMarkets } from '@/entities/upbit';

import { ALL_TIMEFRAME_OPTIONS } from '../model/types';

import { CandlestickChart } from './candlestick-chart';

// QueryClient for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      retry: 1,
    },
  },
});

const meta: Meta<typeof CandlestickChart> = {
  title: 'Features/UpbitChart/CandlestickChart',
  component: CandlestickChart,
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
type Story = StoryObj<typeof CandlestickChart>;

/**
 * 기본 캔들스틱 차트
 */
export const Default: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 15 },
    options: {
      height: 400,
      darkMode: true,
      showVolume: true,
    },
  },
};

/**
 * 라이트 모드
 */
export const LightMode: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'days' },
    options: {
      height: 400,
      darkMode: false,
      showVolume: true,
    },
  },
};

/**
 * 볼륨 없이
 */
export const WithoutVolume: Story = {
  args: {
    market: 'KRW-ETH',
    timeframe: { type: 'minutes', unit: 60 },
    options: {
      height: 400,
      darkMode: true,
      showVolume: false,
    },
  },
};

/**
 * 실시간 업데이트 (분봉만 지원)
 */
export const Realtime: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'minutes', unit: 1 },
    realtime: true,
    options: {
      height: 400,
      darkMode: true,
      showVolume: true,
    },
  },
};

/**
 * 무한 스크롤 (과거 데이터 로드)
 * 차트를 왼쪽으로 드래그하면 자동으로 과거 데이터를 로드합니다.
 */
export const InfiniteScroll: Story = {
  args: {
    market: 'KRW-BTC',
    timeframe: { type: 'days' },
    infiniteScroll: true,
    initialCount: 100,
    options: {
      height: 500,
      darkMode: true,
      showVolume: true,
    },
  },
};

/**
 * 인터랙티브 플레이그라운드
 */
function PlaygroundExample() {
  // 기본 마켓 객체 (실제 데이터 로드 전까지 사용)
  const defaultMarketObject: Market = {
    market: DEFAULT_MARKET,
    korean_name: '비트코인',
    english_name: 'Bitcoin',
  };

  const [selectedMarket, setSelectedMarket] = useState<Market>(defaultMarketObject);
  const [timeframe, setTimeframe] = useState<CandleTimeframe>({ type: 'minutes', unit: 1 });
  const [darkMode, setDarkMode] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [realtime, setRealtime] = useState(true);
  const [infiniteScroll, setInfiniteScroll] = useState(true);

  // KRW 마켓 목록 조회
  const { data: krwMarkets, isLoading: isLoadingMarkets } = useKrwMarkets();

  // 초기 마켓 설정 (API 데이터 로드 시 실제 데이터로 교체)
  useEffect(() => {
    if (krwMarkets && krwMarkets.length > 0 && selectedMarket === defaultMarketObject) {
      const defaultMarket = krwMarkets.find((m) => m.market === DEFAULT_MARKET) ?? krwMarkets[0];
      setSelectedMarket(defaultMarket);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [krwMarkets]);

  const handleTimeframeChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (!value) return;

    const option = ALL_TIMEFRAME_OPTIONS.find((opt) => {
      if (opt.value.type === 'minutes') {
        return value === `minutes-${opt.value.unit}`;
      }
      return value === opt.value.type;
    });

    if (option) {
      setTimeframe(option.value);
      // 분봉이 아니면 실시간 비활성화
      if (option.value.type !== 'minutes') {
        setRealtime(false);
      }
    }
  };

  const getTimeframeValue = () => {
    if (timeframe.type === 'minutes') {
      return `minutes-${timeframe.unit}`;
    }
    return timeframe.type;
  };

  // 마켓 코드 추출
  const market = selectedMarket.market;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200 }}>
      {/* 컨트롤 패널 */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        {/* 마켓 선택 */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? 'white' : 'black' }}>
            마켓
          </Typography>
          <Autocomplete
            value={selectedMarket}
            onChange={(_, newValue) => {
              if (newValue) setSelectedMarket(newValue);
            }}
            options={krwMarkets ?? []}
            loading={isLoadingMarkets}
            disableClearable
            getOptionKey={(option) => option.market}
            getOptionLabel={(option) => getMarketLabel(option)}
            isOptionEqualToValue={(option, value) => option.market === value.market}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="마켓 선택"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: darkMode ? 'white' : 'black',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255,255,255,0.3)' : undefined,
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? 'rgba(255,255,255,0.5)' : undefined,
                    },
                  },
                }}
              />
            )}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {/* 타임프레임 선택 */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? 'white' : 'black' }}>
            타임프레임
          </Typography>
          <ToggleButtonGroup
            value={getTimeframeValue()}
            exclusive
            onChange={handleTimeframeChange}
            size="small"
            sx={{
              flexWrap: 'wrap',
              '& .MuiToggleButton-root': {
                color: darkMode ? 'rgba(255,255,255,0.7)' : undefined,
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : undefined,
                '&.Mui-selected': {
                  bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                  color: 'white',
                },
              },
            }}
          >
            {ALL_TIMEFRAME_OPTIONS.map((opt) => {
              const value = opt.value.type === 'minutes' ? `minutes-${opt.value.unit}` : opt.value.type;
              return (
                <ToggleButton key={value} value={value}>
                  {opt.label}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>

        {/* 옵션 */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
            label="다크 모드"
            sx={{ color: darkMode ? 'white' : 'black' }}
          />
          <FormControlLabel
            control={<Switch checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} />}
            label="볼륨 표시"
            sx={{ color: darkMode ? 'white' : 'black' }}
          />
          <FormControlLabel
            control={<Switch checked={realtime} onChange={(e) => setRealtime(e.target.checked)} disabled={timeframe.type !== 'minutes'} />}
            label="실시간 업데이트"
            sx={{ color: darkMode ? 'white' : 'black' }}
          />
          <FormControlLabel
            control={<Switch checked={infiniteScroll} onChange={(e) => setInfiniteScroll(e.target.checked)} />}
            label="무한 스크롤"
            sx={{ color: darkMode ? 'white' : 'black' }}
          />
        </Stack>
      </Stack>

      {/* 현재 설정 표시 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          {market} · {ALL_TIMEFRAME_OPTIONS.find((o) => JSON.stringify(o.value) === JSON.stringify(timeframe))?.label}
          {realtime && ' · 실시간'}
          {infiniteScroll && ' · 무한 스크롤'}
        </Typography>
      </Box>

      {/* 차트 */}
      <CandlestickChart
        key={`${market}-${JSON.stringify(timeframe)}`}
        market={market}
        timeframe={timeframe}
        realtime={realtime}
        infiniteScroll={infiniteScroll}
        options={{
          height: 500,
          darkMode,
          showVolume,
        }}
      />
    </Box>
  );
}

export const Playground: Story = {
  render: () => <PlaygroundExample />,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Box sx={{ p: 3, bgcolor: '#121212', minHeight: '100vh' }}>
          <Story />
        </Box>
      </QueryClientProvider>
    ),
  ],
};

/**
 * 여러 차트 비교
 */
function MultiChartExample() {
  const markets = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP'];

  return (
    <Stack spacing={2}>
      {markets.map((market) => (
        <Box key={market}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
            {market}
          </Typography>
          <CandlestickChart
            market={market}
            timeframe={{ type: 'minutes', unit: 15 }}
            options={{
              height: 250,
              darkMode: true,
              showVolume: false,
            }}
          />
        </Box>
      ))}
    </Stack>
  );
}

export const MultiChart: Story = {
  render: () => <MultiChartExample />,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Box sx={{ p: 3, bgcolor: '#121212', minHeight: '100vh' }}>
          <Story />
        </Box>
      </QueryClientProvider>
    ),
  ],
};
