import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs', '@storybook/addon-onboarding', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  env: (config) => ({
    ...config,
    NEXT_PUBLIC_KAKAO_APP_KEY: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '',
    NEXT_PUBLIC_BITHUMB_REST_API_URL: process.env.NEXT_PUBLIC_BITHUMB_REST_API_URL || 'https://api.bithumb.com',
    NEXT_PUBLIC_BITHUMB_WEBSOCKET_API_URL: `${process.env.NEXT_PUBLIC_BITHUMB_WEBSOCKET_API_URL}/websocket/v1` || 'wss://ws-api.bithumb.com/websocket/v1',
  }),
  previewHead: (head) => `
    ${head}
    <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false" async></script>
  `,
};
export default config;
