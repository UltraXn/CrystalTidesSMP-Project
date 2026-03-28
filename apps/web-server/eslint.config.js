import baseConfig from '../../packages/eslint-config/base.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist', 'node_modules', 'backup_holy.js'],
  },
];
