import baseConfig from '@crystaltides/eslint-config/base';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'reports/**',
      '.turbo/**',
      'data/**',
      'scripts/kubejs/**',
      '**/*.cjs',
    ],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Reglas adaptadas al backend Express/Node
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/content-length': 'warn',
      'sonarjs/no-clear-text-protocols': 'warn',
      'sonarjs/concise-regex': 'warn',
      'sonarjs/duplicates-in-character-class': 'warn',
      'sonarjs/super-linear-regex': 'warn',
      'sonarjs/no-dead-store': 'warn',
      'sonarjs/no-redundant-assignments': 'warn',
    },
  },
  {
    files: ['__tests__/**/*.{ts,js}', '**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
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
      'security/detect-non-literal-regexp': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['scripts/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-regexp': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
];
