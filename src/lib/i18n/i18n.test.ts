import { describe, expect, it } from 'vitest';
import {
  defaultLocale,
  getAlternateLocale,
  getLocaleFromPath,
  isLocale,
  localizePath,
  locales,
  switchLocalePath,
  useTranslations,
} from './index';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';

describe('isLocale', () => {
  it('accepts supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale('ES')).toBe(false);
  });
});

describe('getLocaleFromPath', () => {
  it('reads a prefixed locale', () => {
    expect(getLocaleFromPath('/es/')).toBe('es');
    expect(getLocaleFromPath('/es/contact')).toBe('es');
  });

  it('falls back to the default when unprefixed', () => {
    expect(getLocaleFromPath('/')).toBe(defaultLocale);
    expect(getLocaleFromPath('/contact')).toBe(defaultLocale);
  });

  it('does not treat a non-locale first segment as a locale', () => {
    expect(getLocaleFromPath('/estudio')).toBe(defaultLocale);
  });
});

describe('localizePath', () => {
  it('leaves the default locale unprefixed', () => {
    expect(localizePath('/', 'en')).toBe('/');
    expect(localizePath('/contact', 'en')).toBe('/contact');
  });

  it('prefixes non-default locales', () => {
    expect(localizePath('/', 'es')).toBe('/es/');
    expect(localizePath('/contact', 'es')).toBe('/es/contact');
  });

  it('replaces an existing locale prefix rather than stacking it', () => {
    expect(localizePath('/es/contact', 'es')).toBe('/es/contact');
    expect(localizePath('/es/contact', 'en')).toBe('/contact');
  });

  it('tolerates a missing leading slash', () => {
    expect(localizePath('contact', 'es')).toBe('/es/contact');
  });
});

describe('switchLocalePath', () => {
  it('keeps the reader on the same page when changing language', () => {
    expect(switchLocalePath('/contact', 'es')).toBe('/es/contact');
    expect(switchLocalePath('/es/contact', 'en')).toBe('/contact');
  });

  it('round-trips back to the original path', () => {
    const original = '/contact';
    expect(switchLocalePath(switchLocalePath(original, 'es'), 'en')).toBe(original);
  });

  it('handles the home page in both directions', () => {
    expect(switchLocalePath('/', 'es')).toBe('/es/');
    expect(switchLocalePath('/es/', 'en')).toBe('/');
  });
});

describe('getAlternateLocale', () => {
  it('returns the other supported locale', () => {
    expect(getAlternateLocale('en')).toBe('es');
    expect(getAlternateLocale('es')).toBe('en');
  });
});

describe('useTranslations', () => {
  it('returns the string for the active locale', () => {
    expect(useTranslations('en')('nav.about')).toBe('About');
    expect(useTranslations('es')('nav.about')).toBe('Sobre mí');
  });

  it('resolves every key in every locale to a non-empty string', () => {
    for (const locale of locales) {
      const t = useTranslations(locale);
      for (const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(t(key), `${locale}: ${key}`).toBeTruthy();
      }
    }
  });
});

/**
 * The type system already guarantees the key sets match. This asserts it at
 * runtime too, because the dictionaries are the one place where a bad merge
 * could produce a plausible-looking but wrong object.
 */
describe('dictionary parity', () => {
  it('has identical key sets across locales', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });

  /**
   * Catches copy that was added in English and never translated. A handful of
   * strings are legitimately identical — proper nouns and numbers — so they are
   * listed explicitly. Anything not on this list that matches across locales is
   * almost certainly an oversight.
   */
  it('has no untranslated strings left identical by accident', () => {
    const intentionallyIdentical = new Set<string>([
      'hero.ctaGithub', // a brand name
      'about.institution', // the institution's own name
      'about.educationYears', // a year range
    ]);

    const identical = Object.keys(en).filter(
      (key) =>
        !intentionallyIdentical.has(key) &&
        en[key as keyof typeof en] === es[key as keyof typeof en],
    );
    expect(identical).toEqual([]);
  });

  it('does not keep stale entries in the identical-by-design allowlist', () => {
    const allowlisted = ['hero.ctaGithub', 'about.institution', 'about.educationYears'] as const;
    for (const key of allowlisted) {
      expect(en[key], `${key} is allowlisted but no longer identical`).toBe(es[key]);
    }
  });
});
