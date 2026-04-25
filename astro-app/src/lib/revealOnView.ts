type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealOnViewOptions {
  selector: string;
  visibleClass?: string;
  observedAttr?: string;
  completeAttr?: string;
  persistCompleteInSession?: boolean;
  sessionStorageKey?: string;
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
  if (raw === 'up' || raw === 'down' || raw === 'left' || raw === 'right' || raw === 'none')
    return raw;
  return fallback;
}

function getSessionKey(storageKey: string, item: HTMLElement, index: number): string {
  const revealId = item.dataset.revealId || item.id || String(index);
  return `${storageKey}:${revealId}`;
}

function revealElements(
  options: Required<Omit<RevealOnViewOptions, 'selector'>> & { selector: string }
) {
  const allItems = Array.from(document.querySelectorAll<HTMLElement>(options.selector));
  if (!allItems.length) return;

  if (options.persistCompleteInSession) {
    allItems.forEach((item, index) => {
      try {
        if (!window.sessionStorage.getItem(getSessionKey(options.sessionStorageKey, item, index)))
          return;
      } catch {
        return;
      }
      item.classList.add(options.visibleClass);
      item.setAttribute(options.observedAttr, '1');
      item.setAttribute(options.completeAttr, '1');
    });
  }

  const items = allItems.filter(
    (item) => !item.hasAttribute(options.completeAttr) && !item.hasAttribute(options.observedAttr)
  );
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((item, index) => {
    const direction = parseDirection(
      item.dataset.revealDirection ?? null,
      options.defaultDirection
    );
    const distance = item.dataset.revealDistance || options.defaultDistance;
    const durationMs =
      Number.parseInt(item.dataset.revealSpeed || '', 10) || options.defaultDurationMs;
    const axis = getAxisOffset(direction, distance);

    item.style.setProperty('--reveal-translate-x', axis.x);
    item.style.setProperty('--reveal-translate-y', axis.y);
    item.style.setProperty('--reveal-duration', `${durationMs}ms`);
    if (!item.style.getPropertyValue('--reveal-index')) {
      item.style.setProperty('--reveal-index', String(index));
    }
  });

  if (reduceMotion) {
    items.forEach((item, index) => {
      item.classList.add(options.visibleClass);
      item.setAttribute(options.observedAttr, '1');
      item.setAttribute(options.completeAttr, '1');
      if (options.persistCompleteInSession) {
        try {
          window.sessionStorage.setItem(getSessionKey(options.sessionStorageKey, item, index), '1');
        } catch {
          // Ignore quota/security errors and keep non-persistent behavior.
        }
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.classList.add(options.visibleClass);
        target.setAttribute(options.completeAttr, '1');
        if (options.persistCompleteInSession) {
          const index = allItems.indexOf(target);
          try {
            window.sessionStorage.setItem(
              getSessionKey(options.sessionStorageKey, target, index === -1 ? 0 : index),
              '1'
            );
          } catch {
            // Ignore quota/security errors and keep non-persistent behavior.
          }
        }
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
  completeAttr = 'data-reveal-complete',
  persistCompleteInSession = false,
  sessionStorageKey = `reveal:${window.location.pathname}:${selector}`,
  rootMargin = '0px 0px -12% 0px',
  threshold = 0.12,
  once = true,
  defaultDirection = 'up',
  defaultDistance = '1.5rem',
  defaultDurationMs = 750,
}: RevealOnViewOptions) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const bindingKey = `${selector}::${visibleClass}::${observedAttr}::${completeAttr}`;
  const revealWindow = window as RevealWindow;
  revealWindow.__revealOnViewBindings ??= new Set<string>();
  if (revealWindow.__revealOnViewBindings.has(bindingKey)) return;
  revealWindow.__revealOnViewBindings.add(bindingKey);

  const run = () =>
    revealElements({
      selector,
      visibleClass,
      observedAttr,
      completeAttr,
      persistCompleteInSession,
      sessionStorageKey,
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
