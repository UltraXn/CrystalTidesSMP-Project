import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import oxlint from 'eslint-plugin-oxlint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
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
  security.configs.recommended,
  importXFlatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['log', 'error', 'warn', 'info', 'debug'] }],

      // 🔍 SonarQube / SonarLint (Complejidad Cognitiva <= 15 segun AGENTS.md)
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-nested-template-literals': 'off',
      'sonarjs/prefer-immediate-return': 'warn',

      // 🛡️ Security
      'security/detect-object-injection': 'off',

      // 📦 Imports (delegated to TypeScript compiler for .js extensions in ESM)
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off',
    },
  },
  ...oxlint.configs['flat/recommended'],
];
