import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { fixupPluginRules } from '@eslint/compat';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: {
        'react-hooks': fixupPluginRules(reactHooks),
        'react-refresh': reactRefresh,
      },
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
            ecmaFeatures: { jsx: true },
        }
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        // Gradual migration: these React Compiler rules are valuable but the
        // codebase has widespread existing patterns. Keep them off while they
        // are refactored.
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/immutability': 'off',
        'react-hooks/incompatible-library': 'off',
      },
  },
  {
    ignores: ['dist', '.next', 'node_modules'],
  }
];
