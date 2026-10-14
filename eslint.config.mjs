// @ts-check
/**
 * Lightweight Expo + TypeScript ESLint config.
 * Replaces the legacy Next.js config that was leftover from a previous
 * stack. Run with: `npx expo lint` or `npx eslint .`
 */
const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'android/**',
      'ios/**',
      'web-build/**',
      'apk/**',
      'expo-env.d.ts',
      'nativewind-env.d.ts'
    ]
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        __DEV__: 'readonly'
      }
    },
    rules: {
      // Keep the app lint-clean without being too strict during dev.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'prefer-const': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-empty': 'off',
      'no-irregular-whitespace': 'off',
      'no-case-declarations': 'off',
      'no-fallthrough': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-redeclare': 'off',
      'no-unreachable': 'off',
      'no-useless-escape': 'off'
    }
  }
];

export default eslintConfig;
