import { locales, localizePath, type Locale } from '@/lib/i18n';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/**
 * Absolute URL for a route in a given locale. Canonical and alternate links must
 * be absolute, and building them in one place keeps trailing slashes consistent.
 */
export function buildCanonicalUrl(siteUrl: string, route: string, locale: Locale): string {
  return new URL(localizePath(route, locale), siteUrl).href;
}

/**
 * Reciprocal `hreflang` links plus `x-default`.
 *
 * Search engines discard alternate sets that do not point back at each other, so
 * these are generated from one list rather than hand-maintained per page.
 */
export function buildAlternateLinks(siteUrl: string, route: string): AlternateLink[] {
  const alternates = locales.map((locale) => ({
    hreflang: locale,
    href: buildCanonicalUrl(siteUrl, route, locale),
  }));

  return [...alternates, { hreflang: 'x-default', href: buildCanonicalUrl(siteUrl, route, 'en') }];
}
