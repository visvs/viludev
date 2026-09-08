import { describe, expect, it } from 'vitest';
import { buildAlternateLinks, buildCanonicalUrl } from './buildMeta';
import { buildPersonSchema } from './personSchema';
import { site } from '@/data/site';

const SITE_URL = 'https://viludev.com';

describe('buildCanonicalUrl', () => {
  it('builds an absolute URL for the default locale', () => {
    expect(buildCanonicalUrl(SITE_URL, '/', 'en')).toBe('https://viludev.com/');
  });

  it('includes the locale prefix for non-default locales', () => {
    expect(buildCanonicalUrl(SITE_URL, '/', 'es')).toBe('https://viludev.com/es/');
  });

  it('does not stack an existing locale prefix', () => {
    expect(buildCanonicalUrl(SITE_URL, '/es/', 'es')).toBe('https://viludev.com/es/');
  });
});

describe('buildAlternateLinks', () => {
  const links = buildAlternateLinks(SITE_URL, '/');

  it('emits one link per locale plus x-default', () => {
    expect(links.map((link) => link.hreflang)).toEqual(['en', 'es', 'x-default']);
  });

  it('points x-default at the default locale', () => {
    const xDefault = links.find((link) => link.hreflang === 'x-default');
    const english = links.find((link) => link.hreflang === 'en');
    expect(xDefault?.href).toBe(english?.href);
  });

  it('emits absolute URLs, which hreflang requires', () => {
    for (const link of links) {
      expect(link.href.startsWith('https://')).toBe(true);
    }
  });

  it('is reciprocal: every locale sees the same alternate set', () => {
    const fromEnglish = buildAlternateLinks(SITE_URL, '/').map((l) => l.href);
    const fromSpanish = buildAlternateLinks(SITE_URL, '/es/').map((l) => l.href);
    expect(fromSpanish).toEqual(fromEnglish);
  });
});

describe('buildPersonSchema', () => {
  const schema = buildPersonSchema({
    site,
    description: 'Frontend developer.',
    locale: 'en',
    knowsAbout: ['React', 'TypeScript'],
  });

  it('declares the Person type', () => {
    expect(schema['@type']).toBe('Person');
    expect(schema['@context']).toBe('https://schema.org');
  });

  it('links both public profiles via sameAs', () => {
    expect(schema['sameAs']).toEqual([site.social.github, site.social.linkedin]);
  });

  it('formats the email as a mailto URI', () => {
    expect(schema['email']).toBe(`mailto:${site.email}`);
  });

  /**
   * Guards the standing requirement that no location is published anywhere,
   * including in structured data where it is easy to add without noticing.
   */
  it('publishes no location data', () => {
    const serialised = JSON.stringify(schema);
    for (const key of [
      'address',
      'homeLocation',
      'workLocation',
      'addressLocality',
      'birthPlace',
    ]) {
      expect(serialised).not.toContain(key);
    }
  });

  it('publishes no phone number', () => {
    expect(JSON.stringify(schema)).not.toContain('telephone');
  });
});
