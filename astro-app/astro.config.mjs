// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к корню проекта
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  output: 'server', // Включаем SSR режим
  adapter: node({
    mode: 'standalone', // Режим работы (standalone = отдельный процесс)
  }),
  integrations: [react()], // Интеграция React
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
