'use client';

import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
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
import { Box, CircularProgress, Typography, Button, IconButton, Menu, MenuItem, Divider, useTheme } from '@mui/material';
import { CandlestickChart as CandlestickChartIcon, ShowChart, Functions, Refresh, RestartAlt, Undo, Redo, KeyboardArrowDown } from '@mui/icons-material';

import {
  useCandles,
  useBithumbSocket,
  useRealtimeTicker,
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

function parseKstTimestamp(kstDateString: string): number {
  return Math.floor(new Date(kstDateString + '+09:00').getTime() / 1000);
}

function buildChartState(candles: CandleData[], upColor: string, downColor: string) {
  const chartCandles = toChartCandles(candles).sort((a, b) => (a.time as number) - (b.time as number));
  const volumeData = toVolumeDataArray(candles, upColor + '80', downColor + '80').sort((a, b) => (a.time as number) - (b.time as number));
  const candleSnapshotByTime = new Map<
    number,
    {
      candle: CandlestickData<Time>;
      volume: HistogramData<Time>;
    }
  >();

  for (let index = 0; index < chartCandles.length; index += 1) {
    const candle = chartCandles[index];
    const volume = volumeData[index];
    if (!volume) continue;
    candleSnapshotByTime.set(candle.time as number, { candle, volume });
  }

  return { chartCandles, volumeData, candleSnapshotByTime };
}

function getLatestSMAUpdate(candlesLatestFirst: CandleData[], period: number): { time: Time; value: number } | null {
  if (candlesLatestFirst.length < period) {
    return null;
  }

  const latestPeriodCandles = candlesLatestFirst.slice(0, period);
  const sum = latestPeriodCandles.reduce((acc, candle) => acc + candle.trade_price, 0);

  return {
    time: parseKstTimestamp(latestPeriodCandles[0].candle_date_time_kst) as Time,
    value: sum / period,
  };
}

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

  const mainChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maSeriesRefs = useRef<ISeriesApi<'Line'>[]>([]);

  const minPriceLineRef = useRef<IPriceLine | null>(null);
  const maxPriceLineRef = useRef<IPriceLine | null>(null);

  // 모든 로드된 캔들 데이터 저장 (무한 스크롤용)
  const allCandlesRef = useRef<CandleData[]>([]);
  const chartCandlesRef = useRef<ReturnType<typeof toChartCandles>>([]);
  const volumeDataRef = useRef<HistogramData<Time>[]>([]);
  const candleSnapshotByTimeRef = useRef<Map<number, { candle: CandlestickData<Time>; volume: HistogramData<Time> }>>(new Map());
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
  const latestProcessedTickerTimeRef = useRef<number | null>(null);
  const marketFittedRef = useRef<string | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const chartGenerationRef = useRef(0);

  // 옵션 병합
  const theme = useTheme();
  const themeMode = theme.palette.mode;
  const trading = theme.palette.trading;

  const chartOptions = useMemo(
    () => ({
      ...DEFAULT_CHART_OPTIONS,
      upColor: trading.rise.main,
      downColor: trading.fall.main,
      ...options,
      darkMode: themeMode === 'dark',
    }),
    [options, themeMode, trading.fall.main, trading.rise.main],
  );

  const { height, darkMode, upColor, downColor, showGrid, showVolume, showMovingAverage, movingAveragePeriods, showMinMaxPrice } = chartOptions;
  const movingAveragePeriodsKey = useMemo(() => movingAveragePeriods?.join(',') ?? '', [movingAveragePeriods]);

  // 색상 상수 (테마 기반으로 통일)
  const BG_COLOR = theme.palette.background.paper;
  const TEXT_COLOR = theme.palette.text.primary;
  const GRID_COLOR = theme.palette.divider;
  const BORDER_COLOR = theme.palette.divider;
  const PANE_SEPARATOR_COLOR = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const PANE_SEPARATOR_HOVER_COLOR = darkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.16)';

  // REST API로 초기 데이터 로드
  const { data: candles, isLoading, error } = useCandles(market, timeframe, { count: initialCount });

  // WebSocket ticker로 실시간 업데이트
  const realtimeTicker = useRealtimeTicker(market);
  const { status: wsStatus } = useBithumbSocket(realtime ? [market] : [], realtime ? ['ticker'] : [], {
    autoConnect: realtime,
  });

  // 최저/최고가 라인 업데이트 함수
  const updateMinMaxPriceLines = useCallback(() => {
    const chart = mainChartRef.current;
    if (!chartInitializedRef.current || !chart || !candleSeriesRef.current || !showMinMaxPrice || chartCandlesRef.current.length === 0) {
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

    const fromIndex = Math.max(0, Math.floor(visibleRange.from));
    const toIndex = Math.min(chartCandlesRef.current.length - 1, Math.ceil(visibleRange.to));
    const visibleCandles = chartCandlesRef.current.slice(fromIndex, toIndex + 1);

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
      const nextChartState = buildChartState(allCandlesRef.current, upColor, downColor);
      chartCandlesRef.current = nextChartState.chartCandles;
      volumeDataRef.current = nextChartState.volumeData;
      candleSnapshotByTimeRef.current = nextChartState.candleSnapshotByTime;

      candleSeriesRef.current.setData(nextChartState.chartCandles);

      if (showVolume && volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(nextChartState.volumeData);
      }

      // SMA 데이터 업데이트 (과거 데이터 로드 시)
      if (showMovingAverage && maSeriesRefs.current.length > 0 && movingAveragePeriods) {
        maSeriesRefs.current.forEach((series, index) => {
          const period = movingAveragePeriods[index];
          const smaData = calculateSMA(nextChartState.chartCandles, period);
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
    return candleSnapshotByTimeRef.current.get(time as number)?.candle;
  }, []);

  const getVolumeDataByTime = useCallback((time: Time) => {
    return candleSnapshotByTimeRef.current.get(time as number)?.volume;
  }, []);

  // Tooltip Helper
  const updateTooltip = useCallback(
    (param: MouseEventParams, cursorPrice?: number) => {
      if (param.time && !param.point) return;

      if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        // 실시간 업데이트 중에는 툴팁을 지우지 않음 (데이터 갱신 시 잠깐 time이 사라지는 현상 방지)
        if (!isRealtimeUpdatingRef.current) {
          setTooltip(null);
          hoveredTimeRef.current = null;
        }
        return;
      }

      hoveredTimeRef.current = param.time;

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

  const applyPaneSeparatorStyles = useCallback(() => {
    if (!showVolume || !chartContainerRef.current) return;

    const separatorRow = chartContainerRef.current.querySelector('tr[style*="height: 1px"]');
    if (!(separatorRow instanceof HTMLTableRowElement)) return;

    const separatorCell = separatorRow.querySelector('td[colspan="3"]');
    if (!(separatorCell instanceof HTMLTableCellElement)) return;

    separatorCell.style.background = PANE_SEPARATOR_COLOR;

    const dragLayers = separatorCell.querySelectorAll('div[style*="row-resize"]');
    dragLayers.forEach((layer, index) => {
      if (!(layer instanceof HTMLDivElement)) return;

      if (index === 0) {
        layer.style.background = 'transparent';
      } else {
        layer.style.top = '-4px';
        layer.style.height = '9px';
        layer.style.borderTop = '0';
        layer.style.borderBottom = '0';
        layer.style.background = 'transparent';
        layer.style.boxShadow = `inset 0 1px 0 ${PANE_SEPARATOR_HOVER_COLOR}`;
      }
    });
  }, [PANE_SEPARATOR_COLOR, PANE_SEPARATOR_HOVER_COLOR, showVolume]);

  // 마켓/타임프레임 변경 시 Refs 초기화
  useEffect(() => {
    epochRef.current += 1; // stale fetch 방지용 epoch 증가
    allCandlesRef.current = [];
    chartCandlesRef.current = [];
    volumeDataRef.current = [];
    candleSnapshotByTimeRef.current = new Map();
    hasMoreDataRef.current = true;
    isLoadingMoreRef.current = false;
    chartInitializedRef.current = false; // 차트 초기화 대기
    minPriceLineRef.current = null;
    maxPriceLineRef.current = null;
  }, [market, timeframe]);

  // 차트 생성 및 동기화
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const generation = chartGenerationRef.current + 1;
    chartGenerationRef.current = generation;

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
      layout: {
        background: { color: BG_COLOR },
        textColor: TEXT_COLOR,
        panes: {
          enableResize: true,
          separatorColor: PANE_SEPARATOR_COLOR,
          separatorHoverColor: PANE_SEPARATOR_HOVER_COLOR,
        },
      },
      grid: {
        vertLines: { color: showGrid ? GRID_COLOR : 'transparent' },
        horzLines: { color: showGrid ? GRID_COLOR : 'transparent' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        minimumWidth: 130,
      },
      timeScale: {
        borderColor: BORDER_COLOR,
        timeVisible: true,
        secondsVisible: false,
        visible: true,
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

    if (showVolume) {
      const volumeSeries = mainChart.addSeries(
        HistogramSeries,
        {
          priceFormat: { type: 'volume' },
          color: upColor,
        },
        1,
      );
      volumeSeriesRef.current = volumeSeries;

      candleSeries.getPane().setStretchFactor(3);
      volumeSeries.getPane().setStretchFactor(1);
      mainChart.priceScale('right', 1).applyOptions({
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.1, bottom: 0 },
        minimumWidth: 130,
      });
    } else {
      volumeSeriesRef.current = null;
      candleSeries.getPane().setStretchFactor(1);
    }

    let handleMainRangeChange: ((range: LogicalRange | null) => void) | null = handleVisibleRangeChange;
    let handleMainCrosshairMove: ((param: MouseEventParams) => void) | null = null;

    mainChart.timeScale().subscribeVisibleLogicalRangeChange(handleMainRangeChange);

    handleMainCrosshairMove = (param) => {
      if (isRealtimeUpdatingRef.current) {
        return;
      }

      let cursorPrice: number | undefined;

      if (param.time) {
        hoveredTimeRef.current = param.time;
        if (param.paneIndex === 0 && param.point) {
          const price = candleSeries.coordinateToPrice(param.point.y);
          if (price !== null) {
            cursorPrice = price;
          }
        }
      } else {
        if (!isRealtimeUpdatingRef.current) {
          hoveredTimeRef.current = null;
          mainChart.clearCrosshairPosition();
        }
      }

      updateTooltip(param, cursorPrice);
    };

    mainChart.subscribeCrosshairMove(handleMainCrosshairMove);

    resizeObserverRef.current = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      if (chartGenerationRef.current !== generation || mainChartRef.current !== mainChart || !chartInitializedRef.current) return;

      const { width, height: containerHeight } = entries[0].contentRect;
      mainChart.resize(width, containerHeight);
      requestAnimationFrame(() => applyPaneSeparatorStyles());
    });
    resizeObserverRef.current.observe(container);

    if (candles && candles.length > 0) {
      allCandlesRef.current = [...candles];
      const initialChartState = buildChartState(candles, upColor, downColor);
      chartCandlesRef.current = initialChartState.chartCandles;
      volumeDataRef.current = initialChartState.volumeData;
      candleSnapshotByTimeRef.current = initialChartState.candleSnapshotByTime;
      candleSeries.setData(initialChartState.chartCandles);

      if (showVolume && volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(initialChartState.volumeData);
      }

      if (showMovingAverage && maSeriesRefs.current.length > 0) {
        maSeriesRefs.current.forEach((series, index) => {
          const period = movingAveragePeriods![index];
          series.setData(calculateSMA(initialChartState.chartCandles, period));
        });
      }

      mainChart.timeScale().fitContent();
      marketFittedRef.current = market;
      updateMinMaxPriceLines();
    }

    chartInitializedRef.current = true;
    setIsChartReady(true);
    requestAnimationFrame(() => applyPaneSeparatorStyles());

    return () => {
      chartGenerationRef.current += 1;
      setIsChartReady(false);
      chartInitializedRef.current = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (handleMainRangeChange) {
        mainChart.timeScale().unsubscribeVisibleLogicalRangeChange(handleMainRangeChange);
      }
      if (handleMainCrosshairMove) {
        mainChart.unsubscribeCrosshairMove(handleMainCrosshairMove);
      }
      mainChartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      maSeriesRefs.current = [];
      minPriceLineRef.current = null;
      maxPriceLineRef.current = null;
      mainChart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    market,
    timeframe,
    showVolume,
    showMovingAverage,
    movingAveragePeriodsKey,
    updateMinMaxPriceLines,
    updateTooltip,
    PANE_SEPARATOR_COLOR,
    PANE_SEPARATOR_HOVER_COLOR,
    applyPaneSeparatorStyles,
  ]);

  useEffect(() => {
    const mainChart = mainChartRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!mainChart || !candleSeries) return;

    mainChart.applyOptions({
      layout: {
        background: { color: BG_COLOR },
        textColor: TEXT_COLOR,
        panes: {
          enableResize: true,
          separatorColor: PANE_SEPARATOR_COLOR,
          separatorHoverColor: PANE_SEPARATOR_HOVER_COLOR,
        },
      },
      grid: {
        vertLines: { color: showGrid ? GRID_COLOR : 'transparent' },
        horzLines: { color: showGrid ? GRID_COLOR : 'transparent' },
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
      },
      timeScale: {
        borderColor: BORDER_COLOR,
        visible: true,
      },
    });
    candleSeries.applyOptions({
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    const volumeSeries = volumeSeriesRef.current;
    if (showVolume && volumeSeries) {
      volumeSeries.applyOptions({
        color: upColor,
      });
      candleSeries.getPane().setStretchFactor(3);
      volumeSeries.getPane().setStretchFactor(1);
      mainChart.priceScale('right', 1).applyOptions({
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.1, bottom: 0 },
        minimumWidth: 130,
      });
    } else {
      candleSeries.getPane().setStretchFactor(1);
    }
    requestAnimationFrame(() => applyPaneSeparatorStyles());
  }, [
    BG_COLOR,
    TEXT_COLOR,
    GRID_COLOR,
    BORDER_COLOR,
    showGrid,
    showVolume,
    upColor,
    downColor,
    PANE_SEPARATOR_COLOR,
    PANE_SEPARATOR_HOVER_COLOR,
    applyPaneSeparatorStyles,
  ]);

  // 데이터 업데이트 전용 useEffect
  useEffect(() => {
    if (!isChartReady || !candleSeriesRef.current || !candles || candles.length === 0) return;

    allCandlesRef.current = [...candles];
    const nextChartState = buildChartState(candles, upColor, downColor);
    chartCandlesRef.current = nextChartState.chartCandles;
    volumeDataRef.current = nextChartState.volumeData;
    candleSnapshotByTimeRef.current = nextChartState.candleSnapshotByTime;

    candleSeriesRef.current.setData(nextChartState.chartCandles);

    if (showVolume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(nextChartState.volumeData);
    }

    if (showMovingAverage && maSeriesRefs.current.length > 0 && movingAveragePeriods) {
      maSeriesRefs.current.forEach((series, index) => {
        const period = movingAveragePeriods[index];
        series.setData(calculateSMA(nextChartState.chartCandles, period));
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
      const ticker = realtimeTicker;
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
        chartCandlesRef.current = [...chartCandlesRef.current, newCandle];
        const newVolumeData = {
          time: candleTimestamp as Time,
          value: newVolume,
          color: upColor + '80',
        } satisfies HistogramData<Time>;
        volumeDataRef.current = [...volumeDataRef.current, newVolumeData];
        candleSnapshotByTimeRef.current.set(candleTimestamp, {
          candle: newCandle,
          volume: newVolumeData,
        });

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
        chartCandlesRef.current[chartCandlesRef.current.length - 1] = updatedCandle;
        const updatedVolume = {
          time: latestCandleTime as Time,
          value: currentVolume,
          color: currentTradePrice >= latestCandle.opening_price ? upColor + '80' : downColor + '80',
        } satisfies HistogramData<Time>;
        volumeDataRef.current[volumeDataRef.current.length - 1] = updatedVolume;
        candleSnapshotByTimeRef.current.set(latestCandleTime, {
          candle: updatedCandle,
          volume: updatedVolume,
        });

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
          const latestSMA = getLatestSMAUpdate(allCandlesRef.current, period);
          if (latestSMA) {
            series.update(latestSMA);
          }
        });
      }

      if (candleTimestamp > latestCandleTime) {
        updateMinMaxPriceLines();
      }

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
  }, [realtimeTicker, market, realtime, timeframe, showVolume, showMovingAverage, movingAveragePeriods, upColor, downColor, updateMinMaxPriceLines]);

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
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />

      {showVolume && (
        <Box
          sx={{
            position: 'absolute',
            left: 12,
            bottom: 12,
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
