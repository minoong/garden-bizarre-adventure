'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Box, IconButton, Typography, Card, CardMedia, CardContent, ImageList, ImageListItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import dayjs from 'dayjs';

import { useDropzoneContext } from './dropzone-root';

export function DropzonePreview() {
  const { files, removeFile } = useDropzoneContext();

  if (files.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        업로드된 파일 ({files.length})
      </Typography>

      <ImageList variant="masonry" cols={3} gap={16}>
        <AnimatePresence mode="popLayout">
          {files.map((fileWithMetadata) => {
            const { file, preview, id, metadata, status } = fileWithMetadata;
            const isImage = file.type.startsWith('image/');

            return (
              <ImageListItem key={id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                  }}
                >
                  <Card
                    sx={{
                      position: 'relative',
                      '&:hover .delete-button': {
                        opacity: 1,
                      },
                    }}
                  >
                    {preview ? (
                      isImage ? (
                        <CardMedia
                          component="img"
                          image={preview}
                          alt={file.name}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <CardMedia component="video" src={preview} controls sx={{ width: '100%', height: 'auto' }} />
                      )
                    ) : (
                      <Box
                        sx={{
                          minHeight: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                        }}
                      >
                        <InsertDriveFileIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                      </Box>
                    )}

                    <CardContent>
                      <Typography variant="body2" noWrap title={file.name}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>

                      {/* 이미지 크기 */}
                      {metadata?.width && metadata?.height && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          📐 {metadata.width} × {metadata.height}
                        </Typography>
                      )}

                      {/* 촬영 일시 */}
                      {metadata?.dateTaken && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          📅 {dayjs(metadata.dateTaken).format('YYYY. MM. DD. A hh:mm:ss')}
                        </Typography>
                      )}

                      {/* 카메라 */}
                      {(metadata?.make || metadata?.model) && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          📷 {metadata.make} {metadata.model}
                        </Typography>
                      )}

                      {/* 노출 3요소 */}
                      {(metadata?.iso || metadata?.fNumber || metadata?.exposureTime) && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {metadata.iso && `ISO ${metadata.iso}`}
                          {metadata.fNumber && ` • f/${metadata.fNumber}`}
                          {metadata.exposureTime && ` • ${metadata.exposureTime}s`}
                        </Typography>
                      )}

                      {/* 초점거리 */}
                      {metadata?.focalLength && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          🔍 {metadata.focalLength}mm
                        </Typography>
                      )}

                      {/* 소프트웨어 */}
                      {metadata?.software && (
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          💾 {metadata.software}
                        </Typography>
                      )}

                      {/* 플래시 */}
                      {metadata?.flash !== undefined && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ⚡ {metadata.flash === 0 ? '미사용' : '사용'}
                        </Typography>
                      )}

                      {/* 화이트 밸런스 */}
                      {metadata?.whiteBalance !== undefined && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ☀️ WB: {metadata.whiteBalance === 0 ? '자동' : '수동'}
                        </Typography>
                      )}

                      {status === 'processing' && (
                        <Typography variant="caption" color="primary">
                          처리 중...
                        </Typography>
                      )}
                    </CardContent>

                    <IconButton
                      className="delete-button"
                      onClick={() => removeFile(id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'error.main',
                          color: 'white',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </motion.div>
              </ImageListItem>
            );
          })}
        </AnimatePresence>
      </ImageList>
    </Box>
  );
}
