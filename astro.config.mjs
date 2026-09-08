// @ts-check
import { defineConfig } from 'astro/config';
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
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],

  vite: {
    // Tailwind v4 is a Vite plugin; there is no tailwind.config.js by design.
    plugins: [tailwindcss()],
  },
});
