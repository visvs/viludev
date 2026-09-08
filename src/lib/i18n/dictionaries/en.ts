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

  'hero.eyebrow': 'Frontend Developer',
  'hero.statement': 'I build interfaces that stay fast and usable under real conditions.',
  'hero.intro':
    'Four years of frontend work, most of it on point-of-sale software used all day by people who cannot stop to figure out a screen. That context taught me more about performance and clarity than any side project could.',
  'about.statYears': 'Years',
  'about.statCompanies': 'Companies',
  'experience.current': 'Current',
  'hero.ctaContact': 'Get in touch',
  'hero.ctaGithub': 'GitHub',

  'about.heading': 'About',
  'about.lead':
    'I am a frontend developer and team lead with over four years building responsive, accessible interfaces with React, React Native and Node.js.',
  'about.body':
    'I currently lead the frontend team at Ambit, where I set technical direction, establish the practices we work by, and spend much of my time on the parts nobody sees — observability, performance budgets and test automation. That work is what lets everything else ship without fear.',
  'about.body2':
    'I like problems that reward care: an interface that stays legible under pressure, a test suite that fails for the right reasons, a codebase a new teammate can move through on their first week.',
  'about.educationHeading': 'Education',
  'about.degree': 'B.S. in Computer Systems Engineering',
  'about.institution': 'Instituto Tecnológico Superior de Irapuato (ITESI)',
  'about.educationYears': '2017 – 2022',
  'about.educationNote':
    'Took part in the Science and Technology Outreach Lab, contributing to academic and technical dissemination.',

  'skills.heading': 'Skills',
  'skills.lead': 'What I reach for, and what I have shipped with in production.',
  'skills.group.languages': 'Languages & frameworks',
  'skills.group.interface': 'Interface & design',
  'skills.group.testing': 'Testing & quality',
  'skills.group.practice': 'Practice & tooling',
  'skills.languagesHeading': 'Languages',
  'languages.spanish': 'Spanish',
  'languages.english': 'English',
  'languages.native': 'Native',
  'languages.intermediate': 'Intermediate',

  'experience.heading': 'Experience',
  'experience.lead': 'Where I have worked and what I was responsible for.',
  'experience.present': 'Present',

  'contact.heading': 'Contact',
  'contact.lead': 'Open to frontend and lead roles. The fastest way to reach me is email.',
  'contact.emailLabel': 'Email',

  'footer.builtWith': 'Built with Astro, TypeScript and Tailwind CSS.',
  'footer.viewSource': 'View source',
  'footer.backToTop': 'Back to top',
} as const;

export type TranslationKey = keyof typeof en;
