import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true }],
      'react/react-in-jsx-scope': 'off',
      semi: ['warn', 'always'],
      'newline-before-return': 'off',
      'no-multiple-empty-lines': ['warn', { max: 2 }],
      'one-var': 'off',
      indent: 'off',
      curly: 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      quotes: ['warn', 'single', { allowTemplateLiterals: true }],
      'space-infix-ops': 'warn',
      'new-cap': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
