'use client';

import { memo, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import gsap from 'gsap';

interface RollingDigitProps {
  char: string;
  color: string;
}

/**
 * 개별 숫자 롤링 애니메이션 컴포넌트 (GSAP 사용)
 */
export const RollingDigit = memo(({ char, color }: RollingDigitProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const isNumber = /[0-9]/.test(char);

  const digitVal = isNumber ? parseInt(char, 10) : 0;
  const targetIndex = digitVal; // 0-9 순서이므로 값이 곧 인덱스

  const prevIndexRef = useRef(targetIndex);

  useEffect(() => {
    if (!isNumber || !columnRef.current) return;

    if (prevIndexRef.current !== targetIndex) {
      gsap.to(columnRef.current, {
        y: `${-targetIndex}em`,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: true,
      });
      prevIndexRef.current = targetIndex;
    }
  }, [targetIndex, isNumber]);

  useEffect(() => {
    if (columnRef.current) {
      gsap.set(columnRef.current, { y: `${-targetIndex}em`, overwrite: true });
    }
  }, [targetIndex]);

  if (!isNumber) {
    return (
      <Typography component="span" variant="inherit" sx={{ display: 'inline-block', mx: 0.15, minWidth: char === ' ' ? '4px' : 'auto' }}>
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
        width: '0.62em',
        mx: 0.01,
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
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
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
