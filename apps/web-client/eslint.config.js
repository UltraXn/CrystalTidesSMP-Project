// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import reactConfig from '@crystaltides/eslint-config/react';

export default [...reactConfig, {
  ignores: ['dist', 'node_modules', '*.cjs'],
}, ...storybook.configs["flat/recommended"]];
