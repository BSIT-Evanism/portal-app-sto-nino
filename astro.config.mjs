// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import swup from '@swup/astro';


// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      DATABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      BETTER_AUTH_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      UPLOADTHING_APP_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: false
      }),
      SENDGRID_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false
      }),
      SENDGRID_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: false
      }),
    }
  },
  integrations: [tailwind({
    applyBaseStyles: false,
  }), react()],
  output: 'server',
  adapter: vercel(),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  }
});