import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tab } from './ui';

const meta: Meta<typeof Tab.Root> = {
  title: 'Features/Tabs',
  component: Tab.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: '기본 선택될 탭 값',
    },
    value: {
      control: 'text',
      description: '제어된 모드에서의 현재 탭 값',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <Tab.Root defaultValue="tab1">
        <Tab.List aria-label="메인 탭" className="flex rounded-t-lg border-b border-gray-200 bg-gray-50">
          <Tab.Trigger
            value="tab1"
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600"
          >
            탭 1
          </Tab.Trigger>
          <Tab.Trigger
            value="tab2"
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600"
          >
            탭 2
          </Tab.Trigger>
          <Tab.Trigger
            value="tab3"
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600"
          >
            탭 3
          </Tab.Trigger>
        </Tab.List>
        <Tab.Panel value="tab1" className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold">첫 번째 탭 콘텐츠</h3>
          <p className="text-gray-600">이것은 첫 번째 탭의 콘텐츠입니다. 여기에 다양한 내용을 넣을 수 있습니다.</p>
        </Tab.Panel>
        <Tab.Panel value="tab2" className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold">두 번째 탭 콘텐츠</h3>
          <p className="text-gray-600">이것은 두 번째 탭의 콘텐츠입니다. 키보드 화살표 키로 탭 간 이동이 가능합니다.</p>
        </Tab.Panel>
        <Tab.Panel value="tab3" className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold">세 번째 탭 콘텐츠</h3>
          <p className="text-gray-600">이것은 세 번째 탭의 콘텐츠입니다. 각 탭은 접근성을 위한 ARIA 속성들을 가지고 있습니다.</p>
        </Tab.Panel>
      </Tab.Root>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('settings');

    return (
      <div className="w-96">
        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">외부에서 탭 제어:</p>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('profile')} className="rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200">
              프로필로 이동
            </button>
            <button onClick={() => setActiveTab('settings')} className="rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200">
              설정으로 이동
            </button>
          </div>
        </div>

        <Tab.Root value={activeTab} onValueChange={setActiveTab}>
          <Tab.List aria-label="계정 설정" className="flex rounded-lg bg-gray-100 p-1">
            <Tab.Trigger
              value="profile"
              className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              프로필
            </Tab.Trigger>
            <Tab.Trigger
              value="settings"
              className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              설정
            </Tab.Trigger>
            <Tab.Trigger
              value="billing"
              className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              결제
            </Tab.Trigger>
          </Tab.List>

          <Tab.Panel value="profile" className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="홍길동" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="hong@example.com" />
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel value="settings" className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">알림 받기</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">다크 모드</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel value="billing" className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="py-8 text-center">
              <p className="text-gray-600">결제 정보가 없습니다.</p>
              <button className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">결제 방법 추가</button>
            </div>
          </Tab.Panel>
        </Tab.Root>
      </div>
    );
  },
};

export const WithDisabledTab: Story = {
  render: () => (
    <div className="w-96">
      <Tab.Root defaultValue="available1">
        <Tab.List aria-label="기능 탭" className="flex border-b border-gray-200">
          <Tab.Trigger
            value="available1"
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            사용 가능
          </Tab.Trigger>
          <Tab.Trigger value="disabled" disabled className="cursor-not-allowed px-4 py-2 text-sm font-medium text-gray-400 data-[disabled]:opacity-50">
            비활성화됨
          </Tab.Trigger>
          <Tab.Trigger
            value="available2"
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            다른 탭
          </Tab.Trigger>
        </Tab.List>

        <Tab.Panel value="available1" className="p-4">
          <p>첫 번째 사용 가능한 탭의 콘텐츠입니다.</p>
        </Tab.Panel>

        <Tab.Panel value="disabled" className="p-4">
          <p>이 콘텐츠는 탭이 비활성화되어 있어 보이지 않습니다.</p>
        </Tab.Panel>

        <Tab.Panel value="available2" className="p-4">
          <p>두 번째 사용 가능한 탭의 콘텐츠입니다.</p>
        </Tab.Panel>
      </Tab.Root>
    </div>
  ),
};

export const VerticalTabs: Story = {
  render: () => (
    <div className="flex h-64 w-96">
      <Tab.Root defaultValue="overview">
        <Tab.List aria-label="세로 탭" className="flex w-32 flex-col border-r border-gray-200 pr-2">
          <Tab.Trigger
            value="overview"
            className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            개요
          </Tab.Trigger>
          <Tab.Trigger
            value="analytics"
            className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            분석
          </Tab.Trigger>
          <Tab.Trigger
            value="reports"
            className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            리포트
          </Tab.Trigger>
          <Tab.Trigger
            value="team"
            className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            팀
          </Tab.Trigger>
        </Tab.List>

        <div className="flex-1 pl-4">
          <Tab.Panel value="overview" className="h-full">
            <h3 className="mb-2 font-semibold">프로젝트 개요</h3>
            <p className="text-sm text-gray-600">프로젝트의 전반적인 상태와 주요 지표를 확인할 수 있습니다.</p>
          </Tab.Panel>

          <Tab.Panel value="analytics" className="h-full">
            <h3 className="mb-2 font-semibold">분석 데이터</h3>
            <p className="text-sm text-gray-600">사용자 행동 분석과 성능 지표를 확인할 수 있습니다.</p>
          </Tab.Panel>

          <Tab.Panel value="reports" className="h-full">
            <h3 className="mb-2 font-semibold">리포트</h3>
            <p className="text-sm text-gray-600">월간, 주간 리포트와 커스텀 리포트를 생성할 수 있습니다.</p>
          </Tab.Panel>

          <Tab.Panel value="team" className="h-full">
            <h3 className="mb-2 font-semibold">팀 관리</h3>
            <p className="text-sm text-gray-600">팀원 초대, 권한 관리, 협업 도구를 설정할 수 있습니다.</p>
          </Tab.Panel>
        </div>
      </Tab.Root>
    </div>
  ),
};

export const ForceMount: Story = {
  render: () => (
    <div className="w-96">
      <Tab.Root defaultValue="tab1">
        <Tab.List aria-label="강제 마운트 예시" className="flex border-b border-gray-200">
          <Tab.Trigger
            value="tab1"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            일반 탭
          </Tab.Trigger>
          <Tab.Trigger
            value="tab2"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            강제 마운트 탭
          </Tab.Trigger>
        </Tab.List>

        <Tab.Panel value="tab1" className="border border-t-0 border-gray-200 p-4">
          <p>이 탭은 선택될 때만 렌더링됩니다.</p>
          <p className="mt-2 text-sm text-gray-500">개발자 도구에서 DOM을 확인해보세요.</p>
        </Tab.Panel>

        <Tab.Panel value="tab2" forceMount className="border border-t-0 border-gray-200 p-4">
          <p>이 탭은 항상 DOM에 마운트되어 있습니다.</p>
          <p className="mt-2 text-sm text-gray-500">forceMount 속성으로 인해 선택되지 않아도 DOM에 존재합니다.</p>
          <input type="text" placeholder="상태가 유지됩니다" className="mt-2 rounded-md border border-gray-300 px-3 py-2" />
        </Tab.Panel>
      </Tab.Root>
    </div>
  ),
};
