'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { Box, Typography, Tooltip, alpha, useTheme } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { RollingDigit } from './rolling-digit';

// dayjs 한국어 로케일 설정
dayjs.locale('ko');

/**
 * 실시간 시계 컴포넌트 (12/24시간 토글 기능 포함)
 */
export const HeaderClock = memo(function HeaderClock() {
  const theme = useTheme();
  const [timeStr, setTimeStr] = useState('');
  const [is24Hour, setIs24Hour] = useState(true);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = dayjs();

      if (is24Hour) {
        // 24시간 모드: '24H HH시 mm분 ss초'
        setTimeStr(now.format('[24H] HH시 mm분 ss초'));
      } else {
        // 12시간 모드: '오전/오후 hh시 mm분 ss초'
        // dayjs 'A'는 로케일에 따라 오전/오후로 출력됨
        setTimeStr(now.format('A hh시 mm분 ss초'));
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };

    updateTime();
    return () => cancelAnimationFrame(rafRef.current);
  }, [is24Hour]);

  return (
    <Tooltip title={is24Hour ? '12시간제로 변경' : '24시간제로 변경'} arrow>
      <Box
        onClick={() => setIs24Hour(!is24Hour)}
        sx={{
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          gap: 0.8,
          cursor: 'pointer',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          transition: 'all 0.2s',
          color: 'text.secondary',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            color: 'primary.main',
          },
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 16 }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '0.85rem',
            minWidth: is24Hour ? 85 : 120,
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '0.01em',
          }}
        >
          {timeStr.split('').map((char, index) => (
            <RollingDigit key={`${is24Hour ? '24' : '12'}-${index}`} char={char} color="inherit" />
          ))}
        </Typography>
      </Box>
    </Tooltip>
  );
});
