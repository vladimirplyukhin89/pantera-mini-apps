import { normalizePath, resolvePathForNav } from './bottomBarNav';

const NAV_SELECTOR = '[data-bottom-bar]';

function syncBottomBar() {
  const nav = document.querySelector<HTMLElement>(NAV_SELECTOR);
  if (!nav) return;

  const logicalPath = resolvePathForNav(window.location.pathname);
  const isHome = normalizePath(logicalPath) === '/';

  nav.classList.toggle('bottomBarBlurred', !isHome);

  nav.querySelectorAll<HTMLAnchorElement>('[data-nav-path]').forEach((a) => {
    const itemPath = a.getAttribute('data-nav-path') ?? '';
    const active = normalizePath(itemPath) === normalizePath(logicalPath);
    a.classList.toggle('bottomBarItemActive', active);
    if (active) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}

let bound = false;

export function initBottomBar() {
  syncBottomBar();

  if (!bound) {
    bound = true;
    document.addEventListener('astro:after-swap', syncBottomBar);
    document.addEventListener('astro:page-load', syncBottomBar);
    window.addEventListener('popstate', syncBottomBar);

    document.addEventListener(
      'click',
      (e) => {
        const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-nav-path]');
        if (!a) return;
        const path = a.getAttribute('data-nav-path');
        if (!path) return;
        if (normalizePath(path) === normalizePath(window.location.pathname)) {
          e.preventDefault();
        }
      },
      true,
    );
  }
}
