'use client';

import { useState, useTransition, useCallback, type ChangeEvent } from 'react';
import { Box, InputBase, IconButton, Divider, Tooltip, useTheme } from '@mui/material';
import { Search as SearchIcon, Settings as SettingsIcon, Close as CloseIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useTheme as useNextTheme } from 'next-themes';

import { createThemeCookie } from '@/shared/lib/theme/theme-cookie';

export interface MarketSearchProps {
  /** 검색어 변경 핸들러 */
  onSearch: (query: string) => void;
  /** 현재 검색어 */
  value: string;
  /** 플레이스홀더 */
  placeholder?: string;
}

/**
 * 마켓 검색 UI 컴포넌트
 */
export function MarketSearch({ onSearch, value, placeholder = '코인명(초성) 또는 심볼명 검색' }: MarketSearchProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [, startTransition] = useTransition();
  const theme = useTheme();
  const { resolvedTheme, setTheme } = useNextTheme();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      startTransition(() => {
        onSearch(newValue);
      });
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    startTransition(() => {
      onSearch('');
    });
  }, [onSearch]);

  const handleThemeToggle = useCallback(() => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.cookie = createThemeCookie(nextTheme);
  }, [resolvedTheme, setTheme]);

  const isDarkMode = resolvedTheme === 'dark' || theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: '10px', display: 'flex', alignItems: 'center', flex: 1 }}>
        <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
          placeholder={placeholder}
          value={internalValue}
          onChange={handleChange}
          inputProps={{ 'aria-label': 'search markets' }}
        />
        {internalValue && (
          <IconButton onClick={handleClear} size="small" sx={{ p: '2px' }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <Tooltip title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}>
        <IconButton
          onClick={handleThemeToggle}
          sx={{
            p: '10px',
            color: isDarkMode ? theme.palette.warning.light : theme.palette.warning.dark,
          }}
          aria-label={isDarkMode ? 'switch-to-light-mode' : 'switch-to-dark-mode'}
          size="small"
        >
          {isDarkMode ? <DarkModeIcon sx={{ fontSize: 20 }} /> : <LightModeIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Tooltip>
      <IconButton sx={{ p: '10px', color: 'text.secondary' }} aria-label="settings" size="small">
        <SettingsIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
}
