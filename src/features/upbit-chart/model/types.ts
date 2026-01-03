import type { CandlestickData, Time } from 'lightweight-charts';

import type { CandleTimeframe } from '@/entities/upbit';

/**
 * 차트용 캔들 데이터
 */
export type ChartCandleData = CandlestickData<Time>;

/**
 * 차트 옵션
 */
export interface ChartOptions {
  /** 차트 높이 */
  height?: number;
  /** 차트 너비 (미지정 시 100%) */
  width?: number;
  /** 다크 모드 */
  darkMode?: boolean;
  /** 상승 색상 */
  upColor?: string;
  /** 하락 색상 */
  downColor?: string;
  /** 그리드 표시 여부 */
  showGrid?: boolean;
  /** 볼륨 표시 여부 */
  showVolume?: boolean;
}

/**
 * 캔들스틱 차트 Props
 */
export interface CandlestickChartProps {
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
  /** 클래스명 */
  className?: string;
}

/**
 * 타임프레임 선택 옵션
 */
export interface TimeframeOption {
  label: string;
  value: CandleTimeframe;
}

/**
 * 분봉 옵션
 */
export const MINUTE_TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '1분', value: { type: 'minutes', unit: 1 } },
  { label: '3분', value: { type: 'minutes', unit: 3 } },
  { label: '5분', value: { type: 'minutes', unit: 5 } },
  { label: '15분', value: { type: 'minutes', unit: 15 } },
  { label: '30분', value: { type: 'minutes', unit: 30 } },
  { label: '1시간', value: { type: 'minutes', unit: 60 } },
  { label: '4시간', value: { type: 'minutes', unit: 240 } },
];

/**
 * 일/주/월봉 옵션
 */
export const PERIOD_TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '일', value: { type: 'days' } },
  { label: '주', value: { type: 'weeks' } },
  { label: '월', value: { type: 'months' } },
];

/**
 * 전체 타임프레임 옵션
 */
export const ALL_TIMEFRAME_OPTIONS: TimeframeOption[] = [...MINUTE_TIMEFRAME_OPTIONS, ...PERIOD_TIMEFRAME_OPTIONS];

/**
 * 기본 차트 옵션
 */
export const DEFAULT_CHART_OPTIONS: Required<ChartOptions> = {
  height: 400,
  width: 0, // 0 = 100%
  darkMode: true,
  upColor: '#26a69a',
  downColor: '#ef5350',
  showGrid: true,
  showVolume: true,
};
