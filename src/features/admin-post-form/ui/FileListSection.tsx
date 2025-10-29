'use client';

import { Box, Button, Card, CardContent, CardMedia, Checkbox, Chip, Grid, IconButton, Stack, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Delete as DeleteIcon, Error as ErrorIcon, Image as ImageIcon } from '@mui/icons-material';

import type { UploadedFileInfo } from '../model/types';

interface FileListSectionProps {
  files: UploadedFileInfo[];
  selectedFileIds: string[];
  onSelectedFilesChange: (selectedIds: string[]) => void;
  onFileRemove: (fileId: string) => void;
}

export function FileListSection({ files, selectedFileIds, onSelectedFilesChange, onFileRemove }: FileListSectionProps) {
  const handleToggleFile = (fileId: string) => {
    if (selectedFileIds.includes(fileId)) {
      onSelectedFilesChange(selectedFileIds.filter((id) => id !== fileId));
    } else {
      onSelectedFilesChange([...selectedFileIds, fileId]);
    }
  };

  const handleSelectAll = () => {
    const successFiles = files.filter((f) => f.uploadStatus === 'success');
    onSelectedFilesChange(successFiles.map((f) => f.id));
  };

  const handleDeselectAll = () => {
    onSelectedFilesChange([]);
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              업로드된 파일이 없습니다
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const successFiles = files.filter((f) => f.uploadStatus === 'success');
  const allSelected = successFiles.length > 0 && selectedFileIds.length === successFiles.length;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">업로드된 파일 ({files.length}개)</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={allSelected ? handleDeselectAll : handleSelectAll}>
              {allSelected ? '전체 해제' : '전체 선택'}
            </Button>
          </Stack>
        </Stack>

        {selectedFileIds.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip label={`${selectedFileIds.length}개 선택됨`} color="primary" size="small" />
          </Box>
        )}

        <Grid container spacing={2}>
          {files.map((fileInfo) => {
            const isSelected = selectedFileIds.includes(fileInfo.id);
            const isSuccess = fileInfo.uploadStatus === 'success';
            const isImage = fileInfo.file.file.type.startsWith('image/');
            const isVideo = fileInfo.file.file.type.startsWith('video/');

            return (
              <Grid key={fileInfo.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSuccess && (
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleFile(fileInfo.id)}
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'background.paper' },
                        }}
                      />
                    </Box>
                  )}

                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                    <IconButton size="small" onClick={() => onFileRemove(fileInfo.id)} sx={{ bgcolor: 'background.paper' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {(isImage || isVideo) && fileInfo.file.preview && (
                    <CardMedia
                      component={isVideo ? 'video' : 'img'}
                      height="200"
                      image={fileInfo.firebaseUrl}
                      alt={fileInfo.file.file.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}

                  <CardContent>
                    <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                      {fileInfo.file.file.name}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {isSuccess ? (
                        <>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Chip label="업로드 완료" color="success" size="small" />
                        </>
                      ) : (
                        <>
                          <ErrorIcon color="error" fontSize="small" />
                          <Chip label={fileInfo.error || '업로드 실패'} color="error" size="small" />
                        </>
                      )}
                    </Stack>

                    {fileInfo.file.metadata && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {fileInfo.file.metadata.width && fileInfo.file.metadata.height && (
                            <>
                              {fileInfo.file.metadata.width} × {fileInfo.file.metadata.height}
                            </>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}
