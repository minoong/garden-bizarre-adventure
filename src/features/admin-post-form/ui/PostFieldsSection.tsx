'use client';

import { useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Autocomplete, Card, CardContent, Chip, FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';

import type { AdminPostFormValues } from '../model/schema';

interface PostFieldsSectionProps {
  control: Control<AdminPostFormValues>;
  errors: FieldErrors<AdminPostFormValues>;
}

export function PostFieldsSection({ control, errors }: PostFieldsSectionProps) {
  const [tagInput, setTagInput] = useState('');

  // 인기 테마 목록 (추후 Supabase에서 가져올 수 있음)
  const popularThemes = ['여행', '음식', '카페', '자연', '일상', '운동', '패션', '예술'];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          게시물 정보
        </Typography>

        <Grid container spacing={2}>
          {/* 제목 */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="제목"
                  placeholder="게시물 제목을 입력하세요"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message || `${field.value?.length || 0}/200자`}
                />
              )}
            />
          </Grid>

          {/* 내용 */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="내용"
                  placeholder="게시물 내용을 입력하세요"
                  multiline
                  rows={6}
                  fullWidth
                  error={!!errors.content}
                  helperText={errors.content?.message || `${field.value?.length || 0}/5000자`}
                />
              )}
            />
          </Grid>

          {/* 테마 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={popularThemes}
                  freeSolo
                  value={field.value || ''}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="테마/카테고리"
                      placeholder="테마를 선택하거나 입력하세요"
                      error={!!errors.theme}
                      helperText={errors.theme?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          {/* 공개 여부 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="공개 게시물" sx={{ mt: 1 }} />}
            />
          </Grid>

          {/* 태그 */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  inputValue={tagInput}
                  onInputChange={(_, newInputValue) => setTagInput(newInputValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                        onDelete={() => {
                          const newTags = field.value?.filter((_, i) => i !== index);
                          field.onChange(newTags);
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="태그"
                      placeholder="태그를 입력하고 Enter를 누르세요"
                      error={!!errors.tags}
                      helperText={errors.tags?.message || `${field.value?.length || 0}/20개 (Enter로 추가)`}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
