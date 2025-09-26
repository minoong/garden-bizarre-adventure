import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Header } from './header';

const meta = {
  title: 'Widgets/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBlurEffect: Story = {
  parameters: {
    docs: {
      description: {
        story: '헤더에 blur 효과가 적용된 버전입니다.',
      },
    },
  },
};
