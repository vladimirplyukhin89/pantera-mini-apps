// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  site: 'https://pantera-boxing.ru',
  output: 'static',
  /**
   * Prefetch работает вместе с `<ClientRouter />` (View Transitions): страницы
   * подгружаются заранее, переход по внутренним `<a>` остаётся без полной перезагрузки.
   * @see https://docs.astro.build/en/guides/prefetch/
   */
  prefetch: {
    prefetchAll: true,
    /** Карусели и длинные страницы: ссылки подгружаются по мере появления во вьюпорте */
    defaultStrategy: 'viewport',
  },
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
