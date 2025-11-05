'use client';

import Image from 'next/image';
import { Box, IconButton, Typography, Modal, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { filesize } from 'filesize';
import dayjs from 'dayjs';

import { getCameraBrand, BRAND_LOGOS } from '@/shared/lib/camera';
import type { FileWithMetadata } from '@/shared/ui/dropzone';

interface FileMetadataModalProps {
  file: FileWithMetadata | null;
  open: boolean;
  onClose: () => void;
}

export function FileMetadataModal({ file, open, onClose }: FileMetadataModalProps) {
  if (!file) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
          maxWidth: 1200,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 닫기 버튼 */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'grey.200',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* 이미지 영역 (고정) */}
        <Box
          sx={{
            flexShrink: 0,
            maxHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.900',
            overflow: 'hidden',
          }}
        >
          {file.preview ? (
            file.file.type.startsWith('image/') ? (
              <Box
                component="img"
                src={file.preview}
                alt={file.file.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <video src={file.preview} controls style={{ maxWidth: '100%', maxHeight: '60vh' }} />
            )
          ) : (
            <InsertDriveFileIcon sx={{ fontSize: 120, color: 'grey.400' }} />
          )}
        </Box>

        {/* 메타데이터 영역 (스크롤 가능) */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
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
          {/* 카메라 브랜드 로고 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            {(() => {
              const brand = getCameraBrand(file.metadata?.make);
              const logoSrc = brand ? BRAND_LOGOS[brand] : null;

              if (logoSrc) {
                return (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 40,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image src={logoSrc} alt={brand || 'camera'} fill style={{ objectFit: 'contain', padding: '4px' }} priority />
                  </Box>
                );
              }
              return (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HelpOutlineIcon sx={{ color: 'grey.500' }} />
                </Box>
              );
            })()}
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              파일 정보
            </Typography>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          {/* 파일명 - 전체 너비 */}
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
              파일명
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {file.file.name}
            </Typography>
          </Box>

          {/* 2열 레이아웃 */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* 파일 크기 */}
            <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                파일 크기
              </Typography>
              <Typography variant="body2">
                원본: {filesize(file.file.size, { standard: 'jedec' })}
                {file.optimized && (
                  <>
                    <br />
                    압축: {filesize(file.optimized.size, { standard: 'jedec' })}
                    {' ('}
                    {Math.round(((file.file.size - file.optimized.size) / file.file.size) * 100)}% 절감)
                  </>
                )}
              </Typography>
            </Box>

            {/* 파일 타입 */}
            <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                파일 타입
              </Typography>
              <Typography variant="body2">{file.file.type || '알 수 없음'}</Typography>
            </Box>
          </Box>

          {file.metadata && (
            <>
              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                카메라 정보
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {/* 카메라 제조사 및 모델 */}
                {(() => {
                  const make = file.metadata.make;
                  const model = file.metadata.model;
                  const hasCameraInfo = (typeof make === 'string' && make) || (typeof model === 'string' && model);
                  if (!hasCameraInfo) return null;
                  return (
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                        카메라
                      </Typography>
                      <Typography variant="body2">
                        {typeof make === 'string' ? make : ''} {typeof model === 'string' ? model : ''}
                      </Typography>
                    </Box>
                  );
                })()}

                {/* 렌즈 */}
                {(() => {
                  const lensModel = file.metadata.lensModel;
                  if (typeof lensModel !== 'string' || !lensModel) return null;
                  return (
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                        렌즈
                      </Typography>
                      <Typography variant="body2">{lensModel}</Typography>
                    </Box>
                  );
                })()}

                {/* 촬영 일시 */}
                {(() => {
                  const dateTaken = file.metadata.dateTaken;
                  if (!(dateTaken instanceof Date)) return null;
                  return (
                    <Box sx={{ flex: '1 1 100%', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                        촬영 일시
                      </Typography>
                      <Typography variant="body2">{dayjs(dateTaken).format('YYYY년 MM월 DD일 HH:mm:ss')}</Typography>
                    </Box>
                  );
                })()}
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                촬영 설정
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {/* ISO */}
                {file.metadata.iso && (
                  <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                      ISO
                    </Typography>
                    <Typography variant="body2">ISO {file.metadata.iso}</Typography>
                  </Box>
                )}

                {/* 조리개 */}
                {file.metadata.fNumber && (
                  <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                      조리개
                    </Typography>
                    <Typography variant="body2">F/{file.metadata.fNumber}</Typography>
                  </Box>
                )}

                {/* 셔터 스피드 */}
                {file.metadata.exposureTime && (
                  <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                      셔터 스피드
                    </Typography>
                    <Typography variant="body2">1/{Math.round(1 / file.metadata.exposureTime)}초</Typography>
                  </Box>
                )}

                {/* 초점 거리 */}
                {file.metadata.focalLength && (
                  <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                      초점 거리
                    </Typography>
                    <Typography variant="body2">{file.metadata.focalLength}mm</Typography>
                  </Box>
                )}

                {/* 노출 보정 */}
                {file.metadata.exposureCompensation !== undefined &&
                  file.metadata.exposureCompensation !== null &&
                  typeof file.metadata.exposureCompensation === 'number' && (
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                        노출 보정
                      </Typography>
                      <Typography variant="body2">
                        {file.metadata.exposureCompensation > 0 ? '+' : ''}
                        {file.metadata.exposureCompensation} EV
                      </Typography>
                    </Box>
                  )}

                {/* 화이트 밸런스 */}
                {file.metadata.whiteBalance && (
                  <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                      화이트 밸런스
                    </Typography>
                    <Typography variant="body2">{file.metadata.whiteBalance}</Typography>
                  </Box>
                )}

                {/* 이미지 크기 */}
                {(file.metadata.width || file.metadata.height) && (
                  <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                      이미지 크기
                    </Typography>
                    <Typography variant="body2">
                      {file.metadata.width} × {file.metadata.height}px
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* 위치 정보 */}
              {(file.metadata.latitude || file.metadata.longitude) && (
                <>
                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                    위치 정보
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                        위도
                      </Typography>
                      <Typography variant="body2">{file.metadata.latitude?.toFixed(6)}</Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontWeight: 600 }}>
                        경도
                      </Typography>
                      <Typography variant="body2">{file.metadata.longitude?.toFixed(6)}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
