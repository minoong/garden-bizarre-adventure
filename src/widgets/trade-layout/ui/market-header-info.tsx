'use client';

import { memo, useEffect, useRef } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import gsap from 'gsap';

export interface MarketHeaderInfoProps {
  /** 코인 심볼 (예: BTC) */
  base: string;
  /** 기준 통화 (예: KRW) */
  quote: string;
  /** 한글 이름 */
  koreanName?: string;
}

/**
 * 마켓 헤더 정보 컴포넌트 - 코인 로고, 이름, 심볼 표시
 */
export const MarketHeaderInfo = memo(function MarketHeaderInfo({ base, quote, koreanName }: MarketHeaderInfoProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar
        src={`https://coinicons-api.vercel.app/api/icon/${base.toLowerCase()}`}
        sx={{ width: 36, height: 36, fontSize: '0.8rem', fontWeight: 'bold', bgcolor: 'primary.main' }}
      >
        {base.substring(0, 1)}
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
          {koreanName || base}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
            {base}/{quote}
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
});

export interface AnimatedPriceProps {
  /** 현재 가격 */
  price: number | string;
  /** 기준 통화 */
  quote: string;
  /** 색상 */
  color?: string;
  /** 가격 변동 방향 (상위 컴포넌트에서 제공) */
  change?: 'RISE' | 'FALL' | 'EVEN';
}

/**
 * 개별 숫자 롤링 애니메이션 컴포넌트 (GSAP 사용)
 * 0-9까지의 숫자를 세로로 배치하고 translateY로 애니메이션
 */
const RollingDigit = memo(({ char, color }: { char: string; color: string }) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const isNumber = /[0-9]/.test(char);

  // 숫자인 경우 9 - N 인덱스로 변환 (9가 맨 위, 0이 맨 아래)
  const digitVal = isNumber ? parseInt(char, 10) : 0;
  const targetIndex = 9 - digitVal;

  const prevIndexRef = useRef(targetIndex);

  // useLayoutEffect 대신 useEffect 사용 (SSR 경고 방지 및 import 간소화)
  // overwrite: true 옵션으로 애니메이션 충돌 방지
  useEffect(() => {
    if (!isNumber || !columnRef.current) return;

    if (prevIndexRef.current !== targetIndex) {
      // 값이 변경되면 애니메이션
      gsap.to(columnRef.current, {
        y: `${-targetIndex}em`,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      });
      prevIndexRef.current = targetIndex;
    }
  }, [targetIndex, isNumber]);

  // 마운트 시 초기 위치 설정
  useEffect(() => {
    if (columnRef.current) {
      gsap.set(columnRef.current, { y: `${-targetIndex}em`, overwrite: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isNumber) {
    return (
      <Typography component="span" variant="inherit" sx={{ display: 'inline-block', mx: 0.2 }}>
        {char}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'inline-block',
        height: '1em',
        overflow: 'hidden',
        verticalAlign: 'top',
        position: 'relative',
        width: '0.6em',
        mx: 0.05,
      }}
    >
      <Box
        ref={columnRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          willChange: 'transform',
          // transform 스타일 제거: GSAP 애니메이션과의 충돌 방지.
          // 초기 위치는 마운트 useEffect에서 gsap.set으로 설정됨.
        }}
      >
        {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((digit) => (
          <Box
            key={digit}
            sx={{
              height: '1em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              fontWeight: 'inherit',
            }}
          >
            {digit}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

RollingDigit.displayName = 'RollingDigit';

/**
 * 애니메이션이 적용된 가격 표시 컴포넌트
 */
export const AnimatedPrice = memo(function AnimatedPrice({ price, quote, color = 'text.primary', change }: AnimatedPriceProps) {
  const priceStr = String(price);
  const containerRef = useRef<HTMLDivElement>(null);

  // 가격 등락 시 전체 반짝임 효과
  useEffect(() => {
    if (change && change !== 'EVEN' && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { filter: change === 'RISE' ? 'brightness(1.5)' : 'brightness(0.7)' },
        { filter: 'brightness(1)', duration: 0.4, ease: 'power2.out' },
      );
    }
  }, [priceStr, change]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
      <Typography
        ref={containerRef}
        variant="h4"
        sx={{
          display: 'flex',
          fontWeight: 900,
          lineHeight: 1,
          color: color,
          transition: 'color 0.2s',
          letterSpacing: '0.02em', // 자간 추가
        }}
      >
        {priceStr.split('').map((char, index) => (
          // key를 index로 사용하여 자리수가 같을 때 컴포넌트 재사용 -> RollingDigit 내부에서 변화 감지
          <RollingDigit key={index} char={char} color={color} />
        ))}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {quote}
      </Typography>
    </Box>
  );
});
