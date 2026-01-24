import { memo } from 'react';
import type { FC } from 'react';
import { scaleLinear } from 'd3-scale';

interface D3CandleProps {
  /** 시가 */
  open: number;
  /** 종가 */
  close: number;
  /** 고가 */
  high: number;
  /** 저가 */
  low: number;
  /** X 좌표 */
  x: number;
  /** 캔들 너비 */
  width: number;
  /** 차트 높이 */
  height: number;
  /** 최소 가격 (스케일용) */
  minPrice: number;
  /** 최대 가격 (스케일용) */
  maxPrice: number;
  /** 상승 색상 */
  upColor?: string;
  /** 하락 색상 */
  downColor?: string;
}

/**
 * D3 기반 단일 캔들 컴포넌트
 */
export const D3Candle: FC<D3CandleProps> = memo(({ open, close, high, low, x, width, height, minPrice, maxPrice, upColor, downColor }) => {
  // 상승/하락 여부
  const isRise = close >= open;
  // 색상이 전달되지 않은 경우 기본값 (하지만 상위에서 전달하는 것이 원칙)
  const finalUpColor = upColor || '#c84a31';
  const finalDownColor = downColor || '#1261c4';
  const color = isRise ? finalUpColor : finalDownColor;

  // 가격을 Y 좌표로 변환하는 스케일
  const yScale = scaleLinear().domain([minPrice, maxPrice]).range([height, 0]);

  // 캔들 몸통 (시가와 종가 사이)
  const bodyTop = Math.min(yScale(open) || 0, yScale(close) || 0);
  const bodyHeight = Math.abs((yScale(open) || 0) - (yScale(close) || 0));
  const bodyX = x - width / 2;

  // 심지 (고가와 저가를 연결하는 선)
  const wickX = x;
  const wickY1 = yScale(high) || 0;
  const wickY2 = yScale(low) || 0;

  return (
    <g>
      {/* 심지 (High-Low 선) */}
      <line x1={wickX} y1={wickY1} x2={wickX} y2={wickY2} stroke={color} strokeWidth={1} />

      {/* 캔들 몸통 (Open-Close 사각형) */}
      <rect x={bodyX} y={bodyTop} width={width} height={Math.max(bodyHeight, 1)} fill={color} />
    </g>
  );
});

D3Candle.displayName = 'D3Candle';
