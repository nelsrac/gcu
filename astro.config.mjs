// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://gravelclub-ulm.de',
  adapter: node({
    mode: 'standalone',
  }),
});