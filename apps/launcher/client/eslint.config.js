import reactConfig from '@crystaltides/eslint-config/react';

export default [...reactConfig, {
  ignores: ['dist', 'node_modules', 'src-tauri/target'],
}];
