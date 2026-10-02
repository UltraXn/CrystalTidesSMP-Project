import reactConfig from '@crystaltides/eslint-config/react';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'dist/**',
      '.next/**',
      'node_modules/**',
      'storybook-static/**',
      '.stryker-tmp/**',
      '.turbo/**',
      'coverage/**',
      'reports/**',
      'scripts/**',
      'cypress/**',
      'e2e/**',
      'playwright-report/**',
      'public/**',
      '*.cjs',
    ],
  },
  ...reactConfig,
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Reglas adaptadas al frontend React 19
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/content-length': 'warn',
      'better-tailwindcss/no-unknown-classes': 'off',
    },
  },
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/no-clear-text-protocols': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'better-tailwindcss/enforce-canonical-classes': 'off',
    },
  },
];
