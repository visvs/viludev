import type { Site } from '@/data/site';

interface PersonSchemaOptions {
  site: Site;
  description: string;
  locale: string;
  knowsAbout: readonly string[];
}

/**
 * schema.org `Person` — the right type for a personal portfolio, and what lets
 * search engines associate the name, role and profiles.
 *
 * No `address` / `homeLocation` is emitted, by choice: structured location data
 * is exactly the kind of thing that gets cached and resurfaced long after it
 * stops being true.
 */
export function buildPersonSchema({
  site,
  description,
  locale,
  knowsAbout,
}: PersonSchemaOptions): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: site.jobTitle,
    description,
    inLanguage: locale,
    knowsLanguage: ['es', 'en'],
    knowsAbout: [...knowsAbout],
    sameAs: [site.social.github, site.social.linkedin],
  };
}
