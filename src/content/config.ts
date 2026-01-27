import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().default('CI-Analytics Team'),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

const dataCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    createdAt: z.date(),
    type: z.string(),
    status: z.string().default('Active'),
    image: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
  'data': dataCollection,
};
