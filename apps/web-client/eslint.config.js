import reactConfig from '@crystaltides/eslint-config/react';

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
      '*.cjs',
    ],
  },
  ...reactConfig,
];
