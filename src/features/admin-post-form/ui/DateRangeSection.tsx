'use client';

import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import type { AdminPostFormValues } from '../model/schema';

interface DateRangeSectionProps {
  control: Control<AdminPostFormValues>;
  errors: FieldErrors<AdminPostFormValues>;
}

export function DateRangeSection({ control, errors }: DateRangeSectionProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          날짜 범위
        </Typography>

        <Grid container spacing={2}>
          {/* 시작 날짜 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dateFrom"
              control={control}
              render={({ field }) => (
                <Box>
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작 날짜 선택"
                    customInput={<TextField fullWidth label="시작 날짜" error={!!errors.dateFrom} helperText={errors.dateFrom?.message} />}
                  />
                </Box>
              )}
            />
          </Grid>

          {/* 종료 날짜 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dateTo"
              control={control}
              render={({ field }) => (
                <Box>
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="종료 날짜 선택"
                    customInput={<TextField fullWidth label="종료 날짜" error={!!errors.dateTo} helperText={errors.dateTo?.message} />}
                  />
                </Box>
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
