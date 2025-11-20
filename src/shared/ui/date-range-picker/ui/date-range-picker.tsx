'use client';

import { useState } from 'react';
import { Box, TextField, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { DayPicker, type DateRange as DayPickerDateRange } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import 'react-day-picker/style.css';

import type { DateRangePickerProps, DateRange } from '@/shared/ui/date-range-picker/types';

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value,
    onChange,
    fromLabel = '시작일',
    toLabel = '종료일',
    modalTitle = '날짜 범위 선택',
    dateFormat = 'YYYY-MM-DD',
    minDate,
    maxDate,
    disabled = false,
    required = false,
    error,
    helperText,
    fullWidth = false,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>({
    from: value?.from || null,
    to: value?.to || null,
  });
  const [isSameDay, setIsSameDay] = useState<boolean>(false);

  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const currentFrom = value?.from || dayjs();
  const currentTo = value?.to || dayjs();

  const handleOpenModal = () => {
    if (disabled) return;
    setTempRange({
      from: value?.from || null,
      to: value?.to || null,
    });
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    onChange?.(tempRange);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempRange({
      from: value?.from || null,
      to: value?.to || null,
    });
    setIsModalOpen(false);
  };

  const handleDayPickerSelect = (range: DayPickerDateRange | undefined) => {
    if (!range) {
      setTempRange({ from: null, to: null });
      return;
    }

    const from = range.from ? dayjs(range.from) : null;
    const to = range.to ? dayjs(range.to) : null;

    if (from && to && from.isSame(to, 'day') && !isSameDay) {
      setTempRange({ from, to: null });
      setIsSameDay(true);
      return;
    }

    setIsSameDay(false);

    setTempRange({ from, to });
  };

  const dayPickerRange: DayPickerDateRange | undefined =
    tempRange.from || tempRange.to
      ? {
          from: tempRange.from?.toDate(),
          to: tempRange.to?.toDate(),
        }
      : undefined;

  return (
    <>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        <TextField
          className="date-input"
          label={fromLabel}
          value={currentFrom.format(dateFormat)}
          onClick={handleOpenModal}
          disabled={disabled}
          required={required}
          error={!!error}
          helperText={error || helperText}
          size="small"
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleOpenModal} disabled={disabled} edge="end" size="small">
                    <CalendarTodayIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            cursor: disabled ? 'default' : 'pointer',
            minWidth: 160,
            flex: fullWidth ? 1 : 'none',
            transition: 'all 0.2s',
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
          ~
        </Typography>

        <TextField
          className="date-input"
          label={toLabel}
          value={currentTo.format(dateFormat)}
          onClick={handleOpenModal}
          disabled={disabled}
          required={required}
          size="small"
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleOpenModal} disabled={disabled} edge="end" size="small">
                    <CalendarTodayIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            cursor: disabled ? 'default' : 'pointer',
            minWidth: 160,
            flex: fullWidth ? 1 : 'none',
            transition: 'all 0.2s',
          }}
        />
      </Box>

      <Dialog open={isModalOpen} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {modalTitle}
          </Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              flexDirection: 'row',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              className="date-input"
              label={fromLabel}
              value={tempRange.from ? tempRange.from.format(dateFormat) : '시작일을 선택하세요'}
              disabled
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleOpenModal} disabled={disabled} edge="end" size="small">
                        <CalendarTodayIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                cursor: disabled ? 'default' : 'pointer',
                minWidth: 160,
                flex: fullWidth ? 1 : 'none',
                transition: 'all 0.2s',
              }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
              ~
            </Typography>

            <TextField
              className="date-input"
              label={toLabel}
              value={tempRange.to ? tempRange.to.format(dateFormat) : '종료일을 선택하세요'}
              disabled
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleOpenModal} disabled={disabled} edge="end" size="small">
                        <CalendarTodayIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                cursor: disabled ? 'default' : 'pointer',
                minWidth: 160,
                flex: fullWidth ? 1 : 'none',
                transition: 'all 0.2s',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flex: 1,
                '& .rdp': {
                  '--rdp-accent-color': '#1976d2',
                  '--rdp-background-color': '#e3f2fd',
                },
                '& .rdp-day_hover_preview': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2) !important',
                  color: '#1976d2 !important',
                  fontWeight: 600,
                },
              }}
            >
              <DayPicker
                locale={ko}
                captionLayout="dropdown"
                mode="range"
                selected={dayPickerRange}
                defaultMonth={tempRange.from?.toDate() || new Date()}
                onSelect={handleDayPickerSelect}
                modifiers={{
                  hoverPreview: (day) => {
                    if (!tempRange.from || tempRange.to || !hoveredDay) return false;
                    const dayjs_day = dayjs(day);
                    const from = tempRange.from;
                    const to = dayjs(hoveredDay);
                    const [start, end] = from.isBefore(to, 'day') ? [from, to] : [to, from];
                    return (
                      (dayjs_day.isAfter(start, 'day') || dayjs_day.isSame(start, 'day')) && (dayjs_day.isBefore(end, 'day') || dayjs_day.isSame(end, 'day'))
                    );
                  },
                }}
                modifiersClassNames={{
                  hoverPreview: 'rdp-day_hover_preview',
                }}
                onDayMouseEnter={(day) => {
                  setHoveredDay(day);
                }}
                onDayMouseLeave={() => {
                  setHoveredDay(null);
                }}
                disabled={[...(minDate ? [{ before: minDate.toDate() }] : []), ...(maxDate ? [{ after: maxDate.toDate() }] : [])]}
                numberOfMonths={2}
                pagedNavigation
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} variant="outlined" color="inherit">
            취소
          </Button>
          <Button onClick={handleConfirm} variant="contained" disabled={!tempRange.from || !tempRange.to}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
