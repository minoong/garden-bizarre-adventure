import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ShuffleLoading } from '@/shared/ui/loading/ui/shuffle-loading';

const meta: Meta<typeof ShuffleLoading> = {
  title: 'shared/loading/ShuffleLoading',
  component: ShuffleLoading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ShuffleLoading>;

export const Default: Story = {
  args: {
    size: 'medium',
  },
};
