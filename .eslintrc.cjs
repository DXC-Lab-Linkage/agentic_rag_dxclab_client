/* eslint-env node */
import 'eslint-define-config/register'
import '@rushstack/eslint-patch/modern-module-resolution'

export default {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  overrides: [
    {
      files: ['**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}'],
      extends: []
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
}
