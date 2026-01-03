'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, DeepPartial, ChartOptions as LWChartOptions, LogicalRange } from 'lightweight-charts';
import { Box, CircularProgress, Typography } from '@mui/material';

import {
  useCandles,
  useUpbitSocket,
  fetchCandles,
  type CandleTimeframe,
  type MinuteCandle,
  type DayCandle,
  type WeekCandle,
  type MonthCandle,
  MINUTE_UNIT_TO_WS_TYPE,
} from '@/entities/upbit';

import type { ChartOptions } from '../model/types';
import { DEFAULT_CHART_OPTIONS } from '../model/types';
import { getPreviousCandleTime, toChartCandles, toVolumeDataArray, wsToChartCandle, wsToVolumeData } from '../lib/transform';

type CandleData = MinuteCandle | DayCandle | WeekCandle | MonthCandle;

/** 무한 스크롤 로드 임계값 (왼쪽 끝 N개 bar 이내면 로드) */
const INFINITE_SCROLL_THRESHOLD = 10;
/** 한 번에 로드할 추가 캔들 개수 */
const LOAD_MORE_COUNT = 100;

interface CandlestickChartProps {
  /** 마켓 코드 */
  market: string;
  /** 타임프레임 */
  timeframe: CandleTimeframe;
  /** 차트 옵션 */
  options?: ChartOptions;
  /** 실시간 업데이트 활성화 */
  realtime?: boolean;
  /** 초기 캔들 개수 */
  initialCount?: number;
  /** 무한 스크롤 활성화 */
  infiniteScroll?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * 업비트 캔들스틱 차트
 */
export function CandlestickChart({
  market,
  timeframe,
  options,
  realtime = false,
  initialCount = 200,
  infiniteScroll = true,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // 모든 로드된 캔들 데이터 저장 (무한 스크롤용)
  const allCandlesRef = useRef<CandleData[]>([]);
  const isLoadingMoreRef = useRef(false);
  const hasMoreDataRef = useRef(true);
  const epochRef = useRef(0); // 타임프레임/마켓 변경 시 증가
  const chartInitializedRef = useRef(false); // 차트가 현재 데이터로 초기화되었는지
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 옵션 병합
  const chartOptions = { ...DEFAULT_CHART_OPTIONS, ...options };
  const { height, darkMode, upColor, downColor, showGrid, showVolume } = chartOptions;

  // REST API로 초기 데이터 로드
  const { data: candles, isLoading, error } = useCandles(market, timeframe, { count: initialCount });

  // WebSocket 실시간 데이터 (realtime이 true이고 분봉일 때만)
  const candleType = timeframe.type === 'minutes' ? MINUTE_UNIT_TO_WS_TYPE[timeframe.unit] : undefined;
  const { candles: realtimeCandles, status: wsStatus } = useUpbitSocket(realtime && candleType ? [market] : [], realtime && candleType ? ['candle'] : [], {
    autoConnect: realtime && !!candleType,
    candleType,
  });

  // 추가 과거 데이터 로드 함수
  const loadMoreCandles = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreDataRef.current || allCandlesRef.current.length === 0) {
      return;
    }

    // 차트가 초기화되지 않았으면 스킵
    if (!chartInitializedRef.current || !candleSeriesRef.current) {
      return;
    }

    const currentEpoch = epochRef.current;
    // fetch 전에 가장 오래된 캔들 시간 캡처 (병합 검증용)
    const oldestCandleTime = allCandlesRef.current[allCandlesRef.current.length - 1].candle_date_time_kst;

    // to parameter는 inclusive이므로 1 타임프레임 단위 이전 시간 사용 (중복 방지)
    const toParam = getPreviousCandleTime(oldestCandleTime, timeframe);

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const moreCandles = await fetchCandles(market, timeframe, {
        to: toParam,
        count: LOAD_MORE_COUNT,
      });

      // epoch가 변경되었으면 stale 데이터이므로 무시
      if (currentEpoch !== epochRef.current) {
        return;
      }

      if (moreCandles.length === 0) {
        hasMoreDataRef.current = false;
        return;
      }

      console.log('📊 [loadMoreCandles] Fetched:', {
        market,
        timeframe,
        oldestCandleTime,
        toParam,
        moreCandlesCount: moreCandles.length,
        firstCandle: moreCandles[0]?.candle_date_time_kst,
        lastCandle: moreCandles[moreCandles.length - 1]?.candle_date_time_kst,
      });

      // 중복 제거: candle_date_time_kst와 candle_date_time_utc 둘 다 체크
      const existingKeys = new Set(allCandlesRef.current.map((c) => `${c.candle_date_time_kst}|${c.candle_date_time_utc}`));

      console.log('🔑 [loadMoreCandles] Existing keys:', existingKeys.size);

      const newCandles = moreCandles.filter((candle) => !existingKeys.has(`${candle.candle_date_time_kst}|${candle.candle_date_time_utc}`));

      const duplicatesRemoved = moreCandles.length - newCandles.length;
      console.log('🔄 [loadMoreCandles] After dedup:', {
        newCandlesCount: newCandles.length,
        duplicatesRemoved,
        duplicates:
          duplicatesRemoved > 0
            ? moreCandles.filter((c) => existingKeys.has(`${c.candle_date_time_kst}|${c.candle_date_time_utc}`)).map((c) => c.candle_date_time_kst)
            : [],
      });

      if (newCandles.length === 0) {
        console.log('⚠️ [loadMoreCandles] No new candles after dedup');
        hasMoreDataRef.current = false;
        return;
      }

      // 차트 시리즈가 여전히 유효한지 재확인
      if (!chartInitializedRef.current || !candleSeriesRef.current || currentEpoch !== epochRef.current) {
        return;
      }

      // 현재 oldest 캔들과 요청 시점의 oldest가 같은지 확인 (다른 fetch가 먼저 완료되었는지)
      const currentOldest = allCandlesRef.current[allCandlesRef.current.length - 1];
      if (currentOldest.candle_date_time_kst !== oldestCandleTime) {
        return;
      }

      // 기존 데이터에 추가 (과거 데이터는 뒤에 추가 - API는 최신순 반환)
      allCandlesRef.current = [...allCandlesRef.current, ...newCandles];

      console.log('📈 [loadMoreCandles] Total candles after merge:', allCandlesRef.current.length);

      // allCandlesRef 기반으로 전체 데이터 재설정
      const allChartCandles = toChartCandles(allCandlesRef.current);

      console.log('⏰ [loadMoreCandles] Chart candles timestamps:', {
        first: { time: allChartCandles[0]?.time, kst: allCandlesRef.current[0]?.candle_date_time_kst },
        last: { time: allChartCandles[allChartCandles.length - 1]?.time, kst: allCandlesRef.current[allCandlesRef.current.length - 1]?.candle_date_time_kst },
      });

      // 시간순 정렬 보장 (타임존 변환 이슈 방지)
      const sortedCandles = [...allChartCandles].sort((a, b) => (a.time as number) - (b.time as number));

      // 정렬 전후 비교
      const needsSort = JSON.stringify(allChartCandles) !== JSON.stringify(sortedCandles);
      if (needsSort) {
        console.warn('⚠️ [loadMoreCandles] Data was not sorted! Sorting now...');
      }

      candleSeriesRef.current.setData(sortedCandles);

      if (showVolume && volumeSeriesRef.current) {
        const allVolumeData = toVolumeDataArray(allCandlesRef.current, upColor + '80', downColor + '80');
        // 볼륨도 같은 순서로 정렬
        const sortedVolumeData = [...allVolumeData].sort((a, b) => (a.time as number) - (b.time as number));
        volumeSeriesRef.current.setData(sortedVolumeData);
      }
    } catch (err) {
      // epoch가 변경되었으면 에러 무시
      if (currentEpoch !== epochRef.current) {
        return;
      }
      console.error('Failed to load more candles:', err);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [market, timeframe, showVolume, upColor, downColor]);

  // 스크롤 범위 변경 감지 핸들러
  const handleVisibleRangeChange = useCallback(
    (logicalRange: LogicalRange | null) => {
      if (!infiniteScroll || !logicalRange) return;

      // 왼쪽 끝에 가까워지면 더 많은 데이터 로드
      if (logicalRange.from < INFINITE_SCROLL_THRESHOLD) {
        loadMoreCandles();
      }
    },
    [infiniteScroll, loadMoreCandles],
  );

  // 마켓/타임프레임 변경 시 refs 초기화
  useEffect(() => {
    epochRef.current += 1; // stale fetch 방지용 epoch 증가
    allCandlesRef.current = [];
    hasMoreDataRef.current = true;
    isLoadingMoreRef.current = false;
    chartInitializedRef.current = false; // 차트 초기화 대기
  }, [market, timeframe]);

  // 차트 생성 및 데이터 설정
  useEffect(() => {
    if (!chartContainerRef.current || !candles || candles.length === 0) return;

    const container = chartContainerRef.current;

    // 초기 데이터 저장
    allCandlesRef.current = [...candles];

    const chartConfig: DeepPartial<LWChartOptions> = {
      width: container.clientWidth,
      height,
      autoSize: true,
      layout: {
        background: { color: darkMode ? '#1e1e1e' : '#ffffff' },
        textColor: darkMode ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: showGrid ? (darkMode ? '#2B2B43' : '#e1e1e1') : 'transparent' },
        horzLines: { color: showGrid ? (darkMode ? '#2B2B43' : '#e1e1e1') : 'transparent' },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
      },
      rightPriceScale: {
        borderColor: darkMode ? '#2B2B43' : '#e1e1e1',
      },
      timeScale: {
        borderColor: darkMode ? '#2B2B43' : '#e1e1e1',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    const chart = createChart(container, chartConfig);
    chartRef.current = chart;

    // 캔들스틱 시리즈 추가
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
    candleSeriesRef.current = candleSeries;

    // 볼륨 시리즈 추가
    let volumeSeries: ISeriesApi<'Histogram'> | null = null;
    if (showVolume) {
      volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      volumeSeriesRef.current = volumeSeries;

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
    }

    // 데이터 설정
    const chartCandles = toChartCandles(candles);
    candleSeries.setData(chartCandles);

    if (showVolume && volumeSeries) {
      const volumeData = toVolumeDataArray(candles, upColor + '80', downColor + '80');
      volumeSeries.setData(volumeData);
    }

    chart.timeScale().fitContent();

    // 차트 초기화 완료 표시 (무한 스크롤, 실시간 업데이트 허용)
    // 중요: subscribeVisibleLogicalRangeChange 전에 설정해야 함 (콜백이 동기 실행될 수 있음)
    chartInitializedRef.current = true;

    // 무한 스크롤을 위한 visible range 구독
    if (infiniteScroll) {
      chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    }

    return () => {
      chartInitializedRef.current = false; // 실시간 업데이트 차단
      if (infiniteScroll) {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      }
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [candles, height, darkMode, upColor, downColor, showGrid, showVolume, infiniteScroll, handleVisibleRangeChange]);

  // 실시간 업데이트
  useEffect(() => {
    // 차트가 초기화되지 않았으면 스킵 (타임프레임 변경 중 stale 업데이트 방지)
    if (!realtime || !chartInitializedRef.current || !candleSeriesRef.current) return;

    const realtimeCandle = realtimeCandles.get(market);
    if (!realtimeCandle) return;

    // 현재 차트의 캔들 타입과 WebSocket 캔들 타입이 일치하는지 확인
    const expectedCandleType = timeframe.type === 'minutes' ? MINUTE_UNIT_TO_WS_TYPE[timeframe.unit] : undefined;
    if (!expectedCandleType || realtimeCandle.type !== expectedCandleType) {
      return; // 타입 불일치 시 무시
    }

    console.log('🔴 [Realtime] Update received:', {
      market,
      timeframe,
      candleType: realtimeCandle.type,
      timestamp: realtimeCandle.timestamp,
      kst: new Date(realtimeCandle.timestamp).toISOString(),
    });

    const chartCandle = wsToChartCandle(realtimeCandle);
    candleSeriesRef.current.update(chartCandle);

    if (showVolume && volumeSeriesRef.current) {
      const volumeData = wsToVolumeData(realtimeCandle, upColor + '80', downColor + '80');
      volumeSeriesRef.current.update(volumeData);
    }
  }, [realtimeCandles, market, realtime, showVolume, upColor, downColor, timeframe]);

  // 로딩 상태
  if (isLoading) {
    return (
      <Box
        className={className}
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box
        className={className}
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
        }}
      >
        <Typography color="error">차트를 불러올 수 없습니다</Typography>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ position: 'relative' }}>
      <div ref={chartContainerRef} style={{ width: '100%' }} />

      {/* 무한 스크롤 로딩 인디케이터 */}
      {isLoadingMore && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 1,
            px: 1.5,
            py: 0.75,
          }}
        >
          <CircularProgress size={16} sx={{ color: 'white' }} />
          <Typography variant="caption" sx={{ color: 'white' }}>
            로딩 중...
          </Typography>
        </Box>
      )}

      {/* 실시간 연결 표시 */}
      {realtime && wsStatus === 'connected' && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#26a69a',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            실시간
          </Typography>
        </Box>
      )}
    </Box>
  );
}
