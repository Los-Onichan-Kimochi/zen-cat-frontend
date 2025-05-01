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
    },
  },
  prettierConfig,
  {
    rules: {
      'max-len': ['warn', { code: 80 }],
      // Deshabilita las reglas innecesarias de importación de React
      'react/react-in-jsx-scope': 'off',
      // Asegura que se utilicen puntos y comas
      semi: ['error', 'always'],
      // Desactiva la regla que requiere un salto de línea antes de return
      'newline-before-return': 'off',
      // Limita las líneas vacías
      'no-multiple-empty-lines': ['error', { max: 1 }],
      // No permite múltiples declaraciones de variables en una sola línea
      'one-var': ['error', 'never'],
      // Establece el indentado a 4 espacios
      indent: ['error', 2],
      // Requiere llaves en todas las estructuras de control multilínea
      curly: ['error', 'multi-line'],
      // Desactiva anotaciones de tipos triviales
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreParameters: true },
      ],
      // Prohíbe el uso de == y !=, excepto para comparar con null
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // Requiere el uso de comillas simples
      quotes: ['error', 'single'],
      // Asegura que haya espacios alrededor de los operadores
      'space-infix-ops': 'error',
      // Prohíbe el uso de paréntesis en constructores sin argumentos
      'new-cap': ['error', { capIsNew: true }],
    },
  },
);
