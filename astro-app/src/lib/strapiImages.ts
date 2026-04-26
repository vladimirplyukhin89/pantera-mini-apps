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

type ResponsiveImageVariant = {
  src: string;
  srcSet: string;
  sizes: string;
};

/** Строит responsive-варианты для клиентских компонентов (img + srcset/sizes). */
export async function optimizeStrapiImageResponsive(
  remoteSrc: string,
  widths: number[],
  sizes: string,
  logContext: string
): Promise<ResponsiveImageVariant> {
  if (!remoteSrc) {
    return { src: remoteSrc, srcSet: '', sizes };
  }
  if (/\.svg(\?|$)/i.test(remoteSrc)) {
    return { src: remoteSrc, srcSet: '', sizes };
  }

  const uniqueWidths = Array.from(new Set(widths.filter((w) => Number.isFinite(w) && w > 0))).sort(
    (a, b) => a - b
  );
  if (uniqueWidths.length === 0) {
    return { src: await optimizeStrapiImage800(remoteSrc, logContext), srcSet: '', sizes };
  }

  try {
    const optimized = await Promise.all(
      uniqueWidths.map(async (width) => ({
        width,
        src: (
          await getImage({
            src: remoteSrc,
            width,
            format: 'webp',
            inferSize: true,
          })
        ).src,
      }))
    );

    const srcSet = optimized.map((x) => `${x.src} ${x.width}w`).join(', ');
    const src = optimized[optimized.length - 1]?.src ?? remoteSrc;
    return { src, srcSet, sizes };
  } catch (e) {
    console.error(`getImage responsive ${logContext}:`, e);
    return { src: await optimizeStrapiImage800(remoteSrc, logContext), srcSet: '', sizes };
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
