import baseConfig from '@crystaltides/eslint-config/base';

export default [...baseConfig, {
  ignores: ['**/dist/**', '**/node_modules/**', '**/src-tauri/target/**', '**/build/**', 'crystaltides.tar.gz'],
}];
