import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://ci-analytics.org',
  base: '/',
  output: 'hybrid',
  adapter: cloudflare({
    mode: 'directory'
  }),
  integrations: [react()],
});
