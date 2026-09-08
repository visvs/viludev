/**
 * Single source of truth for site-level identity.
 *
 * Deliberately carries no location and no phone number. Location is omitted
 * because it changes often and a stale one is worse than none; the phone number
 * is omitted because a personal number on an indexed page is an avoidable spam
 * surface when email and LinkedIn already cover contact.
 */
export const site = {
  name: 'Violeta Vera Salazar',
  handle: 'viludev',
  /**
   * Resolved from the Astro `site` config, which is environment-driven, so the
   * canonical origin always matches wherever the site is actually served.
   */
  url: import.meta.env.SITE,
  email: 'vi.vera.salazar@gmail.com',
  jobTitle: 'Frontend Developer',
  repository: 'https://github.com/visvs/viludev',
  social: {
    github: 'https://github.com/visvs',
    linkedin: 'https://www.linkedin.com/in/visv/',
  },
} as const;

export type Site = typeof site;
