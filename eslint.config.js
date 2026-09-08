import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

/**
 * Architectural boundaries, enforced rather than documented.
 *
 * The dependency direction is:
 *   pages -> features -> components -> lib/types
 *                    \-> content/data
 *
 * The rule that actually keeps coupling low is "a feature never imports another
 * feature". Everything shared moves up to components/ or lib/. Encoding it here
 * means violating it fails CI instead of surviving review.
 */
const boundaryRules = [
  {
    files: ['src/features/**/*.{ts,tsx,astro}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '../../features/*', '../features/*'],
              message:
                'A feature must not import another feature. Move the shared code up to components/ (UI) or lib/ (logic).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'astro:*', '@/features/*', '@/components/*'],
              message:
                'lib/ must stay pure and framework-agnostic so it is trivially testable. Framework-aware code belongs in a component, a hook or a feature.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx,astro}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/content/*'],
              message:
                'components/ must not know about the portfolio domain. If it needs domain data, it is a feature component.',
            },
          ],
        },
      ],
    },
  },
];

export default defineConfig([
  globalIgnores([
    'dist/**',
    '.astro/**',
    'node_modules/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'pnpm-lock.yaml',
  ]),

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // `any` defeats the point of the strict config; make it non-negotiable.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },

  ...boundaryRules,

  // Config files are plain scripts; type-aware linting adds nothing there.
  {
    files: ['*.config.{js,mjs,ts}', 'tests/**/*.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
]);
