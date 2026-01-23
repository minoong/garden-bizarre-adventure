'use client';

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, CrosshairMode, LineStyle } from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi,
  DeepPartial,
  ChartOptions as LWChartOptions,
  LogicalRange,
  Time,
  IPriceLine,
  MouseEventParams,
  CandlestickData,
  HistogramData,
} from 'lightweight-charts';
import { Box, CircularProgress, Typography, Button, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { CandlestickChart as CandlestickChartIcon, ShowChart, Functions, Refresh, RestartAlt, Undo, Redo, KeyboardArrowDown } from '@mui/icons-material';
import { Group, Panel, Separator } from 'react-resizable-panels';

import {
  useCandles,
  useBithumbSocket,
  fetchCandles,
  type CandleTimeframe,
  type MinuteCandle,
  type DayCandle,
  type WeekCandle,
  type MonthCandle,
} from '@/entities/bithumb';
import { calculatePriceChange } from '@/entities/bithumb';

import type { ChartOptions } from '../model/types';
import { DEFAULT_CHART_OPTIONS } from '../model/types';
import { toChartCandles, toVolumeDataArray, calculateSMA } from '../lib';

type CandleData = MinuteCandle | DayCandle | WeekCandle | MonthCandle;

/** 무한 스크롤 로드 임계값 (왼쪽 끝 N개 bar 이내면 로드) */
const INFINITE_SCROLL_THRESHOLD = 10;
/** 한 번에 로드할 추가 캔들 개수 */
const LOAD_MORE_COUNT = 100;

/** 이동평균선 색상 (5, 20, 60일선) */
const MA_COLORS = ['#5EBA7D', '#D60000', '#F5D027'];

/**
 * ticker timestamp를 기준으로 캔들 시작 시간 계산
 */
function getCandleStartTime(timestamp: number, timeframe: CandleTimeframe): Date {
  const date = new Date(timestamp);

  if (timeframe.type === 'minutes') {
    const unit = timeframe.unit;
    const minutes = date.getMinutes();
    const alignedMinutes = Math.floor(minutes / unit) * unit;
    date.setMinutes(alignedMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
  } else if (timeframe.type === 'days') {
    date.setHours(0, 0, 0, 0);
  } else if (timeframe.type === 'weeks') {
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
  } else if (timeframe.type === 'months') {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

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
  /** 타임프레임 변경 콜백 */
  onTimeframeChange?: (timeframe: CandleTimeframe) => void;
  /** 새로고침 콜백 */
  onRefresh?: () => void;
  /** 툴바 표시 여부 */
  showToolbar?: boolean;
}

/**
 * 캔들스틱 차트
 */
export const CandlestickChart = memo(function CandlestickChart({
  market,
  timeframe,
  options,
  realtime = false,
  initialCount = 200,
  infiniteScroll = true,
  className,
  onTimeframeChange,
  onRefresh,
  showToolbar = true,
}: CandlestickChartProps) {
  // 드롭다운 메뉴 상태
  const [dayMenuAnchor, setDayMenuAnchor] = useState<HTMLElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maSeriesRefs = useRef<ISeriesApi<'Line'>[]>([]);

  const minPriceLineRef = useRef<IPriceLine | null>(null);
  const maxPriceLineRef = useRef<IPriceLine | null>(null);

  // 모든 로드된 캔들 데이터 저장 (무한 스크롤용)
  const allCandlesRef = useRef<CandleData[]>([]);
  const isLoadingMoreRef = useRef(false);
  const hasMoreDataRef = useRef(true);
  const epochRef = useRef(0); // 타임프레임/마켓 변경 시 증가
  const chartInitializedRef = useRef(false); // 차트가 현재 데이터로 초기화되었는지
  const [isChartReady, setIsChartReady] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [tooltip, setTooltip] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    cursorPrice?: number;
  } | null>(null);

  // 실시간 업데이트 중임을 표시하여 툴팁이 사라지는 것을 방지
  const isRealtimeUpdatingRef = useRef(false);
  // 현재 호버 중인 시간과 소스 저장
  const hoveredTimeRef = useRef<Time | null>(null);
  const hoveredPriceRef = useRef<number | null>(null);
  const hoveredYRef = useRef<number | null>(null);
  const hoveredSourceRef = useRef<'main' | 'volume' | null>(null);
  const latestProcessedTickerTimeRef = useRef<number | null>(null);
  const marketFittedRef = useRef<string | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 옵션 병합
  const chartOptions = { ...DEFAULT_CHART_OPTIONS, ...options };
  const { height, darkMode, upColor, downColor, showGrid, showVolume, showMovingAverage, movingAveragePeriods, showMinMaxPrice } = chartOptions;

  // 색상 상수
  const BG_COLOR = darkMode ? '#0B1219' : '#ffffff';
  const TEXT_COLOR = darkMode ? '#d1d4dc' : '#191919';
  const GRID_COLOR = darkMode ? '#2B2B43' : '#e1e1e1';
  const BORDER_COLOR = darkMode ? '#2B2B43' : '#e1e1e1';

  // REST API로 초기 데이터 로드
  const { data: candles, isLoading, error } = useCandles(market, timeframe, { count: initialCount });

  // WebSocket ticker로 실시간 업데이트
  const { tickers, status: wsStatus } = useBithumbSocket(realtime ? [market] : [], realtime ? ['ticker'] : [], {
    autoConnect: realtime,
  });

  // 최저/최고가 라인 업데이트 함수
  const updateMinMaxPriceLines = useCallback(() => {
    const chart = mainChartRef.current;
    if (!chart || !candleSeriesRef.current || !showMinMaxPrice || allCandlesRef.current.length === 0) {
      if (minPriceLineRef.current) {
        candleSeriesRef.current?.removePriceLine(minPriceLineRef.current);
        minPriceLineRef.current = null;
      }
      if (maxPriceLineRef.current) {
        candleSeriesRef.current?.removePriceLine(maxPriceLineRef.current);
        maxPriceLineRef.current = null;
      }
      return;
    }

    // 가시적 범위 가져오기
    const visibleRange = chart.timeScale().getVisibleLogicalRange();
    if (!visibleRange) return;

    // 모든 캔들 데이터 (시간 순 정렬됨)
    const allChartCandles = toChartCandles(allCandlesRef.current).sort((a, b) => (a.time as number) - (b.time as number));

    // 가시적 범위에 해당하는 캔들 필터링
    // Lightweight-charts의 logical range는 인덱스 기반
    const visibleCandles = allChartCandles.filter((_, index) => {
      return index >= visibleRange.from && index <= visibleRange.to;
    });

    if (visibleCandles.length === 0) return;

    const maxPrice = Math.max(...visibleCandles.map((c) => c.high));
    const minPrice = Math.min(...visibleCandles.map((c) => c.low));

    // 최고가 라인
    if (maxPriceLineRef.current) {
      maxPriceLineRef.current.applyOptions({ price: maxPrice });
    } else {
      maxPriceLineRef.current = candleSeriesRef.current.createPriceLine({
        price: maxPrice,
        color: upColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '최고',
      });
    }

    // 최저가 라인
    if (minPriceLineRef.current) {
      minPriceLineRef.current.applyOptions({ price: minPrice });
    } else {
      minPriceLineRef.current = candleSeriesRef.current.createPriceLine({
        price: minPrice,
        color: downColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '최저',
      });
    }
  }, [showMinMaxPrice, upColor, downColor]);

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

    // to parameter는 exclusive이므로 oldest 시간을 그대로 전달
    // API는 to 미만의 데이터를 반환하므로 중복 없이 이전 캔들들을 가져옴
    const toParam = oldestCandleTime;

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

      const newCandles = [...moreCandles];

      if (newCandles.length === 0) {
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

      // allCandlesRef 기반으로 전체 데이터 재설정
      const allChartCandles = toChartCandles(allCandlesRef.current);

      // 시간순 정렬 보장 (타임존 변환 이슈 방지)
      const sortedCandles = [...allChartCandles].sort((a, b) => (a.time as number) - (b.time as number));

      candleSeriesRef.current.setData(sortedCandles);

      if (showVolume && volumeSeriesRef.current) {
        const allVolumeData = toVolumeDataArray(allCandlesRef.current, upColor + '80', downColor + '80');
        // 볼륨도 같은 순서로 정렬
        const sortedVolumeData = [...allVolumeData].sort((a, b) => (a.time as number) - (b.time as number));
        volumeSeriesRef.current.setData(sortedVolumeData);
      }

      // SMA 데이터 업데이트 (과거 데이터 로드 시)
      if (showMovingAverage && maSeriesRefs.current.length > 0 && movingAveragePeriods) {
        maSeriesRefs.current.forEach((series, index) => {
          const period = movingAveragePeriods[index];
          const smaData = calculateSMA(sortedCandles, period);
          series.setData(smaData);
        });
      }

      // 최저/최고가 라인 업데이트
      updateMinMaxPriceLines();
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
  }, [market, timeframe, showVolume, upColor, downColor, showMovingAverage, movingAveragePeriods, updateMinMaxPriceLines]);

  // 스크롤 범위 변경 감지 (Main Chart)
  const handleVisibleRangeChange = useCallback(
    (logicalRange: LogicalRange | null) => {
      if (!infiniteScroll || !logicalRange) return;

      // 왼쪽 끝에 가까워지면 더 많은 데이터 로드
      if (logicalRange.from < INFINITE_SCROLL_THRESHOLD) {
        loadMoreCandles();
      }

      // 가시적 범위 변경 시 가격선 업데이트
      updateMinMaxPriceLines();
    },
    [infiniteScroll, loadMoreCandles, updateMinMaxPriceLines],
  );

  // Helper to find data by time from allCandlesRef
  const getCandleDataByTime = useCallback((time: Time) => {
    const timestamp = time as number;
    for (let i = allCandlesRef.current.length - 1; i >= 0; i--) {
      const c = allCandlesRef.current[i];
      if (Math.floor(new Date(c.candle_date_time_kst + '+09:00').getTime() / 1000) === timestamp) {
        return {
          open: c.opening_price,
          high: c.high_price,
          low: c.low_price,
          close: c.trade_price,
        };
      }
    }
    return undefined;
  }, []);

  const getVolumeDataByTime = useCallback((time: Time) => {
    const timestamp = time as number;
    for (let i = allCandlesRef.current.length - 1; i >= 0; i--) {
      const c = allCandlesRef.current[i];
      if (Math.floor(new Date(c.candle_date_time_kst + '+09:00').getTime() / 1000) === timestamp) {
        return { value: c.candle_acc_trade_volume };
      }
    }
    return undefined;
  }, []);

  // Tooltip Helper
  const updateTooltip = useCallback(
    (param: MouseEventParams, source: 'main' | 'volume', cursorPrice?: number) => {
      if (param.time && !param.point) return;

      if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        // 실시간 업데이트 중에는 툴팁을 지우지 않음 (데이터 갱신 시 잠깐 time이 사라지는 현상 방지)
        if (!isRealtimeUpdatingRef.current) {
          setTooltip(null);
          hoveredTimeRef.current = null;
          hoveredSourceRef.current = null;
        }
        return;
      }

      hoveredTimeRef.current = param.time;
      hoveredSourceRef.current = source;

      const candleSeries = candleSeriesRef.current;
      const volSeries = volumeSeriesRef.current;
      if (!candleSeries) return;

      const candleData = (param.seriesData.get(candleSeries) || getCandleDataByTime(param.time)) as CandlestickData | undefined;
      const volumeData = (volSeries ? param.seriesData.get(volSeries) || getVolumeDataByTime(param.time) : undefined) as HistogramData | undefined;

      if (candleData) {
        const time = new Date((param.time as number) * 1000);
        const timeStr = time.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        setTooltip({
          time: timeStr,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData?.value,
          cursorPrice: cursorPrice,
        });
      }
    },
    [getCandleDataByTime, getVolumeDataByTime],
  );

  // 마켓/타임프레임 변경 시 Refs 초기화
  useEffect(() => {
    epochRef.current += 1; // stale fetch 방지용 epoch 증가
    allCandlesRef.current = [];
    hasMoreDataRef.current = true;
    isLoadingMoreRef.current = false;
    chartInitializedRef.current = false; // 차트 초기화 대기
    minPriceLineRef.current = null;
    maxPriceLineRef.current = null;
  }, [market, timeframe]);

  // 차트 생성 및 동기화
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Reset state
    setIsChartReady(false);
    chartInitializedRef.current = false;

    // Initial size check
    const container = chartContainerRef.current;
    if (container.clientWidth === 0) {
      // If container is not yet sized, we might need a small delay or ResizeObserver.
    }

    // Main Chart Options (Candles)
    const mainChartOptions: DeepPartial<LWChartOptions> = {
      width: container.clientWidth || 600,
      height: showVolume ? height * 0.75 : height,
      autoSize: true,
      layout: { background: { color: BG_COLOR }, textColor: TEXT_COLOR },
      grid: {
        vertLines: { color: showGrid ? GRID_COLOR : 'transparent' },
        horzLines: { color: showGrid ? GRID_COLOR : 'transparent' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        minimumWidth: 100,
      },
      timeScale: {
        borderColor: BORDER_COLOR,
        timeVisible: true,
        secondsVisible: false,
        visible: !showVolume,
      },
    };

    const mainChart = createChart(container, mainChartOptions);
    mainChartRef.current = mainChart;

    const candleSeries = mainChart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
    candleSeriesRef.current = candleSeries;

    // Moving Averages on Main Chart
    maSeriesRefs.current = [];
    if (showMovingAverage && movingAveragePeriods) {
      movingAveragePeriods.forEach((period, index) => {
        const color = MA_COLORS[index % MA_COLORS.length];
        const maSeries = mainChart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        maSeriesRefs.current.push(maSeries as ISeriesApi<'Line'>);
      });
    }

    // Volume Chart setup
    let volumeChart: IChartApi | null = null;
    if (showVolume && volumeContainerRef.current) {
      const volContainer = volumeContainerRef.current;
      const volumeChartOptions: DeepPartial<LWChartOptions> = {
        width: volContainer.clientWidth || 600,
        height: height * 0.25,
        autoSize: true,
        layout: { background: { color: BG_COLOR }, textColor: TEXT_COLOR },
        grid: {
          vertLines: { color: showGrid ? GRID_COLOR : 'transparent' },
          horzLines: { color: showGrid ? GRID_COLOR : 'transparent' },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: {
          borderColor: BORDER_COLOR,
          scaleMargins: { top: 0.1, bottom: 0 },
          minimumWidth: 100,
        },
        timeScale: {
          borderColor: BORDER_COLOR,
          timeVisible: true,
          secondsVisible: false,
          visible: true,
        },
      };

      volumeChart = createChart(volContainer, volumeChartOptions);
      volumeChartRef.current = volumeChart;

      const volumeSeries = volumeChart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        color: upColor,
      });
      volumeSeriesRef.current = volumeSeries;

      // Sync logic
      const mainTimeScale = mainChart.timeScale();
      const volumeTimeScale = volumeChart.timeScale();

      mainTimeScale.subscribeVisibleLogicalRangeChange((range) => {
        if (range) volumeTimeScale.setVisibleLogicalRange(range);
        handleVisibleRangeChange(range);
      });

      volumeTimeScale.subscribeVisibleLogicalRangeChange((range) => {
        if (range) mainTimeScale.setVisibleLogicalRange(range);
      });

      // Unified Crosshair Move
      const onCrosshairMove = (param: MouseEventParams, src: 'main' | 'volume') => {
        // 실시간 업데이트 중에는 크로스헤어 동기화 건너뛰기
        // update() 호출 시 이벤트가 다시 발생하면서 setCrosshairPosition이 호출되어
        // 마우스 위치가 아닌 데이터 위치로 크로스헤어가 튀는 현상 방지
        if (isRealtimeUpdatingRef.current) {
          return;
        }

        let cursorPrice: number | undefined;

        // 1. 호버 상태 추적
        if (param.time) {
          hoveredTimeRef.current = param.time;
          hoveredSourceRef.current = src;

          // Main Chart에서만 커서 가격 계산
          if (param.point) {
            if (src === 'main') {
              const price = candleSeries.coordinateToPrice(param.point.y);
              if (price !== null) {
                hoveredPriceRef.current = price;
                hoveredYRef.current = param.point.y;
                cursorPrice = price;
              }
            } else {
              // Volume Chart에서는 가격 표시 안함 (Close로 폴백)
              hoveredPriceRef.current = null;
              hoveredYRef.current = null;
            }
          }

          // 2. 다른 차트에 크로스헤어 동기화 (시간축 연결)
          // 마우스가 있는 차트는 라이브러리가 자동 처리, 다른 차트만 동기화
          const targetChart = src === 'main' ? volumeChart : mainChart;
          const targetSeries = src === 'main' ? volumeSeries : candleSeries;

          if (targetChart && targetSeries) {
            // 다른 차트의 Y값은 해당 시간의 데이터 값으로 설정
            let syncPrice = 0;
            if (src === 'main') {
              // 메인→볼륨: 해당 시간의 볼륨 값
              const volData = getVolumeDataByTime(param.time);
              if (volData) syncPrice = volData.value as number;
            } else {
              // 볼륨→메인: 해당 시간의 종가
              const candleData = getCandleDataByTime(param.time);
              if (candleData) syncPrice = candleData.close;
            }
            targetChart.setCrosshairPosition(syncPrice, param.time, targetSeries);
          }

          // 3. 글로벌 이벤트 전송 (다른 마켓 차트용)
          window.dispatchEvent(
            new CustomEvent('chart-sync', {
              detail: { time: param.time, sourceMarket: market },
            }),
          );
        } else {
          // 마우스가 차트 밖으로 나갔을 때만 클리어
          hoveredTimeRef.current = null;
          hoveredPriceRef.current = null;
          hoveredSourceRef.current = null;
          hoveredYRef.current = null;
          mainChart.clearCrosshairPosition();
          volumeChart?.clearCrosshairPosition();
        }

        // 4. 툴팁 업데이트
        updateTooltip(param, src, cursorPrice);
      };

      mainChart.subscribeCrosshairMove((p) => onCrosshairMove(p, 'main'));
      volumeChart.subscribeCrosshairMove((p) => onCrosshairMove(p, 'volume'));
    } else {
      mainChart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      mainChart.subscribeCrosshairMove((param) => {
        let cursorPrice: number | undefined;
        if (param.time) {
          hoveredTimeRef.current = param.time;
          hoveredSourceRef.current = 'main';
          if (param.point) {
            const price = candleSeries.coordinateToPrice(param.point.y);
            if (price !== null) {
              hoveredPriceRef.current = price;
              hoveredYRef.current = param.point.y;
              cursorPrice = price;
            }
          }

          window.dispatchEvent(
            new CustomEvent('chart-sync', {
              detail: { time: param.time, sourceMarket: market },
            }),
          );
        } else {
          if (!isRealtimeUpdatingRef.current) {
            hoveredTimeRef.current = null;
            hoveredPriceRef.current = null;
            hoveredSourceRef.current = null;
            hoveredYRef.current = null;
            mainChart.clearCrosshairPosition();
          }
        }
        updateTooltip(param, 'main', cursorPrice);
      });
    }

    // Resize Observer setup
    resizeObserverRef.current = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height: containerHeight } = entries[0].contentRect;
      mainChart.resize(width, showVolume ? containerHeight * 0.75 : containerHeight);
      if (volumeChart) {
        volumeChart.resize(width, containerHeight * 0.25);
      }
    });
    resizeObserverRef.current.observe(container);

    const handleGlobalSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ time: Time; sourceMarket: string }>;
      const { time: _time, sourceMarket } = customEvent.detail;
      if (sourceMarket === market) return;
      // 다른 마켓 차트와 크로스헤어 Y축 동기화하지 않음
      // setCrosshairPosition(0, time, series)를 호출하면 Y=0 위치로 강제 이동됨
    };

    window.addEventListener('chart-sync', handleGlobalSync);

    // Initial Data Load (if candles have already arrived)
    // 이 시점에 데이터가 있으면 즉시 채워넣어 초기 렌더링 지연 방지
    if (candles && candles.length > 0) {
      allCandlesRef.current = [...candles];
      const chartCandles = toChartCandles(candles);
      candleSeries.setData(chartCandles);

      if (showVolume && volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(toVolumeDataArray(candles, upColor + '80', downColor + '80'));
      }

      if (showMovingAverage && maSeriesRefs.current.length > 0) {
        maSeriesRefs.current.forEach((series, index) => {
          const period = movingAveragePeriods![index];
          series.setData(calculateSMA(chartCandles, period));
        });
      }

      mainChart.timeScale().fitContent();
      marketFittedRef.current = market;
      updateMinMaxPriceLines();
    }

    // 마우스 enter/leave 이벤트로 가로선 표시 제어
    // 마우스가 있는 차트만 가로선 표시, 다른 차트는 숨김
    const handleMainEnter = () => {
      mainChart.applyOptions({ crosshair: { horzLine: { visible: true } } });
      volumeChart?.applyOptions({ crosshair: { horzLine: { visible: false } } });
    };
    const handleVolumeEnter = () => {
      mainChart.applyOptions({ crosshair: { horzLine: { visible: false } } });
      volumeChart?.applyOptions({ crosshair: { horzLine: { visible: true } } });
    };
    const handleMouseLeave = () => {
      // 차트 영역을 완전히 벗어나면 둘 다 가로선 복원
      mainChart.applyOptions({ crosshair: { horzLine: { visible: true } } });
      volumeChart?.applyOptions({ crosshair: { horzLine: { visible: true } } });
    };

    container.addEventListener('mouseenter', handleMainEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    const volContainer = volumeContainerRef.current;
    if (volContainer) {
      volContainer.addEventListener('mouseenter', handleVolumeEnter);
      volContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    chartInitializedRef.current = true;
    setIsChartReady(true);

    return () => {
      setIsChartReady(false);
      chartInitializedRef.current = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('chart-sync', handleGlobalSync);
      container.removeEventListener('mouseenter', handleMainEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (volContainer) {
        volContainer.removeEventListener('mouseenter', handleVolumeEnter);
        volContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
      mainChart.remove();
      if (volumeChart) volumeChart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    market,
    timeframe,
    height,
    darkMode,
    upColor,
    downColor,
    showGrid,
    showVolume,
    showMovingAverage,
    movingAveragePeriods,
    BG_COLOR,
    TEXT_COLOR,
    GRID_COLOR,
    BORDER_COLOR,
    updateMinMaxPriceLines,
    updateTooltip,
  ]);

  // 데이터 업데이트 전용 useEffect
  useEffect(() => {
    if (!isChartReady || !candleSeriesRef.current || !candles || candles.length === 0) return;

    allCandlesRef.current = [...candles];
    const chartCandles = toChartCandles(candles);
    candleSeriesRef.current.setData(chartCandles);

    if (showVolume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(toVolumeDataArray(candles, upColor + '80', downColor + '80'));
    }

    if (showMovingAverage && maSeriesRefs.current.length > 0 && movingAveragePeriods) {
      maSeriesRefs.current.forEach((series, index) => {
        const period = movingAveragePeriods[index];
        series.setData(calculateSMA(chartCandles, period));
      });
    }

    // 마켓이 변경되었거나 처음 렌더링될 때만 fitContent 호출
    if (marketFittedRef.current !== market) {
      mainChartRef.current?.timeScale().fitContent();
      marketFittedRef.current = market;
    }

    updateMinMaxPriceLines();
  }, [isChartReady, market, candles, showVolume, showMovingAverage, movingAveragePeriods, upColor, downColor, updateMinMaxPriceLines]);

  // 실시간 업데이트 (Main & Volume 분리)
  useEffect(() => {
    if (!realtime || !chartInitializedRef.current || !candleSeriesRef.current || !mainChartRef.current) return;

    // Volume Series ref check
    if (showVolume && !volumeSeriesRef.current) return;

    try {
      const ticker = tickers.get(market);
      if (!ticker || !allCandlesRef.current.length) return;

      // 같은 타임스탬프면 중복 처리 방지 (이미 처리된 틱인 경우)
      if (ticker.timestamp <= (latestProcessedTickerTimeRef.current || 0)) return;
      latestProcessedTickerTimeRef.current = ticker.timestamp;

      const candleStartTime = getCandleStartTime(ticker.timestamp, timeframe);
      const candleTimestamp = Math.floor(candleStartTime.getTime() / 1000);
      const latestCandle = allCandlesRef.current[0];
      const latestCandleTime = Math.floor(new Date(latestCandle.candle_date_time_kst + '+09:00').getTime() / 1000);
      const currentTradePrice = ticker.trade_price;

      let currentVolume = latestCandle.candle_acc_trade_volume;
      if (timeframe.type === 'days') currentVolume = ticker.acc_trade_volume;

      isRealtimeUpdatingRef.current = true;
      if (candleTimestamp > latestCandleTime) {
        // New Candle logic
        const newCandle = {
          time: candleTimestamp as Time,
          open: currentTradePrice,
          high: currentTradePrice,
          low: currentTradePrice,
          close: currentTradePrice,
        };
        candleSeriesRef.current.update(newCandle);

        const newVolume = ticker.trade_volume;
        if (showVolume && volumeSeriesRef.current) {
          volumeSeriesRef.current.update({
            time: candleTimestamp as Time,
            value: newVolume,
            color: upColor + '80',
          });
        }

        // Update Ref (Prepend new candle)
        const candleStartKst = new Date(candleTimestamp * 1000 + 9 * 60 * 60 * 1000);
        const newCandleData = {
          market,
          candle_date_time_utc: new Date(candleTimestamp * 1000).toISOString(),
          candle_date_time_kst: candleStartKst.toISOString().slice(0, 19).replace('T', ' '), // Fix format
          opening_price: currentTradePrice,
          high_price: currentTradePrice,
          low_price: currentTradePrice,
          trade_price: currentTradePrice,
          timestamp: ticker.timestamp,
          candle_acc_trade_price: ticker.trade_price * newVolume,
          candle_acc_trade_volume: newVolume,
          ...(timeframe.type === 'minutes' && { unit: timeframe.unit }),
        } as CandleData;

        allCandlesRef.current = [newCandleData, ...allCandlesRef.current];

        // 툴팁이 새 캔들 시간에 맞춰져 있으면 업데이트
        if (hoveredTimeRef.current === candleTimestamp) {
          setTooltip((prev) =>
            prev
              ? {
                  ...prev,
                  open: currentTradePrice,
                  high: currentTradePrice,
                  low: currentTradePrice,
                  close: currentTradePrice,
                  volume: newVolume,
                }
              : null,
          );
        }
      } else {
        // Update Existing
        if (timeframe.type !== 'days') currentVolume += ticker.trade_volume;

        const updatedCandle = {
          time: latestCandleTime as Time,
          open: latestCandle.opening_price,
          high: Math.max(latestCandle.high_price, currentTradePrice),
          low: Math.min(latestCandle.low_price, currentTradePrice),
          close: currentTradePrice,
        };
        candleSeriesRef.current.update(updatedCandle);

        if (showVolume && volumeSeriesRef.current) {
          const isUp = currentTradePrice >= latestCandle.opening_price;
          volumeSeriesRef.current.update({
            time: latestCandleTime as Time,
            value: currentVolume,
            color: isUp ? upColor + '80' : downColor + '80',
          });
        }

        // Update Ref
        allCandlesRef.current[0] = {
          ...latestCandle,
          high_price: updatedCandle.high,
          low_price: updatedCandle.low,
          trade_price: updatedCandle.close,
          timestamp: ticker.timestamp,
          candle_acc_trade_volume: currentVolume,
        };

        // 툴팁이 현재 업데이트 중인 캔들 시간에 맞춰져 있으면 업데이트
        if (hoveredTimeRef.current === latestCandleTime) {
          setTooltip((prev) =>
            prev
              ? {
                  ...prev,
                  open: updatedCandle.open,
                  high: updatedCandle.high,
                  low: updatedCandle.low,
                  close: updatedCandle.close,
                  volume: currentVolume,
                }
              : null,
          );
        }
      }

      // SMA Update (최적화: 전체 데이터를 다시 계산하지 않고 마지막 값만 계산)
      if (showMovingAverage && maSeriesRefs.current.length > 0 && movingAveragePeriods) {
        maSeriesRefs.current.forEach((series, index) => {
          const period = movingAveragePeriods[index];
          // 필요한 만큼만 데이터 추출 (계산에 필요한 최소 개수)
          if (allCandlesRef.current.length >= period) {
            const latestItems = allCandlesRef.current.slice(0, period);
            const chartItems = toChartCandles(latestItems);
            const smaData = calculateSMA(chartItems, period);
            if (smaData.length > 0) {
              series.update(smaData[0]);
            }
          }
        });
      }

      updateMinMaxPriceLines();

      // 크로스헤어는 강제로 복구하지 않음
      // 마우스가 차트 위에 있으면 lightweight-charts가 자동으로 크로스헤어를 유지함
      // setCrosshairPosition을 호출하면 오히려 마우스 위치와 다른 곳으로 튀어버림
    } catch (e) {
      console.error('Realtime update error:', e);
    } finally {
      setTimeout(() => {
        isRealtimeUpdatingRef.current = false;
      }, 0);
    }
  }, [
    tickers,
    market,
    realtime,
    timeframe,
    showVolume,
    showMovingAverage,
    movingAveragePeriods,
    upColor,
    downColor,
    updateMinMaxPriceLines,
    getCandleDataByTime,
    getVolumeDataByTime,
  ]);

  return (
    <Box className={className} sx={{ position: 'relative', bgcolor: BG_COLOR, display: 'flex', flexDirection: 'column', height }}>
      {/* Chart Toolbar */}
      {showToolbar && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderBottom: `1px solid ${BORDER_COLOR}`,
            bgcolor: darkMode ? '#0d1520' : '#f5f5f5',
            flexShrink: 0,
          }}
        >
          {/* 시간 프레임 버튼 그룹 */}
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {[
              { label: '1분', tf: { type: 'minutes' as const, unit: 1 as const } },
              { label: '3분', tf: { type: 'minutes' as const, unit: 3 as const } },
              { label: '5분', tf: { type: 'minutes' as const, unit: 5 as const } },
              { label: '10분', tf: { type: 'minutes' as const, unit: 10 as const } },
              { label: '15분', tf: { type: 'minutes' as const, unit: 15 as const } },
              { label: '30분', tf: { type: 'minutes' as const, unit: 30 as const } },
              { label: '1시간', tf: { type: 'minutes' as const, unit: 60 as const } },
              { label: '4시간', tf: { type: 'minutes' as const, unit: 240 as const } },
            ].map(({ label, tf }) => (
              <Button
                key={label}
                size="small"
                variant={timeframe.type === tf.type && timeframe.unit === tf.unit ? 'contained' : 'text'}
                onClick={() => onTimeframeChange?.(tf)}
                sx={{
                  minWidth: 'auto',
                  px: 0.75,
                  py: 0.25,
                  fontSize: '0.7rem',
                  color: timeframe.type === tf.type && timeframe.unit === tf.unit ? '#fff' : TEXT_COLOR,
                  bgcolor: timeframe.type === tf.type && timeframe.unit === tf.unit ? '#1976d2' : 'transparent',
                  '&:hover': {
                    bgcolor:
                      timeframe.type === tf.type && timeframe.unit === tf.unit
                        ? darkMode
                          ? '#1565c0'
                          : '#115293'
                        : darkMode
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.08)',
                  },
                }}
              >
                {label}
              </Button>
            ))}

            {/* 일/주/월 드롭다운 */}
            <Button
              size="small"
              variant={timeframe.type === 'days' || timeframe.type === 'weeks' || timeframe.type === 'months' ? 'contained' : 'text'}
              onClick={(e) => setDayMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDown sx={{ fontSize: '1rem !important' }} />}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.25,
                fontSize: '0.75rem',
                color: timeframe.type !== 'minutes' ? '#fff' : TEXT_COLOR,
                bgcolor: timeframe.type !== 'minutes' ? '#1976d2' : 'transparent',
                '&:hover': {
                  bgcolor: timeframe.type !== 'minutes' ? (darkMode ? '#1565c0' : '#115293') : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              }}
            >
              {timeframe.type === 'days' ? '일' : timeframe.type === 'weeks' ? '주' : timeframe.type === 'months' ? '월' : '일'}
            </Button>
            <Menu
              anchorEl={dayMenuAnchor}
              open={Boolean(dayMenuAnchor)}
              onClose={() => setDayMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <MenuItem
                onClick={() => {
                  onTimeframeChange?.({ type: 'days' });
                  setDayMenuAnchor(null);
                }}
              >
                일
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onTimeframeChange?.({ type: 'weeks' });
                  setDayMenuAnchor(null);
                }}
              >
                주
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onTimeframeChange?.({ type: 'months' });
                  setDayMenuAnchor(null);
                }}
              >
                월
              </MenuItem>
            </Menu>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: BORDER_COLOR }} />

          {/* 차트 타입 아이콘 */}
          <IconButton size="small" sx={{ color: TEXT_COLOR }}>
            <CandlestickChartIcon sx={{ fontSize: '1.1rem' }} />
          </IconButton>
          <IconButton size="small" sx={{ color: TEXT_COLOR, opacity: 0.5 }}>
            <ShowChart sx={{ fontSize: '1.1rem' }} />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: BORDER_COLOR }} />

          {/* 지표 */}
          <IconButton size="small" sx={{ color: TEXT_COLOR }}>
            <Functions sx={{ fontSize: '1.1rem' }} />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: BORDER_COLOR }} />

          {/* 토글 옵션들 */}
          <Button size="small" variant="text" sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.7rem', color: TEXT_COLOR }}>
            예측차트
          </Button>
          <Button size="small" variant="text" sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.7rem', color: TEXT_COLOR }}>
            미체결
          </Button>
          <Button size="small" variant="text" sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.7rem', color: TEXT_COLOR }}>
            평균매수가
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: BORDER_COLOR }} />

          {/* 새로고침 / 초기화 */}
          <Button
            size="small"
            variant="text"
            startIcon={<Refresh sx={{ fontSize: '0.9rem !important' }} />}
            onClick={onRefresh}
            sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.7rem', color: TEXT_COLOR }}
          >
            새로고침
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<RestartAlt sx={{ fontSize: '0.9rem !important' }} />}
            onClick={() => mainChartRef.current?.timeScale().fitContent()}
            sx={{ minWidth: 'auto', px: 1, py: 0.25, fontSize: '0.7rem', color: TEXT_COLOR }}
          >
            초기화
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: BORDER_COLOR }} />

          {/* Undo / Redo */}
          <IconButton size="small" sx={{ color: TEXT_COLOR, opacity: 0.5 }}>
            <Undo sx={{ fontSize: '1rem' }} />
          </IconButton>
          <IconButton size="small" sx={{ color: TEXT_COLOR, opacity: 0.5 }}>
            <Redo sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      )}

      {/* Loading Overlay */}
      {(isLoading || error) && (
        <Box
          sx={{
            position: 'absolute',
            top: showToolbar ? 40 : 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: darkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {isLoading ? <CircularProgress size={40} /> : <Typography color="error">차트를 불러올 수 없습니다</Typography>}
        </Box>
      )}

      {/* HEADER INFO (OHLC) - Positioned Absolute over Main Chart */}
      <Box sx={{ position: 'absolute', top: showToolbar ? 48 : 8, left: 12, zIndex: 10, pointerEvents: 'none' }}>
        {/* ... (Keep existing text rendering logic using 'tooltip' state) ... */}
        {/* Re-use existing JSX for OHLC display */}
        {(() => {
          const displayData =
            tooltip ||
            (allCandlesRef.current.length > 0
              ? {
                  open: allCandlesRef.current[0].opening_price,
                  high: allCandlesRef.current[0].high_price,
                  low: allCandlesRef.current[0].low_price,
                  close: allCandlesRef.current[0].trade_price,
                  volume: allCandlesRef.current[0].candle_acc_trade_volume,
                }
              : null);

          if (!displayData) return null;
          // 커서 가격이 있으면 그것을 사용, 없으면 종가 사용 (초기 로드 등)
          const mainPrice = 'cursorPrice' in displayData ? (displayData.cursorPrice ?? displayData.close) : displayData.close;
          const priceChange = calculatePriceChange(displayData.open, mainPrice, upColor, downColor);

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              {/* Price Info */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'baseline' }}>
                  <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem', fontWeight: 700 }}>PRICE</Typography>
                  <Typography sx={{ color: priceChange.changeColor, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1 }}>
                    {mainPrice.toLocaleString()}
                  </Typography>
                  <Typography sx={{ color: priceChange.changeColor, fontSize: '0.6875rem', fontWeight: 600 }}>{priceChange.formattedChange}</Typography>
                </Box>
                {/* OHLC detail */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem' }}>
                    시가:{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: TEXT_COLOR }}>
                      {displayData.open.toLocaleString()}
                    </Box>
                  </Typography>
                  <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem' }}>
                    종가:{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: TEXT_COLOR }}>
                      {displayData.close.toLocaleString()}
                    </Box>
                  </Typography>
                </Box>
              </Box>
              {/* Vol / High / Low */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                {displayData.volume !== undefined && (
                  <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem' }}>
                    VOL:{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: TEXT_COLOR }}>
                      {displayData.volume.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                    </Box>
                  </Typography>
                )}
                <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem' }}>
                  고가:{' '}
                  <Box component="span" sx={{ fontWeight: 600, color: upColor }}>
                    {displayData.high.toLocaleString()}
                  </Box>
                </Typography>
                <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem' }}>
                  저가:{' '}
                  <Box component="span" sx={{ fontWeight: 600, color: downColor }}>
                    {displayData.low.toLocaleString()}
                  </Box>
                </Typography>
              </Box>
            </Box>
          );
        })()}
      </Box>

      {/* Main Chart Container */}
      {showVolume ? (
        <Group orientation="vertical">
          <Panel defaultSize={75} minSize={30}>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
          </Panel>
          <Separator
            style={{
              height: '4px',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              cursor: 'row-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: '40px',
                height: '2px',
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                borderRadius: '1px',
              }}
            />
          </Separator>
          <Panel defaultSize={25} minSize={10}>
            <div ref={volumeContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
              {/* Volume Label Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 12,
                  zIndex: 5,
                  pointerEvents: 'none',
                  bgcolor: darkMode ? 'rgba(43, 43, 67, 0.4)' : 'rgba(240, 240, 240, 0.7)',
                  border: '1px solid ' + (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                  px: 0.6,
                  py: 0.2,
                  borderRadius: '2px',
                }}
              >
                <Typography variant="caption" sx={{ color: TEXT_COLOR, fontWeight: 700, fontSize: '0.625rem', letterSpacing: '0.05em' }}>
                  VOLUME
                </Typography>
              </Box>
            </div>
          </Panel>
        </Group>
      ) : (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
      )}

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

      {/* 실시간 연결 표시 (ticker WebSocket) */}
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
});
