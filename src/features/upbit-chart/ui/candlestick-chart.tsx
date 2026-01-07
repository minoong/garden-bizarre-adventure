'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, CrosshairMode, LineStyle } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, DeepPartial, ChartOptions as LWChartOptions, LogicalRange, Time, IPriceLine } from 'lightweight-charts';
import { Box, CircularProgress, Typography, Popper } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

import {
  useCandles,
  useUpbitSocket,
  fetchCandles,
  type CandleTimeframe,
  type MinuteCandle,
  type DayCandle,
  type WeekCandle,
  type MonthCandle,
} from '@/entities/upbit';
import { calculatePriceChange } from '@/entities/upbit';

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
  const maSeriesRefs = useRef<ISeriesApi<'Line'>[]>([]);
  const minPriceLineRef = useRef<IPriceLine | null>(null);
  const maxPriceLineRef = useRef<IPriceLine | null>(null);

  // 모든 로드된 캔들 데이터 저장 (무한 스크롤용)
  const allCandlesRef = useRef<CandleData[]>([]);
  const isLoadingMoreRef = useRef(false);
  const hasMoreDataRef = useRef(true);
  const epochRef = useRef(0); // 타임프레임/마켓 변경 시 증가
  const chartInitializedRef = useRef(false); // 차트가 현재 데이터로 초기화되었는지
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 툴팁 상태
  const [tooltip, setTooltip] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  } | null>(null);

  // 툴팁 anchor element (가상 element, 마우스 커서 위치)
  const [tooltipAnchor, setTooltipAnchor] = useState<{
    getBoundingClientRect: () => DOMRect;
  } | null>(null);

  // 옵션 병합
  const chartOptions = { ...DEFAULT_CHART_OPTIONS, ...options };
  const { height, darkMode, upColor, downColor, showGrid, showVolume, showMovingAverage, movingAveragePeriods, showMinMaxPrice } = chartOptions;

  // 색상 상수 (Upbit Dark Mode)
  const BG_COLOR = darkMode ? '#0B1219' : '#ffffff';
  const TEXT_COLOR = darkMode ? '#d1d4dc' : '#191919';
  const GRID_COLOR = darkMode ? '#2B2B43' : '#e1e1e1';
  const BORDER_COLOR = darkMode ? '#2B2B43' : '#e1e1e1';

  // 이동평균선 색상

  // REST API로 초기 데이터 로드
  const { data: candles, isLoading, error } = useCandles(market, timeframe, { count: initialCount });

  // WebSocket ticker로 실시간 업데이트
  const { tickers, status: wsStatus } = useUpbitSocket(realtime ? [market] : [], realtime ? ['ticker'] : [], {
    autoConnect: realtime,
  });

  // 최저/최고가 라인 업데이트 함수
  const updateMinMaxPriceLines = useCallback(() => {
    const chart = chartRef.current;
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

  // 스크롤 범위 변경 감지 핸들러
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
        background: { color: BG_COLOR },
        textColor: TEXT_COLOR,
      },
      grid: {
        vertLines: { color: showGrid ? GRID_COLOR : 'transparent' },
        horzLines: { color: showGrid ? GRID_COLOR : 'transparent' },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      },
      timeScale: {
        borderColor: BORDER_COLOR,
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

    // 최저/최고가 라인 설정
    updateMinMaxPriceLines();

    // 이동평균선 시리즈 추가 및 데이터 설정
    maSeriesRefs.current = [];
    if (showMovingAverage && movingAveragePeriods && movingAveragePeriods.length > 0) {
      movingAveragePeriods.forEach((period, index) => {
        const color = MA_COLORS[index % MA_COLORS.length];
        const maSeries = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        });

        const smaData = calculateSMA(chartCandles, period);
        maSeries.setData(smaData);
        maSeriesRefs.current.push(maSeries as ISeriesApi<'Line'>);
      });
    }

    chart.timeScale().fitContent();

    // 차트 초기화 완료 표시 (무한 스크롤, 실시간 업데이트 허용)
    // 중요: subscribeVisibleLogicalRangeChange 전에 설정해야 함 (콜백이 동기 실행될 수 있음)
    chartInitializedRef.current = true;

    // 무한 스크롤을 위한 visible range 구독
    if (infiniteScroll) {
      chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    }

    // 마우스 호버 시 캔들 정보 표시 (Crosshair Move)
    chart.subscribeCrosshairMove((param) => {
      // 차트 밖이거나 데이터가 없으면 툴팁 숨김
      if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        setTooltip(null);
        setTooltipAnchor(null);
        return;
      }

      // 현재 캔들 데이터 가져오기
      const candleData = param.seriesData.get(candleSeries);
      const volumeData = volumeSeries ? param.seriesData.get(volumeSeries) : null;

      if (candleData && 'open' in candleData) {
        // 시간 포맷팅 (Unix timestamp → 날짜/시간)
        const time = new Date((param.time as number) * 1000);
        const timeStr = time.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        // 차트 컨테이너의 절대 좌표 계산
        const containerRect = container.getBoundingClientRect();
        const x = containerRect.left + param.point.x;
        const y = containerRect.top + param.point.y;

        // 가상 anchor element 생성 (Popper가 마우스 커서 위치를 기준으로 계산)
        setTooltipAnchor({
          getBoundingClientRect: () =>
            ({
              width: 0,
              height: 0,
              top: y,
              left: x,
              right: x,
              bottom: y,
              x: x,
              y: y,
            }) as DOMRect,
        });

        setTooltip({
          time: timeStr,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData && 'value' in volumeData && typeof volumeData.value === 'number' ? volumeData.value : undefined,
        });
      }
    });

    return () => {
      chartInitializedRef.current = false; // 실시간 업데이트 차단
      if (infiniteScroll) {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      }
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      maSeriesRefs.current = [];
      minPriceLineRef.current = null;
      maxPriceLineRef.current = null;
    };
  }, [
    candles,
    height,
    darkMode,
    upColor,
    downColor,
    showGrid,
    showVolume,
    showMovingAverage,
    movingAveragePeriods,
    infiniteScroll,
    handleVisibleRangeChange,
    BG_COLOR,
    TEXT_COLOR,
    GRID_COLOR,
    BORDER_COLOR,
    updateMinMaxPriceLines,
  ]);

  // ticker WebSocket으로 실시간 가격 업데이트 + 새 캔들 생성
  useEffect(() => {
    if (!realtime || !chartInitializedRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    const ticker = tickers.get(market);
    if (!ticker || !allCandlesRef.current.length) return;

    // ticker timestamp를 기준으로 캔들 시작 시간 계산
    const candleStartTime = getCandleStartTime(ticker.timestamp, timeframe);
    const candleTimestamp = Math.floor(candleStartTime.getTime() / 1000);
    // 최신 캔들 가져오기
    const latestCandle = allCandlesRef.current[0];
    const latestCandleTime = Math.floor(new Date(latestCandle.candle_date_time_kst + '+09:00').getTime() / 1000);

    // 실시간 데이터 추출
    const currentTradePrice = ticker.trade_price;

    // Volume calculation using Ticker
    // ticker.acc_trade_volume_24h is 24h volume, not minute volume.
    // We accumulate trade_volume from ticker events for the current minute candle.

    let currentVolume = latestCandle.candle_acc_trade_volume;

    // If we are on a new candle (time change), reset volume for accumulation
    // otherwise, add the trade volume.
    // Note: ticker.trade_volume is the volume of the individual trade.

    // However, if we missed packets, pure accumulation might be drifting.
    // For Days, we can use ticker.acc_trade_volume.
    if (timeframe.type === 'days') {
      currentVolume = ticker.acc_trade_volume;
    }

    // 새로운 캔들 시작 여부 확인
    if (candleTimestamp > latestCandleTime) {
      // 새 캔들 생성
      const newCandle = {
        time: candleTimestamp as Time,
        open: currentTradePrice,
        high: currentTradePrice, // Start fresh
        low: currentTradePrice, // Start fresh
        close: currentTradePrice,
      };

      candleSeriesRef.current.update(newCandle);

      // 새 캔들을 위한 초기 Volumes
      const newVolume = ticker.trade_volume; // Start with current trade volume

      // allCandlesRef에도 추가
      const candleStartKst = new Date(candleTimestamp * 1000 + 9 * 60 * 60 * 1000);
      const newCandleData: CandleData = {
        market,
        candle_date_time_utc: new Date(candleTimestamp * 1000).toISOString().slice(0, 19).replace('T', ' '),
        candle_date_time_kst: candleStartKst.toISOString().slice(0, 19).replace('T', ' '),
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

      // Volume 추가
      if (showVolume) {
        const volumeData = {
          time: candleTimestamp as Time,
          value: newVolume,
          color: upColor + '80',
        };
        volumeSeriesRef.current.update(volumeData);
      }
    } else {
      // 기존 캔들 업데이트
      // 1. Accumulate Volume (if not Day chart where we use absolute)
      if (timeframe.type !== 'days') {
        currentVolume += ticker.trade_volume;
      }

      const updatedCandle = {
        time: latestCandleTime as Time,
        open: latestCandle.opening_price,
        high: Math.max(latestCandle.high_price, currentTradePrice),
        low: Math.min(latestCandle.low_price, currentTradePrice),
        close: currentTradePrice,
      };

      candleSeriesRef.current.update(updatedCandle);

      // allCandlesRef도 업데이트
      allCandlesRef.current[0] = {
        ...latestCandle,
        high_price: updatedCandle.high,
        low_price: updatedCandle.low,
        trade_price: updatedCandle.close,
        timestamp: ticker.timestamp,
        candle_acc_trade_volume: currentVolume,
      };

      // Volume 업데이트
      if (showVolume) {
        const isUp = currentTradePrice >= latestCandle.opening_price;
        const volumeData = {
          time: latestCandleTime as Time,
          value: currentVolume,
          color: isUp ? upColor + '80' : downColor + '80',
        };
        volumeSeriesRef.current.update(volumeData);
      }
    }

    // SMA 업데이트 (실시간 데이터로 재계산 필요 - 간단히 전체 다시 계산하거나 최적화 필요)
    // 여기서는 최신 데이터 기준으로 간단히 업데이트
    // 하지만 lightweight-charts의 update는 single point update이므로,
    // SMA도 update() 호출이 가능하지만, SMA 계산을 위해서는 이전 N개의 데이터가 필요.
    // 실시간으로 SMA 전체를 다시 그리는 것은 비효율적일 수 있으나,
    // update()로 마지막 점만 추가하는 것이 가장 부드러움.

    if (showMovingAverage && maSeriesRefs.current.length > 0 && movingAveragePeriods) {
      // allCandlesRef가 업데이트 되었으므로 다시 계산 가능 (하지만 전체 set은 무거울 수 있음)
      // 최적화: 마지막 캔들에 대한 SMA 값만 계산하여 update
      const allChartCandles = toChartCandles(allCandlesRef.current);
      // 역순 정렬되어 있으므로 chartCandles[0]이 가장 과거일 수 있음.
      // toChartCandles는 reverse()를 하므로 [0]이 가장 과거, [last]가 최신.
      // calculateSMA는 오름차순(과거->미래) 데이터 필요.
      const sortedCandles = [...allChartCandles].sort((a, b) => (a.time as number) - (b.time as number));

      maSeriesRefs.current.forEach((series, index) => {
        const period = movingAveragePeriods[index];
        const smaData = calculateSMA(sortedCandles, period);
        if (smaData.length > 0) {
          const lastSMA = smaData[smaData.length - 1];
          series.update(lastSMA);
        }
      });
    }

    // 실시간 가격 변화에 따른 최저/최고가 업데이트
    updateMinMaxPriceLines();
  }, [tickers, market, realtime, timeframe, showVolume, showMovingAverage, movingAveragePeriods, upColor, downColor, updateMinMaxPriceLines]);

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
    <Box className={className} sx={{ position: 'relative', bgcolor: BG_COLOR }}>
      {/* 상단 OHLC 정보 표시 */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 12,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          pointerEvents: 'none',
        }}
      >
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
          const priceChange = calculatePriceChange(displayData.open, displayData.close, upColor, downColor);

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'baseline' }}>
                  <Typography sx={{ color: TEXT_COLOR, fontSize: '0.625rem', fontWeight: 700 }}>PRICE</Typography>
                  <Typography sx={{ color: priceChange.changeColor, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1 }}>
                    {displayData.close.toLocaleString()}
                  </Typography>
                  <Typography sx={{ color: priceChange.changeColor, fontSize: '0.6875rem', fontWeight: 600 }}>{priceChange.formattedChange}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
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

      {/* VOLUME 라벨 */}
      {showVolume && (
        <Box
          sx={{
            position: 'absolute',
            bottom: height * 0.25 - 10,
            left: 12,
            zIndex: 5,
            bgcolor: darkMode ? 'rgba(43, 43, 67, 0.4)' : 'rgba(240, 240, 240, 0.7)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            px: 0.6,
            py: 0.2,
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ color: TEXT_COLOR, fontWeight: 700, fontSize: '0.625rem', letterSpacing: '0.05em' }}>
            VOLUME
          </Typography>
        </Box>
      )}

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

      {/* 마우스 호버 툴팁 (Popper로 자동 위치 조정) */}
      <Popper
        open={Boolean(tooltip && tooltipAnchor)}
        anchorEl={tooltipAnchor}
        placement="right-start"
        modifiers={[
          {
            name: 'flip',
            enabled: true,
            options: {
              fallbackPlacements: ['left-start', 'top-start', 'bottom-start'],
            },
          },
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              boundary: chartContainerRef.current,
              padding: 8,
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ]}
        style={{ zIndex: 1000, pointerEvents: 'none' }}
      >
        <Box
          sx={{
            bgcolor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${darkMode ? '#3c3c3c' : '#e1e1e1'}`,
            borderRadius: 1,
            px: 1.5,
            py: 1,
            minWidth: 180,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {tooltip &&
            (() => {
              // 시가 대비 종가 변화율 계산 (유틸리티 함수 사용)
              const priceChange = calculatePriceChange(tooltip.open, tooltip.close, upColor, downColor);

              return (
                <>
                  {/* 종가 + 변화율 (강조) */}
                  <Box sx={{ mb: 1, pb: 0.75, borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e1e1e1'}` }}>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 700, mb: 0.5, color: priceChange.changeColor }}>
                      종가: {tooltip.close.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {priceChange.isRise ? (
                        <ArrowDropUp sx={{ fontSize: '1.25rem', color: priceChange.changeColor }} />
                      ) : (
                        <ArrowDropDown sx={{ fontSize: '1.25rem', color: priceChange.changeColor }} />
                      )}
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: priceChange.changeColor }}>
                        {priceChange.formattedChange}
                      </Typography>
                    </Box>
                  </Box>

                  {/* OHLC 상세 정보 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: darkMode ? '#999' : '#666', minWidth: 40, display: 'inline-block' }}>
                        시가:
                      </Box>
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {tooltip.open.toLocaleString()}
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: darkMode ? '#999' : '#666', minWidth: 40, display: 'inline-block' }}>
                        고가:
                      </Box>
                      <Box component="span" sx={{ fontWeight: 600, color: upColor }}>
                        {tooltip.high.toLocaleString()}
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: darkMode ? '#999' : '#666', minWidth: 40, display: 'inline-block' }}>
                        저가:
                      </Box>
                      <Box component="span" sx={{ fontWeight: 600, color: downColor }}>
                        {tooltip.low.toLocaleString()}
                      </Box>
                    </Typography>
                    {tooltip.volume !== undefined && (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5, pt: 0.5, borderTop: `1px solid ${darkMode ? '#3c3c3c' : '#e1e1e1'}` }}>
                        <Box component="span" sx={{ color: darkMode ? '#999' : '#666', minWidth: 40, display: 'inline-block' }}>
                          거래량:
                        </Box>
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {tooltip.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </Box>
                      </Typography>
                    )}
                  </Box>
                </>
              );
            })()}
        </Box>
      </Popper>
    </Box>
  );
}
