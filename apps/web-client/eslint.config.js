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
      // Reglas adaptadas al frontend React 19 SPA
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/content-length': 'warn',
      'sonarjs/void-use': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/super-linear-regex': 'warn',
      'sonarjs/no-hardcoded-ip': 'warn',
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/concise-regex': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',
      'sonarjs/no-redundant-assignments': 'warn',
      'sonarjs/no-all-duplicated-branches': 'warn',
      'sonarjs/no-globals-shadowing': 'warn',
      'better-tailwindcss/no-unknown-classes': 'off',
      'better-tailwindcss/no-concatenated-classes': 'warn',
      'react-doctor/no-unguarded-browser-global-in-render-or-hook-init': 'off', // SPA pura Vite (sin SSR)
      'react-doctor/effect-needs-cleanup': 'warn',
      'react-doctor/no-impure-state-updater': 'warn',
      'react-doctor/no-layout-property-animation': 'warn',
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
      'sonarjs/parameterized-tests': 'off',
      'sonarjs/prefer-specific-assertions': 'off',
      'sonarjs/assertions-in-tests': 'off',
      'sonarjs/no-duplicate-test-title': 'warn',
      'sonarjs/no-trivial-assertions': 'warn',
      'sonarjs/super-linear-regex': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'better-tailwindcss/enforce-canonical-classes': 'off',
    },
  },
];
