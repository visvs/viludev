// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Every page is prerendered: the content does not vary per request, so there is
 * nothing for a server to compute. The contact endpoint is the single route
 * that opts out, which is why an adapter is present at all.
 */
export default defineConfig({
  site: 'https://viludev.com',

  adapter: vercel(),

  /**
   * Astro computes the script and style hashes itself and emits the policy per
   * page. Hand-maintaining a hash list is not viable here: the inline theme
   * bootstrap and the island loader change on every build, so any hardcoded
   * policy would be stale the moment it shipped — and a stale CSP is either
   * broken or quietly permissive.
   *
   * The remaining directives are locked down because this site loads nothing
   * from anywhere else: fonts are self-hosted, there is no analytics script and
   * no third-party embed.
   */
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
      ],
    },
  },

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
   * Two families. Display and body share Poppins and differ by weight and
   * tracking, which is cheaper than a third download and keeps the page
   * typographically coherent.
   *
   * Poppins ships as discrete weights rather than a variable font, so the
   * weights are listed individually — a range would quietly collapse to one
   * face and every heading would render at the wrong weight.
   */
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Poppins',
      cssVariable: '--font-family-body',
      weights: ['400', '600', '700'],
      // Without this, Astro also downloads — and preloads — the italics, which
      // this design never uses.
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-family-mono',
      weights: ['400'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
  ],

  vite: {
    // Tailwind v4 is a Vite plugin; there is no tailwind.config.js by design.
    plugins: [tailwindcss()],
  },
});
