'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, IconButton, Typography, Card, CardMedia, ImageList, ImageListItem, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { filesize } from 'filesize';
import dayjs from 'dayjs';

import { FileMetadataModal } from '@/features/file-metadata-viewer';

import type { FileWithMetadata } from '../types';

import { useDropzoneContext } from './dropzone-root';

export function DropzonePreview() {
  const { files, removeFile } = useDropzoneContext();
  const [selectedFile, setSelectedFile] = useState<FileWithMetadata | null>(null);

  const handleOpenModal = (file: FileWithMetadata) => {
    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        업로드된 파일 ({files.length})
      </Typography>

      <Box
        sx={{
          maxHeight: 600,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
            transition: 'background-color 0.2s',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0, 0, 0, 0.4)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <ImageList variant="masonry" cols={3} gap={16}>
          <AnimatePresence mode="popLayout">
            {files.map((fileWithMetadata) => {
              const { file, preview, id, metadata } = fileWithMetadata;
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
                          <Box sx={{ overflow: 'hidden' }}>
                            <CardMedia
                              component="img"
                              image={preview}
                              alt={file.name}
                              sx={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                transition: 'transform 0.3s',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ overflow: 'hidden' }}>
                            <CardMedia component="video" src={preview} controls sx={{ width: '100%', height: 'auto' }} />
                          </Box>
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

                      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        {/* 노출 정보 (ISO, 초점거리, F값, 셔터스피드) */}
                        {(metadata?.iso || metadata?.focalLength || metadata?.fNumber || metadata?.exposureTime) && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 500, letterSpacing: '0.02em' }}>
                            {metadata.iso && `ISO${metadata.iso}`}
                            {metadata.focalLength && ` ${metadata.focalLength}mm`}
                            {metadata.fNumber && ` F${metadata.fNumber}`}
                            {metadata.exposureTime && ` 1/${Math.round(1 / metadata.exposureTime)}s`}
                          </Typography>
                        )}

                        {/* 촬영 일시 */}
                        {metadata?.dateTaken && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.6 }}>
                            {dayjs(metadata.dateTaken).format('YYYY/MM/DD HH:mm:ss')}
                          </Typography>
                        )}

                        {/* 카메라 모델 */}
                        {(metadata?.make || metadata?.model) && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.6 }}>
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              {metadata.make} {metadata.model}
                            </Box>
                          </Typography>
                        )}

                        {/* 파일 크기 */}
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.6 }}>
                          <Box component="span" sx={{ fontWeight: 500 }}>
                            원본: {filesize(file.size, { standard: 'jedec' })}
                          </Box>
                          {fileWithMetadata.optimized && (
                            <>
                              <Box component="span" sx={{ mx: 1, opacity: 0.5 }}>
                                •
                              </Box>
                              <Box component="span" sx={{ fontWeight: 500 }}>
                                압축: {filesize(fileWithMetadata.optimized.size, { standard: 'jedec' })}
                              </Box>
                              <Box component="span" sx={{ ml: 0.5, opacity: 0.7 }}>
                                ({Math.round(((file.size - fileWithMetadata.optimized.size) / file.size) * 100)}% 절감)
                              </Box>
                            </>
                          )}
                        </Typography>

                        {fileWithMetadata.status === 'processing' && (
                          <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
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
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        className="delete-button"
                        onClick={() => handleOpenModal(fileWithMetadata)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 48,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                          },
                        }}
                      >
                        <OpenInFullIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  </motion.div>
                </ImageListItem>
              );
            })}
          </AnimatePresence>
        </ImageList>
      </Box>

      {/* 파일 메타데이터 모달 */}
      <FileMetadataModal file={selectedFile} open={!!selectedFile} onClose={handleCloseModal} />
    </Box>
  );
}
