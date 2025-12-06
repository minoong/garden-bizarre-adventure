'use client';

import { useRef, useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { Box, IconButton, InputBase, Typography } from '@mui/material';

import { FilePreview } from '@/features/comment/ui/file-preview';

interface CommentInputProps {
  postId?: string;
  parentCommentId?: string | null;
  onSubmit?: (content: string, files: File[]) => void;
}

export function CommentInput({ postId: _postId, parentCommentId: _parentCommentId, onSubmit }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleFileRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && files.length === 0) return;

    if (onSubmit) {
      onSubmit(content, files);
    }

    // 전송 후 초기화
    setContent('');
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ bgcolor: '#111', p: 2, position: 'relative' }}>
      {files.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            overflowX: 'auto',
            pb: 1,
          }}
        >
          {files.map((file, index) => (
            <Box key={index} sx={{ position: 'relative', flexShrink: 0 }}>
              <FilePreview file={file} width={80} height={80} />
              <IconButton
                size="small"
                onClick={() => handleFileRemove(index)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                  },
                  padding: '4px',
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          px: 2,
          py: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.gif" style={{ display: 'none' }} onChange={handleFileSelect} />
        <IconButton
          size="small"
          onClick={() => fileInputRef.current?.click()}
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              color: 'white',
            },
          }}
        >
          <AttachFileIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <InputBase
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글 달기..."
          sx={{
            color: 'white',
            fontSize: '14px',
            '& ::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
          multiline
          maxRows={4}
        />

        <IconButton
          size="small"
          onClick={handleSubmit}
          disabled={!content.trim() && files.length === 0}
          sx={{
            color: content.trim() || files.length > 0 ? '#0095f6' : 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              bgcolor: 'transparent',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {files.length === 0 && (
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.4)',
            mt: 1,
            display: 'block',
          }}
        >
          이미지, GIF, 동영상을 첨부할 수 있습니다.
        </Typography>
      )}
    </Box>
  );
}
