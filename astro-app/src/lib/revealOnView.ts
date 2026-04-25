type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealOnViewOptions {
  selector: string;
  visibleClass?: string;
  observedAttr?: string;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  defaultDirection?: RevealDirection;
  defaultDistance?: string;
  defaultDurationMs?: number;
}

interface RevealWindow extends Window {
  __revealOnViewBindings?: Set<string>;
}

function getAxisOffset(direction: RevealDirection, distance: string): { x: string; y: string } {
  switch (direction) {
    case 'down':
      return { x: '0px', y: `-${distance}` };
    case 'left':
      return { x: distance, y: '0px' };
    case 'right':
      return { x: `-${distance}`, y: '0px' };
    case 'none':
      return { x: '0px', y: '0px' };
    case 'up':
    default:
      return { x: '0px', y: distance };
  }
}

function parseDirection(raw: string | null, fallback: RevealDirection): RevealDirection {
  if (!raw) return fallback;
  if (raw === 'up' || raw === 'down' || raw === 'left' || raw === 'right' || raw === 'none') return raw;
  return fallback;
}

function revealElements(options: Required<Omit<RevealOnViewOptions, 'selector'>> & { selector: string }) {
  const items = document.querySelectorAll<HTMLElement>(
    `${options.selector}:not([${options.observedAttr}])`
  );
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((item, index) => {
    const direction = parseDirection(item.dataset.revealDirection ?? null, options.defaultDirection);
    const distance = item.dataset.revealDistance || options.defaultDistance;
    const durationMs = Number.parseInt(item.dataset.revealSpeed || '', 10) || options.defaultDurationMs;
    const axis = getAxisOffset(direction, distance);

    item.style.setProperty('--reveal-translate-x', axis.x);
    item.style.setProperty('--reveal-translate-y', axis.y);
    item.style.setProperty('--reveal-duration', `${durationMs}ms`);
    if (!item.style.getPropertyValue('--reveal-index')) {
      item.style.setProperty('--reveal-index', String(index));
    }
  });

  if (reduceMotion) {
    items.forEach((item) => {
      item.classList.add(options.visibleClass);
      item.setAttribute(options.observedAttr, '1');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(options.visibleClass);
        if (options.once) observer.unobserve(entry.target);
      }
    },
    { rootMargin: options.rootMargin, threshold: options.threshold }
  );

  items.forEach((item) => {
    item.setAttribute(options.observedAttr, '1');
    observer.observe(item);
  });
}

export function initRevealOnView({
  selector,
  visibleClass = 'is-reveal-visible',
  observedAttr = 'data-reveal-observed',
  rootMargin = '0px 0px -12% 0px',
  threshold = 0.12,
  once = true,
  defaultDirection = 'up',
  defaultDistance = '1.5rem',
  defaultDurationMs = 750,
}: RevealOnViewOptions) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const bindingKey = `${selector}::${visibleClass}::${observedAttr}`;
  const revealWindow = window as RevealWindow;
  revealWindow.__revealOnViewBindings ??= new Set<string>();
  if (revealWindow.__revealOnViewBindings.has(bindingKey)) return;
  revealWindow.__revealOnViewBindings.add(bindingKey);

  const run = () =>
    revealElements({
      selector,
      visibleClass,
      observedAttr,
      rootMargin,
      threshold,
      once,
      defaultDirection,
      defaultDistance,
      defaultDurationMs,
    });

  run();
  document.addEventListener('astro:page-load', run);
}
