const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

interface StrapiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

function getStrapiHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

export async function fetchStrapi<T>(endpoint: string): Promise<T> {
  const url = `${STRAPI_URL}/api/${endpoint}`;
  const res = await fetch(url, { headers: getStrapiHeaders() });

  if (!res.ok) {
    throw new Error(`Strapi ${res.status}: ${res.statusText} — ${url}`);
  }

  const json: StrapiResponse<T> = await res.json();
  return json.data;
}

export function strapiMedia(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
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
      if (child.type === 'list-item')
        return `<li>${renderChildren(child.children || [])}</li>`;
      return renderChildren(child.children || []);
    })
    .join('');
}

export function renderBlocks(blocks: unknown): string {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string' ? blocks.split('\n\n').map((p) => `<p>${p}</p>`).join('') : '';
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

/** Значения enum в Strapi: Single Type `gallery-settings` → поле `events_slider_bg` */
export const EVENTS_SLIDER_BG_VALUES = ['glow', 'diagonal', 'mesh'] as const;

export type EventsSliderBgStr = (typeof EVENTS_SLIDER_BG_VALUES)[number];

export interface StrapiGallerySettings {
  events_slider_bg?: EventsSliderBgStr | string;
}

export function parseEventsSliderBg(value: string | undefined | null): EventsSliderBgStr | null {
  if (!value) return null;
  return (EVENTS_SLIDER_BG_VALUES as readonly string[]).includes(value)
    ? (value as EventsSliderBgStr)
    : null;
}

export interface StrapiEvent {
  id: number;
  documentId: string;
  slug: string;
  emoji?: string;
  title: string;
  teaser: string;
  date_label: string;
  /** Enumeration: в схеме репозитория — `statusPlan`; можно назвать поле в CMS и `statusCode` */
  statusPlan?: 'planned' | 'past';
  statusCode?: 'planned' | 'past';
  /** Старое имя поля в Strapi, если ещё не мигрировали на `statusPlan` */
  status?: 'planned' | 'past';
  body: unknown;
  accent_index?: number;
  order?: number;
  media?: StrapiImage[];
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
