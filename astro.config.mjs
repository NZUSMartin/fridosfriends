import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://kolleg.netlify.app', // change to the final domain (e.g. https://fridosfriends.de) when live
  integrations: [tailwind()],
});
