'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Alert,
  AlertTitle,
  Link,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  CloudQueue as CloudQueueIcon,
} from '@mui/icons-material';

import { uploadFiles, type FileUploadProgress, type FileUploadResult } from '@/shared/lib/firbase';

export default function UploadPlaygroundPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setUploadProgress([]);
    setUploadResults([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadResults([]);

    try {
      const results = await uploadFiles(selectedFiles, {
        path: 'playground/',
        onProgress: (progress) => {
          setUploadProgress([...progress]);
        },
      });

      setUploadResults(results);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setUploadProgress([]);
    setUploadResults([]);
    setIsUploading(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="disabled" />;
      case 'uploading':
        return <CloudQueueIcon color="primary" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'uploading':
        return 'primary';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Firebase Storage Upload Playground
      </Typography>

      {/* File Input Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            파일 선택
          </Typography>

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={isUploading}
            fullWidth
            sx={{ mb: 2, py: 2, borderStyle: 'dashed', borderWidth: 2 }}
          >
            파일 선택하기
            <input type="file" multiple hidden onChange={handleFileChange} />
          </Button>

          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                선택된 파일: {selectedFiles.length}개
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1 }}>
                <List dense>
                  {selectedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        slotProps={{
                          primary: { variant: 'body2' },
                          secondary: { variant: 'caption' },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0} fullWidth>
              {isUploading ? '업로드 중...' : '업로드 시작'}
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<DeleteIcon />} onClick={handleReset} disabled={isUploading} fullWidth>
              초기화
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {uploadProgress.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              업로드 진행 상황
            </Typography>
            <Stack spacing={2}>
              {uploadProgress.map((progress, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    {getStatusIcon(progress.status)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {progress.file.name}
                      </Typography>
                    </Box>
                    <Chip label={progress.status} color={getStatusColor(progress.status) as 'default' | 'primary' | 'success' | 'error'} size="small" />
                  </Stack>

                  {progress.status === 'uploading' && (
                    <Box>
                      <LinearProgress variant="determinate" value={progress.progress} sx={{ mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" align="right" display="block">
                        {progress.progress.toFixed(1)}%
                      </Typography>
                    </Box>
                  )}

                  {progress.error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {progress.error.message}
                    </Alert>
                  )}
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {uploadResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              업로드 결과
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              {uploadResults.map((result, index) => (
                <Alert key={index} severity={result.status === 'success' ? 'success' : 'error'} icon={getStatusIcon(result.status)}>
                  <AlertTitle>{result.file.name}</AlertTitle>

                  {result.downloadURL && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Download URL:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, mb: 1, bgcolor: 'background.paper' }}>
                        <Link
                          href={result.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          sx={{
                            wordBreak: 'break-all',
                            display: 'block',
                          }}
                        >
                          {result.downloadURL}
                        </Link>
                      </Paper>
                      <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => handleCopyUrl(result.downloadURL!)}>
                        URL 복사
                      </Button>
                    </Box>
                  )}

                  {result.error && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        에러 메시지:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.paper' }}>
                        <Typography variant="body2" color="error">
                          {result.error.message}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Alert>
              ))}
            </Stack>

            {/* Summary */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                요약
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    총 파일:{' '}
                    <Typography component="span" fontWeight="bold">
                      {uploadResults.length}개
                    </Typography>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    성공:{' '}
                    <Typography component="span" fontWeight="bold" color="success.main">
                      {uploadResults.filter((r) => r.status === 'success').length}개
                    </Typography>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    실패:{' '}
                    <Typography component="span" fontWeight="bold" color="error.main">
                      {uploadResults.filter((r) => r.status === 'error').length}개
                    </Typography>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
