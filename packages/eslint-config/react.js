import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import security from 'eslint-plugin-security';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import reactDoctor from 'eslint-plugin-react-doctor';
import tailwind from 'eslint-plugin-better-tailwindcss';
import regexp from 'eslint-plugin-regexp';
import vitest from 'eslint-plugin-vitest';
import testingLibrary from 'eslint-plugin-testing-library';
import { fixupPluginRules } from '@eslint/compat';
import oxlint from 'eslint-plugin-oxlint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/storybook-static/**',
      '**/.stryker-tmp/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/reports/**',
      '**/*.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  security.configs.recommended,
  importXFlatConfigs.recommended,
  reactDoctor.configs.recommended,
  tailwind.configs.recommended,
  regexp.configs['flat/recommended'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/main.css',
      },
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': 'off', // Delegado a prettier-plugin-tailwindcss
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off', // Delegado a Prettier
      'better-tailwindcss/no-unknown-classes': 'off', // Permitir utilidades dinamicas y tokens @theme
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': fixupPluginRules(reactHooks),
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // 🔍 SonarQube / SonarLint (Complejidad Cognitiva <= 15 segun AGENTS.md)
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-nested-template-literals': 'off',
      'sonarjs/prefer-immediate-return': 'warn',

      // 🛡️ Security
      'security/detect-object-injection': 'off',

      // 📦 Imports (delegado a compilador TypeScript)
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off',

      // 🩺 React Doctor
      'react-doctor/react-router-v8-no-react-router-dom-import': 'warn',

      // Gradual migration: these React Compiler rules are valuable but the
      // codebase has widespread existing patterns. Keep them off while they
      // are refactored.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    plugins: {
      vitest,
      'testing-library': testingLibrary,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      ...testingLibrary.configs['flat/react'].rules,
      'vitest/expect-expect': 'warn',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
    },
  },
  ...oxlint.configs['flat/recommended'],
];
