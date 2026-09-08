import type { TranslationKey } from '@/lib/i18n';

export interface NavItem {
  /** Section id on the home page. */
  id: string;
  labelKey: TranslationKey;
}

export const navItems: readonly NavItem[] = [
  { id: 'about', labelKey: 'nav.about' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'contact', labelKey: 'nav.contact' },
];
