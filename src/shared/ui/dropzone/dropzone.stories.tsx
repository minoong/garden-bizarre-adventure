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
