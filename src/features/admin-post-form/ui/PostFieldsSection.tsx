'use client';

import { useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Autocomplete, Card, CardContent, FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getPopularCategories } from '@/entities/category';
import { getPopularTags } from '@/entities/tag';

import type { AdminPostFormValues } from '../model/schema';

interface PostFieldsSectionProps {
  control: Control<AdminPostFormValues>;
  errors: FieldErrors<AdminPostFormValues>;
}

export function PostFieldsSection({ control, errors }: PostFieldsSectionProps) {
  const [tagInput, setTagInput] = useState('');

  // Supabase에서 인기 카테고리 가져오기
  const { data: categories = [] } = useQuery({
    queryKey: ['popular-categories'],
    queryFn: () => getPopularCategories(20),
    staleTime: 1000 * 60 * 5, // 5분
  });

  // Supabase에서 인기 태그 가져오기
  const { data: tags = [] } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: () => getPopularTags(20),
    staleTime: 1000 * 60 * 5, // 5분
  });

  const popularThemes = categories.map((cat) => cat.name);
  const popularTags = tags.map((tag) => tag.name);

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
                  multiple
                  freeSolo
                  options={popularThemes}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="테마/카테고리"
                      placeholder="테마를 선택하거나 입력하세요"
                      error={!!errors.theme}
                      helperText={errors.theme?.message || `${field.value?.length || 0}/10개`}
                    />
                  )}
                />
              )}
            />
          </Grid>

          {/* 태그 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={popularTags}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  inputValue={tagInput}
                  onInputChange={(_, newInputValue) => setTagInput(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="태그"
                      placeholder="태그를 입력하고 Enter를 누르세요"
                      error={!!errors.tags}
                      helperText={errors.tags?.message || `${field.value?.length || 0}/20개`}
                    />
                  )}
                />
              )}
            />
          </Grid>

          {/* 공개 여부 */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="공개 게시물" sx={{ mt: 1 }} />}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
