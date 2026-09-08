import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * Work history. A collection rather than a typed array because each entry has a
 * prose body, the set is per-locale, and the same machinery will carry the case
 * studies that land later. Short, stable, config-like lists stay in `data/`.
 *
 * The schema runs at build time, so a malformed or half-translated entry fails
 * the build instead of rendering a gap in the timeline.
 */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z
    .object({
      role: z.string().min(1),
      company: z.string().min(1),
      /** ISO year-month. Precise enough for a timeline, and unambiguous. */
      startDate: z.string().regex(/^\d{4}-\d{2}$/),
      /** `null` means the role is current. */
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .nullable(),
      highlights: z.array(z.string().min(1)).min(1).max(4),
    })
    .strict()
    .refine((entry) => entry.endDate === null || entry.endDate >= entry.startDate, {
      message: 'endDate must not be earlier than startDate',
      path: ['endDate'],
    }),
});

export const collections = { experience };
