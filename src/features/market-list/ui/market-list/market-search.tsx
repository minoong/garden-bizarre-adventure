'use client';

import { useState, useTransition, useCallback, type ChangeEvent } from 'react';
import { Box, InputBase, IconButton, Divider } from '@mui/material';
import { Search as SearchIcon, Settings as SettingsIcon, Close as CloseIcon } from '@mui/icons-material';

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
      <IconButton sx={{ p: '10px' }} aria-label="settings" size="small">
        <SettingsIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
      </IconButton>
    </Box>
  );
}
