// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

const importOrderRule = importPlugin.rules.order;

const compatibleImportPlugin = {
  ...importPlugin,
  rules: {
    ...importPlugin.rules,
    order: {
      ...importOrderRule,
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const sourceCodeWithCompat = new Proxy(sourceCode, {
          get(target, property, receiver) {
            if (property === 'getTokenOrCommentAfter') {
              return (nodeOrToken, options) =>
                target.getTokenAfter(nodeOrToken, {
                  ...options,
                  includeComments: true,
                });
            }

            return Reflect.get(target, property, receiver);
          },
        });
        const contextWithCompat = new Proxy(context, {
          get(target, property, receiver) {
            if (property === 'sourceCode') {
              return sourceCodeWithCompat;
            }

            if (property === 'getSourceCode') {
              return () => sourceCodeWithCompat;
            }

            return Reflect.get(target, property, receiver);
          },
        });

        return importOrderRule.create(contextWithCompat);
      },
    },
  },
};

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'storybook-static/**', '.claude/**', '.agent/**', '.agents/**'],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': typescriptPlugin,
      import: compatibleImportPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: '19.2',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'prettier/prettier': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'import/no-unresolved': ['error', { ignore: ['^@/', '^/.*'] }],
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  prettierConfig,
  ...storybook.configs['flat/recommended'],
];

export default eslintConfig;
