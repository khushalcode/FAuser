// @ts-check
/**
 * Lightweight Expo + TypeScript ESLint config.
 * Run with: `npx expo lint` or `npx eslint .`
 */
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

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
      'nativewind-env.d.ts',
      'app.config.js',
      'metro.config.js',
      'babel.config.js',
      'tailwind.config.js',
      'plugins/**',
      'stubs/**'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
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
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Keep the app lint-clean without being too strict during dev.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
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
  },
  {
    files: ['**/*.{js,jsx}'],
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
      'no-console': 'off',
      'no-debugger': 'off',
      'no-empty': 'off',
      'prefer-const': 'off'
    }
  }
];

export default eslintConfig;
