// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Site is fully static: content does not vary per request, so there is nothing
 * for a server to compute at request time. The contact endpoint added in a later
 * phase is the single on-demand route.
 */
export default defineConfig({
  site: 'https://viludev.com',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    // English serves from `/`, Spanish from `/es/`.
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      // The style guide is marked noindex, so it should not be advertised.
      filter: (page) => !page.includes('/styleguide'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],

  /**
   * Fonts are downloaded, subset and self-hosted at build time by Astro, with
   * preload links emitted automatically. This removes the render-blocking
   * third-party request a font CDN would add, and stops visitors' IP addresses
   * being handed to another party on every page view — the performance goal and
   * the privacy goal happen to have the same solution.
   *
   * Two families only. The monospace role uses the system stack, which costs
   * nothing to download.
   */
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-family-display',
      weights: ['400 800'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-family-body',
      weights: ['400 700'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],

  vite: {
    // Tailwind v4 is a Vite plugin; there is no tailwind.config.js by design.
    plugins: [tailwindcss()],
  },
});
