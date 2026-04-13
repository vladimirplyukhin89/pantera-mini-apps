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
   * View Transitions по умолчанию включают prefetch для всех ссылок — трафик и конкуренция
   * с картинками на первом экране. Оставляем prefetch только у ссылок с data-astro-prefetch.
   * Стратегия по умолчанию — hover (нижняя панель и т.д.); у карточек событий стоит viewport.
   * @see https://docs.astro.build/en/guides/prefetch/
   */
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [react()],
  image: {
    // Список разрешенных доменов для компонента <Image /> и getImage()
    domains: [
      '://cloudinary.com', // Если Strapi Cloud использует Cloudinary (стандарт)
      'strapi.io',          // На всякий случай для системных ресурсов
      '://strapiapp.com' // Ваш уникальный адрес в Strapi Cloud
    ],
    // Если картинки лежат по сложным путям, можно использовать remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.strapiapp.com', // Разрешает любые поддомены Strapi
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
