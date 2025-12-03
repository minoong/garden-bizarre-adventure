'use client';

import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Alert, Button, Card, CardContent, FormHelperText, Grid, Stack, TextField, Typography } from '@mui/material';
import { LocationOn as LocationOnIcon, Search as SearchIcon } from '@mui/icons-material';

import type { AdminPostFormValues } from '../model/schema';

interface LocationSectionProps {
  control: Control<AdminPostFormValues>;
  errors: FieldErrors<AdminPostFormValues>;
  selectedCount?: number;
  onApplyToSelected?: () => void;
}

export function LocationSection({ control, errors, selectedCount = 0, onApplyToSelected }: LocationSectionProps) {
  // TODO: 주소 API 연동 함수 (나중에 구현)
  const handleSearchAddress = () => {
    console.log('주소 검색 API 호출 예정');
    // 카카오 주소 API 또는 Google Places API 연동
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('현재 위치:', position.coords.latitude, position.coords.longitude);
          // control.setValue('latitude', position.coords.latitude);
          // control.setValue('longitude', position.coords.longitude);
        },
        (error) => {
          console.error('위치 가져오기 실패:', error);
        },
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">위치 정보</Typography>
          {selectedCount > 0 && (
            <Button size="small" variant="outlined" onClick={onApplyToSelected}>
              선택된 {selectedCount}개 파일에 적용
            </Button>
          )}
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          선택된 파일들에 일괄적으로 위치 정보를 적용할 수 있습니다.
        </Alert>

        <Grid container spacing={2}>
          {/* 장소명 */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="locationName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="장소명"
                  placeholder="예: 서울 강남구, 제주 우도"
                  fullWidth
                  error={!!errors.locationName}
                  helperText={errors.locationName?.message}
                  slotProps={{
                    input: {
                      startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* 주소 검색 (템플릿) */}
          <Grid size={{ xs: 12 }}>
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={handleSearchAddress} fullWidth>
              주소 검색 (API 연동 예정)
            </Button>
          </Grid>

          {/* 위도 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="위도 (Latitude)"
                  type="number"
                  placeholder="37.5665"
                  fullWidth
                  error={!!errors.latitude}
                  helperText={errors.latitude?.message || '범위: -90 ~ 90'}
                  slotProps={{
                    htmlInput: {
                      step: 'any',
                      min: -90,
                      max: 90,
                    },
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseFloat(value));
                  }}
                  value={field.value ?? ''}
                />
              )}
            />
          </Grid>

          {/* 경도 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="경도 (Longitude)"
                  type="number"
                  placeholder="126.9780"
                  fullWidth
                  error={!!errors.longitude}
                  helperText={errors.longitude?.message || '범위: -180 ~ 180'}
                  slotProps={{
                    htmlInput: {
                      step: 'any',
                      min: -180,
                      max: 180,
                    },
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseFloat(value));
                  }}
                  value={field.value ?? ''}
                />
              )}
            />
          </Grid>

          {/* 현재 위치 가져오기 */}
          <Grid size={{ xs: 12 }}>
            <Button variant="outlined" onClick={handleGetCurrentLocation} fullWidth>
              현재 위치 가져오기
            </Button>
            <FormHelperText>브라우저의 위치 권한이 필요합니다</FormHelperText>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
