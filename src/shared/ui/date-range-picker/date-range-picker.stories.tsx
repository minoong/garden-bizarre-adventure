import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DateRangePicker } from './ui/date-range-picker';
import type { DateRange } from './types';

const meta = {
  title: 'Shared/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '날짜 범위 선택 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: '날짜 범위 값 (controlled)',
      control: false,
    },
    onChange: {
      description: '날짜 범위 변경 콜백',
      action: 'onChange',
    },
    fromLabel: {
      description: '시작일 레이블',
      control: 'text',
    },
    toLabel: {
      description: '종료일 레이블',
      control: 'text',
    },
    modalTitle: {
      description: '모달 제목',
      control: 'text',
    },
    dateFormat: {
      description: '날짜 표시 형식 (dayjs format)',
      control: 'text',
    },
    minDate: {
      description: '최소 선택 가능 날짜',
      control: false,
    },
    maxDate: {
      description: '최대 선택 가능 날짜',
      control: false,
    },
    disabled: {
      description: '비활성화 여부',
      control: 'boolean',
    },
    required: {
      description: '필수 입력 여부',
      control: 'boolean',
    },
    error: {
      description: '에러 메시지',
      control: 'text',
    },
    helperText: {
      description: '도움말 텍스트',
      control: 'text',
    },
    fullWidth: {
      description: 'Input 전체 너비 사용',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDateRangePicker(args: typeof DateRangePicker.arguments) {
  const [value, setValue] = useState<DateRange>({
    from: args.value?.from || dayjs(),
    to: args.value?.to || dayjs().add(7, 'day'),
  });

  return (
    <Box sx={{ minWidth: 600 }}>
      <DateRangePicker {...args} value={value} onChange={setValue} />

      <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          선택된 값:
        </Typography>
        <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(
            {
              from: value.from?.format('YYYY-MM-DD'),
              to: value.to?.format('YYYY-MM-DD'),
            },
            null,
            2,
          )}
        </Typography>
      </Paper>
    </Box>
  );
}

export const Default: Story = {
  render: (args) => <ControlledDateRangePicker {...args} />,
  args: {},
};
