import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z
    .object({
      title: z.string().min(1),
      startsAt: z.coerce.date(),
      meetingPoint: z.string().min(1),
      distanceKm: z.number().positive(),
      roadPercent: z.number().int().min(0).max(100),
      gravelPercent: z.number().int().min(0).max(100),
      elevationGainM: z.number().int().nonnegative(),
      difficulty: z.enum(['Leicht', 'Mittel', 'Schwer']),
      komootEmbedUrl: z.string().url().refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === 'https:' &&
          url.hostname === 'www.komoot.com' &&
          /^\/tour\/[^/]+\/embed\/?$/.test(url.pathname)
        );
      }, 'Muss eine HTTPS-KOMOOT-Einbettungs-URL sein.'),
      registrationUrl: z.string().url().optional(),
    })
    .refine((event) => event.roadPercent + event.gravelPercent === 100, {
      message: 'Straßen- und Gravel-Anteil müssen zusammen 100 % ergeben.',
      path: ['gravelPercent'],
    }),
});

export const collections = { blog, events };
