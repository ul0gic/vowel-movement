import eslint from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  // Custom rules for the project
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      perfectionist,
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Relax some strict rules for game development
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // Perfectionist - import sorting
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'unknown',
          ],
          internalPattern: ['^@/.*', '^@game/.*', '^@design/.*'],
        },
      ],
      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
      'perfectionist/sort-named-exports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
    },
  },

  // Prettier compatibility (disables conflicting rules)
  prettier
)
