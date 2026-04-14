import { getImage } from 'astro:assets';

/** Статическая оптимизация удалённых URL Strapi (WebP, max 800px). */
export async function optimizeStrapiImage800(
  remoteSrc: string,
  logContext: string
): Promise<string> {
  if (!remoteSrc) return remoteSrc;
  // SVG не гоняем через sharp/webp; для remote raster без размеров в CMS нужен inferSize.
  if (/\.svg(\?|$)/i.test(remoteSrc)) return remoteSrc;
  try {
    return (
      await getImage({
        src: remoteSrc,
        width: 800,
        format: 'webp',
        inferSize: true,
      })
    ).src;
  } catch (e) {
    console.error(`getImage ${logContext}:`, e);
    return remoteSrc;
  }
}

/**
 * og:image / twitter:image должны быть абсолютными URL.
 * Сырой Strapi уже абсолютный; результат getImage часто путь вида `/_astro/...`.
 */
export function absoluteImageForOg(href: string, site: URL): string {
  const t = href.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return new URL(t, site).href;
}
