/**
 * English is the source of truth for the translation key set: `TranslationKey`
 * is derived from it, and every other dictionary is typed against that. A key
 * that is missing from — or extra in — another language is a compile error, so
 * translation drift cannot reach production.
 */
export const en = {
  'nav.about': 'About',
  'nav.skills': 'Skills',
  'nav.experience': 'Experience',
  'nav.contact': 'Contact',

  'a11y.skipToContent': 'Skip to content',
  'a11y.mainNavigation': 'Main navigation',
  'a11y.toggleTheme': 'Switch between light and dark theme',
  'a11y.openMenu': 'Open menu',
  'a11y.closeMenu': 'Close menu',
  'a11y.switchLanguage': 'Switch language',

  'meta.title': 'Violeta Vera Salazar — Frontend Developer',
  'meta.description':
    'Frontend developer and team lead with over four years building accessible, high-performance interfaces with React, TypeScript and React Native.',

  'footer.builtWith': 'Built with Astro, TypeScript and Tailwind CSS.',
  'footer.viewSource': 'View source',
  'footer.backToTop': 'Back to top',
} as const;

export type TranslationKey = keyof typeof en;
