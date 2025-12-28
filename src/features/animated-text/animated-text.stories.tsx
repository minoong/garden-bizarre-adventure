import type { Meta, StoryObj } from '@storybook/react-vite';

import { AnimatedText } from './ui';

const meta: Meta<typeof AnimatedText> = {
  title: 'Features/AnimatedText',
  component: AnimatedText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: { type: 'number', min: 100, max: 800, step: 50 },
      description: '한 줄의 최대 너비 (픽셀)',
    },
    fontSize: {
      control: { type: 'number', min: 12, max: 72, step: 2 },
      description: '글자 크기 (픽셀)',
    },
    underlineHeight: {
      control: { type: 'number', min: 2, max: 10, step: 1 },
      description: '밑줄 두께 (픽셀)',
    },
    underlineColor: {
      control: 'color',
      description: '밑줄 색상',
    },
    textColor: {
      control: 'color',
      description: '텍스트 색상',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxWidth: 400,
    fontSize: 24,
    underlineHeight: 4,
    underlineColor: '#000000',
    textColor: '#000000',
  },
};

export const LargeText: Story = {
  args: {
    maxWidth: 600,
    fontSize: 36,
    underlineHeight: 6,
    underlineColor: '#000000',
    textColor: '#000000',
  },
};

export const Colored: Story = {
  args: {
    maxWidth: 400,
    fontSize: 24,
    underlineHeight: 4,
    underlineColor: '#3b82f6',
    textColor: '#1e40af',
  },
};

export const SmallText: Story = {
  args: {
    maxWidth: 300,
    fontSize: 18,
    underlineHeight: 3,
    underlineColor: '#000000',
    textColor: '#000000',
  },
};

export const WideContainer: Story = {
  args: {
    maxWidth: 800,
    fontSize: 28,
    underlineHeight: 5,
    underlineColor: '#ef4444',
    textColor: '#dc2626',
  },
  render: (args) => (
    <div className="w-[900px]">
      <AnimatedText {...args} />
    </div>
  ),
};

export const LongText: Story = {
  args: {
    maxWidth: 400,
    fontSize: 24,
    underlineHeight: 4,
    underlineColor: '#10b981',
    textColor: '#059669',
  },
  render: (args) => (
    <div>
      <AnimatedText {...args} />
      <p className="mt-4 text-sm text-gray-500">
        긴 텍스트를 입력하면 자동으로 줄바꿈됩니다. 각 글자는 -45도에서 45도 사이의 랜덤한 각도로 회전하고, 0.8배에서 1.2배 사이의 크기로 스케일됩니다.
      </p>
    </div>
  ),
};
