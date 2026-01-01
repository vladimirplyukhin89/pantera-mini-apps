// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Включаем SSR режим
  adapter: node({
    mode: 'standalone', // Режим работы (standalone = отдельный процесс)
  }),
});
