/**
 * Upbit 차트 컴포넌트 사용 예제
 *
 * 이 파일은 CandlestickChart 컴포넌트를 사용하는 다양한 방법을 보여줍니다.
 * 실제 프로젝트에서 참고용으로 활용하세요.
 */

'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Box, Grid, Stack, Typography, ToggleButton, ToggleButtonGroup, Autocomplete, TextField, Switch, FormControlLabel } from '@mui/material';

import type { CandleTimeframe, Market } from '@/entities/upbit';
import { DEFAULT_MARKET, useKrwMarkets, getMarketLabel } from '@/entities/upbit';
import { CandlestickChart } from '@/features/upbit-chart/ui';

/**
 * 예제 1: 기본 사용
 */
export const BasicChartExample: FC = () => {
  return (
    <CandlestickChart
      market="KRW-BTC"
      timeframe={{ type: 'minutes', unit: 15 }}
      options={{
        height: 400,
        darkMode: true,
        showVolume: true,
      }}
    />
  );
};

/**
 * 예제 2: 실시간 업데이트 (분봉만 지원)
 */
export const RealtimeChartExample: FC = () => {
  return (
    <CandlestickChart
      market="KRW-BTC"
      timeframe={{ type: 'minutes', unit: 1 }}
      realtime={true} // WebSocket 실시간 업데이트
      options={{
        height: 500,
        darkMode: true,
        showVolume: true,
      }}
    />
  );
};

/**
 * 예제 3: 무한 스크롤 (과거 데이터 자동 로드)
 */
export const InfiniteScrollChartExample: FC = () => {
  return (
    <CandlestickChart
      market="KRW-ETH"
      timeframe={{ type: 'days' }}
      infiniteScroll={true} // 왼쪽 드래그 시 과거 데이터 로드
      initialCount={100} // 초기 로드 개수
      options={{
        height: 600,
        darkMode: true,
        showVolume: true,
      }}
    />
  );
};

/**
 * 예제 4: 인터랙티브 차트 (마켓 선택, 타임프레임 변경)
 */
export const InteractiveChartExample: FC = () => {
  const defaultMarketObject: Market = {
    market: DEFAULT_MARKET,
    korean_name: '비트코인',
    english_name: 'Bitcoin',
  };

  const [selectedMarket, setSelectedMarket] = useState<Market>(defaultMarketObject);
  const [timeframe, setTimeframe] = useState<CandleTimeframe>({ type: 'minutes', unit: 15 });
  const [darkMode, setDarkMode] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // KRW 마켓 목록 조회
  const { data: krwMarkets, isLoading } = useKrwMarkets();

  // 타임프레임 옵션
  const timeframeOptions = [
    { label: '1분', value: { type: 'minutes', unit: 1 } as CandleTimeframe },
    { label: '5분', value: { type: 'minutes', unit: 5 } as CandleTimeframe },
    { label: '15분', value: { type: 'minutes', unit: 15 } as CandleTimeframe },
    { label: '1시간', value: { type: 'minutes', unit: 60 } as CandleTimeframe },
    { label: '일봉', value: { type: 'days' } as CandleTimeframe },
    { label: '주봉', value: { type: 'weeks' } as CandleTimeframe },
    { label: '월봉', value: { type: 'months' } as CandleTimeframe },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 컨트롤 패널 */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            차트 설정
          </Typography>

          <Stack spacing={2}>
            {/* 마켓 선택 */}
            <Autocomplete
              value={selectedMarket}
              onChange={(_, newValue) => {
                if (newValue) setSelectedMarket(newValue);
              }}
              options={krwMarkets ?? []}
              loading={isLoading}
              disableClearable
              getOptionKey={(option) => option.market}
              getOptionLabel={(option) => getMarketLabel(option)}
              isOptionEqualToValue={(option, value) => option.market === value.market}
              renderInput={(params) => <TextField {...params} label="마켓 선택" size="small" />}
              sx={{ maxWidth: 400 }}
            />

            {/* 타임프레임 선택 */}
            <ToggleButtonGroup
              value={JSON.stringify(timeframe)}
              exclusive
              onChange={(_, value) => {
                if (value) {
                  const option = timeframeOptions.find((opt) => JSON.stringify(opt.value) === value);
                  if (option) setTimeframe(option.value);
                }
              }}
              size="small"
            >
              {timeframeOptions.map((opt) => (
                <ToggleButton key={opt.label} value={JSON.stringify(opt.value)}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* 옵션 토글 */}
            <Stack direction="row" spacing={2}>
              <FormControlLabel control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />} label="다크 모드" />
              <FormControlLabel control={<Switch checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} />} label="볼륨 표시" />
            </Stack>
          </Stack>
        </Box>

        {/* 차트 */}
        <CandlestickChart
          key={`${selectedMarket.market}-${JSON.stringify(timeframe)}`}
          market={selectedMarket.market}
          timeframe={timeframe}
          infiniteScroll={true}
          options={{
            height: 500,
            darkMode,
            showVolume,
          }}
        />
      </Stack>
    </Box>
  );
};

/**
 * 예제 5: 멀티 차트 (여러 마켓 동시 표시)
 */
export const MultiChartExample: FC = () => {
  const markets = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP'];

  return (
    <Stack spacing={3}>
      {markets.map((market) => (
        <Box key={market}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {market}
          </Typography>
          <CandlestickChart
            market={market}
            timeframe={{ type: 'minutes', unit: 15 }}
            options={{
              height: 300,
              darkMode: true,
              showVolume: false, // 작은 차트에서는 볼륨 숨김
            }}
          />
        </Box>
      ))}
    </Stack>
  );
};

/**
 * 예제 6: 라이트 모드 차트
 */
export const LightModeChartExample: FC = () => {
  return (
    <CandlestickChart
      market="KRW-BTC"
      timeframe={{ type: 'days' }}
      options={{
        height: 500,
        darkMode: false, // 라이트 모드
        showVolume: true,
        upColor: '#ef5350', // 빨강 (상승)
        downColor: '#26a69a', // 초록 (하락)
      }}
    />
  );
};

/**
 * 예제 7: 커스텀 색상
 */
export const CustomColorChartExample: FC = () => {
  return (
    <CandlestickChart
      market="KRW-ETH"
      timeframe={{ type: 'minutes', unit: 60 }}
      options={{
        height: 400,
        darkMode: true,
        showVolume: true,
        upColor: '#00ff00', // 녹색
        downColor: '#ff0000', // 빨강
        showGrid: false, // 그리드 숨김
      }}
    />
  );
};

/**
 * 예제 8: 반응형 차트 (Stack 레이아웃)
 */
export const ResponsiveChartExample: FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <CandlestickChart market="KRW-BTC" timeframe={{ type: 'days' }} options={{ height: 400, darkMode: true }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <CandlestickChart market="KRW-ETH" timeframe={{ type: 'days' }} options={{ height: 400, darkMode: true }} />
        </Box>
      </Stack>
    </Box>
  );
};

// ============================================================
// 사용 시 주의사항
// ============================================================

/**
 * ⚠️ 주의사항
 *
 * 1. 실시간 업데이트는 분봉에서만 작동합니다
 *    ✅ timeframe={{ type: 'minutes', unit: 1 }}, realtime={true}
 *    ❌ timeframe={{ type: 'days' }}, realtime={true}
 *
 * 2. 타임존 처리
 *    - candle_date_time_kst는 KST(+09:00) 시간입니다
 *    - 변환 시 반드시 타임존을 명시하세요
 *
 * 3. 무한 스크롤
 *    - 왼쪽으로 드래그하면 자동으로 과거 데이터 로드
 *    - to parameter를 사용해 중복 없이 로드
 *
 * 4. 성능
 *    - initialCount는 200개 이하 권장
 *    - 너무 많은 차트를 동시에 렌더링하지 마세요
 *
 * 5. TanStack Query
 *    - 차트는 useCandles 훅을 내부적으로 사용합니다
 *    - QueryClientProvider가 필요합니다
 */
