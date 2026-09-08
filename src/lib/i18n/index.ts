import { en, type TranslationKey } from './dictionaries/en';
import { es } from './dictionaries/es';

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

/** English serves from `/`; every other locale is prefixed. */
export const defaultLocale: Locale = 'en';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, es };

export type { TranslationKey };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Read the active locale from a pathname, falling back to the default. */
export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment !== undefined && isLocale(segment) ? segment : defaultLocale;
}

/**
 * Returns a lookup bound to one locale. Keys are typed, so a typo or a removed
 * string is a compile error rather than a blank space on the page.
 */
export function useTranslations(locale: Locale): (key: TranslationKey) => string {
  const dictionary = dictionaries[locale];
  return (key) => dictionary[key];
}

/** Strip a leading locale segment, if there is one. */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  const rest = first !== undefined && isLocale(first) ? segments.slice(1) : segments;
  return rest.length > 0 ? `/${rest.join('/')}` : '/';
}

/** Build the path for `route` in `locale`. */
export function localizePath(route: string, locale: Locale): string {
  const path = stripLocale(route.startsWith('/') ? route : `/${route}`);
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}

/**
 * The same page in another language. Used by the language switcher so changing
 * language keeps you where you were instead of dropping you on the home page.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localizePath(pathname, target);
}

/** The locale the switcher should offer next, given the current one. */
export function getAlternateLocale(current: Locale): Locale {
  return current === 'en' ? 'es' : 'en';
}
