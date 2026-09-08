/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
import { playwright } from '@vitest/browser-playwright';

/**
 * Two projects, split by what they actually need:
 *
 *  - `unit`    runs in Node. Pure logic from lib/ and features/*\/lib/. Fast, and
 *              where the coverage thresholds apply.
 *  - `browser` runs in real Chromium. React islands and .astro components.
 *
 * Browser mode rather than jsdom because the tests that matter here are
 * accessibility tests — focus order, aria-live announcements, error association.
 * jsdom approximates those APIs and produces both false passes and false
 * failures, which would be incoherent in a project whose stated target is a
 * perfect accessibility score. Cost: a slower CI job and Playwright as a dev
 * dependency.
 *
 * `getViteConfig` makes Vitest inherit Astro's Vite config, so path aliases and
 * the Tailwind plugin work in tests without being redeclared.
 */
export default getViteConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.test.tsx', 'tests/browser/**/*.test.tsx'],
          setupFiles: ['tests/setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Thresholds are applied where logic lives. Presentational markup is
      // deliberately excluded: asserting that a div has a class breaks on every
      // redesign and catches nothing.
      include: ['src/lib/**/*.ts', 'src/features/**/lib/**/*.ts'],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});
