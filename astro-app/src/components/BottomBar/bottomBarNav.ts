/** Нормализация пути для сравнения (без завершающего `/`). */
export function normalizePath(p: string): string {
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** Страницы событий логически относятся к разделу «Галерея» (как currentPath на events/[id].astro). */
export function resolvePathForNav(pathname: string): string {
  const n = normalizePath(pathname);
  if (n.startsWith('/events/')) return '/gallery';
  return n;
}
