import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';

import { Dropzone } from './ui';
import { useDropzone } from './hooks/use-dropzone';

const meta: Meta = {
  title: 'Shared/Dropzone',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function DropzoneExample() {
  const dropzoneState = useDropzone({
    onFilesAccepted: (files) => {
      console.log('Accepted files:', files);
    },
    onFilesRejected: (rejections) => {
      console.log('Rejected files:', rejections);
    },
  });

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Dropzone {...dropzoneState}>
        <Dropzone.Area />
        <Dropzone.Preview />
      </Dropzone>
    </Box>
  );
}

export const Default: Story = {
  render: () => <DropzoneExample />,
};

function DropzoneWithCustomHeight() {
  const dropzoneState = useDropzone();

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Dropzone {...dropzoneState}>
        <Dropzone.Area minHeight={300} />
        <Dropzone.Preview />
      </Dropzone>
    </Box>
  );
}

export const CustomHeight: Story = {
  render: () => <DropzoneWithCustomHeight />,
};

function DropzoneSingleFile() {
  const dropzoneState = useDropzone({
    maxFiles: 1,
    onFilesAccepted: (files) => {
      console.log('Single file accepted:', files[0]);
    },
  });

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Dropzone {...dropzoneState}>
        <Dropzone.Area />
        <Dropzone.Preview />
      </Dropzone>
    </Box>
  );
}

export const SingleFile: Story = {
  render: () => <DropzoneSingleFile />,
};

function DropzoneImagesOnly() {
  const dropzoneState = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
  });

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Dropzone {...dropzoneState}>
        <Dropzone.Area />
        <Dropzone.Preview />
      </Dropzone>
    </Box>
  );
}

export const ImagesOnly: Story = {
  render: () => <DropzoneImagesOnly />,
};

function DropzoneVideosOnly() {
  const dropzoneState = useDropzone({
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  });

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Dropzone {...dropzoneState}>
        <Dropzone.Area />
        <Dropzone.Preview />
      </Dropzone>
    </Box>
  );
}

export const VideosOnly: Story = {
  render: () => <DropzoneVideosOnly />,
};

function DropzoneSmallSize() {
  const dropzoneState = useDropzone({
    maxSize: 1024 * 1024, // 1MB
    onFilesRejected: (rejections) => {
      alert('파일 크기는 1MB 이하여야 합니다.');
      console.log('Rejected:', rejections);
    },
  });

  return (
    <Box sx={{ width: 600, p: 2 }}>
      <Dropzone {...dropzoneState}>
        <Dropzone.Area />
        <Dropzone.Preview />
      </Dropzone>
    </Box>
  );
}

export const MaxSize1MB: Story = {
  render: () => <DropzoneSmallSize />,
};
