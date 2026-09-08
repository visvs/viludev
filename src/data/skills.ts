import type { TranslationKey } from '@/lib/i18n';

/**
 * A short, stable list that behaves like configuration, so it lives here rather
 * than in a content collection. Skill names are proper nouns and are identical
 * in both languages; only the group labels are translated, which is why they are
 * translation keys rather than strings.
 */
export interface SkillGroup {
  labelKey: TranslationKey;
  skills: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    labelKey: 'skills.group.languages',
    skills: ['TypeScript', 'JavaScript', 'React', 'React Native', 'Next.js', 'Astro', 'Node.js'],
  },
  {
    labelKey: 'skills.group.interface',
    skills: ['Tailwind CSS', 'Material UI', 'Storybook', 'Accessibility', 'Design systems'],
  },
  {
    labelKey: 'skills.group.testing',
    skills: ['Testing Library', 'Vitest', 'WebdriverIO', 'Unit testing', 'Test automation'],
  },
  {
    labelKey: 'skills.group.practice',
    skills: ['Git & GitHub', 'CI/CD', 'Observability', 'Performance', 'Code review'],
  },
];

export interface SpokenLanguage {
  nameKey: TranslationKey;
  levelKey: TranslationKey;
}

export const spokenLanguages: readonly SpokenLanguage[] = [
  { nameKey: 'languages.spanish', levelKey: 'languages.native' },
  { nameKey: 'languages.english', levelKey: 'languages.intermediate' },
];
