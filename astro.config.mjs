import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://ci-analytics.github.io',
  base: '/',
  output: 'hybrid',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react()],
});
