const STRAPI_URL_RAW = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_URL = STRAPI_URL_RAW.replace(/\/+$/, '');
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';
const STRAPI_FETCH_TIMEOUT_ENV = import.meta.env.STRAPI_FETCH_TIMEOUT_MS;
/** Лимит ожидания ответа API при SSG (мс). Не задано — 30_000; `0` — без таймаута. */
const STRAPI_FETCH_TIMEOUT_MS =
  STRAPI_FETCH_TIMEOUT_ENV === undefined || STRAPI_FETCH_TIMEOUT_ENV === ''
    ? 30_000
    : (() => {
        const n = Number(STRAPI_FETCH_TIMEOUT_ENV);
        return Number.isFinite(n) && n >= 0 ? n : 30_000;
      })();

interface StrapiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

/**
 * Strapi v4 заворачивал поля в `attributes`, связи/media — в `{ data: ... }`.
 * Strapi 5 отдаёт плоский объект. Нормализуем к одному виду (как v5), чтобы Astro всегда видел `title`, `slug`, `media` и т.д.
 */
function isStrapiRelationDataWrapper(o: Record<string, unknown>): boolean {
  if (!('data' in o)) return false;
  const keys = Object.keys(o);
  if (keys.length === 1) return true;
  return keys.length === 2 && keys.includes('meta');
}

/**
 * Strapi v4: `attributes` на записи; связи — узкая обёртка `{ data }` / `{ data, meta }`.
 * Не трогаем произвольные объекты с полем `data` (например блоки в `body`).
 */
function unwrapStrapiValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(unwrapStrapiValue);

  const o = value as Record<string, unknown>;

  if (isStrapiRelationDataWrapper(o)) {
    if (o.data === null) return null;
    if (Array.isArray(o.data)) return o.data.map((item) => flattenStrapiEntry(item));
    return flattenStrapiEntry(o.data);
  }

  if ('attributes' in o && o.attributes !== null && typeof o.attributes === 'object') {
    return flattenStrapiEntry(value);
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    out[k] = unwrapStrapiValue(v);
  }
  return out;
}

function flattenStrapiEntry(entry: unknown): Record<string, unknown> {
  if (entry === null || typeof entry !== 'object') return {};
  const e = entry as Record<string, unknown>;

  if ('attributes' in e && e.attributes !== null && typeof e.attributes === 'object') {
    const attrs = e.attributes as Record<string, unknown>;
    const base: Record<string, unknown> = {};
    if ('id' in e) base.id = e.id;
    if ('documentId' in e) base.documentId = e.documentId;
    for (const [k, v] of Object.entries(attrs)) {
      base[k] = unwrapStrapiValue(v);
    }
    return base;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(e)) {
    out[k] = unwrapStrapiValue(v);
  }
  return out;
}

function normalizeStrapiPayload<T>(data: unknown): T {
  if (data === null || data === undefined) return data as T;
  if (Array.isArray(data)) {
    return data.map((item) => flattenStrapiEntry(item)) as T;
  }
  return flattenStrapiEntry(data) as T;
}

function getStrapiHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

const RETRYABLE_STATUS = new Set([502, 503, 429]);
const MAX_FETCH_ATTEMPTS = 4;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableConnectionError(e: unknown): boolean {
  if (e instanceof Error && e.name === 'AbortError') return true;
  if (e instanceof DOMException && e.name === 'TimeoutError') return true;
  if (e instanceof TypeError) {
    return /fetch|network|econnreset|etimedout|enotfound|econnrefused|certificate/i.test(e.message);
  }
  return false;
}

function withFetchTimeout(init: RequestInit): RequestInit {
  if (!STRAPI_FETCH_TIMEOUT_MS) return init;
  return { ...init, signal: AbortSignal.timeout(STRAPI_FETCH_TIMEOUT_MS) };
}

export async function fetchStrapi<T>(endpoint: string): Promise<T> {
  const url = `${STRAPI_URL}/api/${endpoint}`;
  /** Повторы при 502/503/429 и сетевых сбоях — Strapi Cloud иногда кратковременно отвечает 503 при сборке. */
  const maxAttempts = MAX_FETCH_ATTEMPTS;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const init = withFetchTimeout({ headers: getStrapiHeaders() });
    try {
      const res = await fetch(url, init);
      if (!res.ok && RETRYABLE_STATUS.has(res.status) && attempt < maxAttempts - 1) {
        await delay(800 * (attempt + 1));
        continue;
      }
      if (!res.ok) {
        throw new Error(`Strapi ${res.status}: ${res.statusText} — ${url}`);
      }

      const json: StrapiResponse<T> = await res.json();
      return normalizeStrapiPayload<T>(json.data);
    } catch (e) {
      if (isRetriableConnectionError(e) && attempt < maxAttempts - 1) {
        await delay(800 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }

  throw new Error(`Strapi: не удалось загрузить ${url}`);
}

/**
 * События для SSG: `pageSize` не должен превышать `rest.maxLimit` в Strapi (у нас до 100).
 * Берём 25 — совпадает с дефолтным лимитом Strapi, меньший JSON на запрос; при большом числе событий делаем несколько страниц.
 */
const EVENTS_PAGE_SIZE = 20;
const EVENTS_LIST_MAX_PAGES = 100;

export async function fetchAllEventsForStaticPaths(): Promise<StrapiEvent[]> {
  const out: StrapiEvent[] = [];
  for (let page = 1; page <= EVENTS_LIST_MAX_PAGES; page++) {
    const batch = await fetchStrapi<StrapiEvent[]>(
      `events?populate=*&sort=order:asc&pagination[pageSize]=${EVENTS_PAGE_SIZE}&pagination[page]=${page}`
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < EVENTS_PAGE_SIZE) break;
  }
  return out;
}

export function strapiMedia(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

export function isVideoMedia(m: StrapiImage): boolean {
  if (m.mime) return m.mime.startsWith('video/');
  const ext = (m.ext || m.url || '').split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov'].includes(ext || '');
}

/** Ссылка из Strapi (YouTube/Vimeo/Rutube/VK и т.д.) → URL для iframe. Не распознано — null. */
export function parseEmbedVideoIframeSrc(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;

  const iframeSrc = s.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  let urlStr = iframeSrc ? iframeSrc[1] : s;
  if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;

  let u: URL;
  try {
    u = new URL(urlStr);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (u.pathname.startsWith('/embed/')) return `${u.origin}${u.pathname}${u.search}`;
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
    const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
    if (shorts) return `https://www.youtube.com/embed/${encodeURIComponent(shorts[1])}`;
    return null;
  }
  if (host === 'youtu.be') {
    const id = u.pathname.replace(/^\//, '').split('/')[0];
    if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    return null;
  }

  if (host === 'vimeo.com') {
    const m = u.pathname.match(/^\/(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}`;
    return null;
  }
  if (host === 'player.vimeo.com') return urlStr;

  if (host === 'rutube.ru') {
    if (u.pathname.startsWith('/play/embed/')) return urlStr;
    const m = u.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
    if (m) return `https://rutube.ru/play/embed/${m[1]}`;
    return null;
  }

  if (host === 'vk.com' && u.pathname.includes('video_ext.php')) return urlStr;
  if (host === 'vkvideo.ru') return urlStr;

  return null;
}

// ─── Rich Text block renderer ────────────────────────────

interface RichTextNode {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  url?: string;
  children?: RichTextNode[];
  level?: number;
  format?: string;
}

function renderInline(node: RichTextNode): string {
  let html = node.text || '';
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  if (node.strikethrough) html = `<s>${html}</s>`;
  return html;
}

function renderChildren(children: RichTextNode[]): string {
  return children
    .map((child) => {
      if (child.type === 'text') return renderInline(child);
      if (child.type === 'link')
        return `<a href="${child.url || '#'}">${renderChildren(child.children || [])}</a>`;
      if (child.type === 'list-item') return `<li>${renderChildren(child.children || [])}</li>`;
      return renderChildren(child.children || []);
    })
    .join('');
}

export function renderBlocks(blocks: unknown): string {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string'
      ? blocks
          .split('\n\n')
          .map((p) => `<p>${p}</p>`)
          .join('')
      : '';
  }

  return blocks
    .map((block: RichTextNode) => {
      const content = renderChildren(block.children || []);
      if (!content.trim()) return '';

      switch (block.type) {
        case 'heading': {
          const tag = `h${block.level || 2}`;
          return `<${tag}>${content}</${tag}>`;
        }
        case 'list': {
          const tag = block.format === 'ordered' ? 'ol' : 'ul';
          return `<${tag}>${content}</${tag}>`;
        }
        case 'quote':
          return `<blockquote>${content}</blockquote>`;
        default:
          return `<p>${content}</p>`;
      }
    })
    .filter(Boolean)
    .join('');
}

// ─── Social icon mapping ─────────────────────────────────

const socialIcons: Record<string, string> = {
  telegram: '📩',
  instagram: '📷',
  insta: '📷',
  vk: '💠',
  youtube: '▶️',
  whatsapp: '💬',
  tiktok: '♪',
  twitter: '𝕏',
  x: '𝕏',
};

export function getSocialIcon(name: string): string {
  return socialIcons[name.toLowerCase()] || '🔗';
}

// ─── Accent color mapping ────────────────────────────────

const accentColors: Record<string, string> = {
  red: 'var(--color-red-accent)',
  teal: 'var(--color-turquoise-panther)',
  turquoise: 'var(--color-turquoise-panther)',
  orange: 'var(--color-icon-gallery)',
  purple: 'var(--color-icon-home)',
  green: 'var(--color-icon-contacts)',
};

export function getAccentColor(name: string | undefined | null): string {
  if (!name) return 'var(--color-red-accent)';
  return accentColors[name.toLowerCase()] || name;
}

// ─── Strapi raw types ────────────────────────────────────

export interface StrapiImage {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
  ext?: string;
}

export interface StrapiAthlete {
  id: number;
  label: string;
  name: string;
  quote: string;
  stats: { value: string; label: string }[];
  badge?: string;
  order?: number;
  photo?: StrapiImage;
}

export interface StrapiGalleryPhoto {
  id: number;
  alt: string;
  variant: 'default' | 'tall' | 'wide';
  order: number;
  image?: StrapiImage;
}

export interface StrapiClubValue {
  id: number;
  title: string;
  description: string;
  accent_color?: string;
  order: number;
  photo?: StrapiImage;
}

export interface StrapiEvent {
  id: number;
  documentId: string;
  slug: string;
  emoji?: string;
  title: string;
  teaser: string;
  date_label: string;
  /** Машинная дата для слайдера и деления planned/past (см. `lib/eventAt.ts`) */
  event_at?: string | null;
  /** Enumeration: в схеме репозитория — `statusPlan`; можно назвать поле в CMS и `statusCode` */
  statusPlan?: 'planned' | 'past';
  statusCode?: 'planned' | 'past';
  /** Старое имя поля в Strapi, если ещё не мигрировали на `statusPlan` */
  status?: 'planned' | 'past';
  body: unknown;
  accent_index?: number;
  order?: number;
  media?: StrapiImage[];
  video_cover?: StrapiImage;
  /** Ссылка на ролик (YouTube, Vimeo, Rutube, VK и т.д.) для встраивания на странице события */
  embed_video_url?: string | null;
}

export interface StrapiHero {
  title?: string;
  description?: string;
  cta_link?: string;
  bg_mobile?: StrapiImage;
  bg_desktop?: StrapiImage;
}

export interface StrapiContactInfo {
  title?: string;
  subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  schedule?: string;
  quote?: string;
}

export interface StrapiSocialLink {
  id: number;
  name: string;
  url: string;
  icon?: string;
  order?: number;
}
