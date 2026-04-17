import { useSyncExternalStore, type ReactElement } from 'react';
import { ImCool, ImCamera } from 'react-icons/im';
import { PiTShirtBold } from 'react-icons/pi';
import { GoHomeFill } from 'react-icons/go';

interface BottomBarProps {
  currentPath?: string;
}

interface NavItem {
  path: string;
  label: string;
  prefetch?: true | false;
  icon: ReactElement;
}

function normalizePath(p: string) {
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** Страницы событий логически относятся к разделу «Галерея» (как currentPath на events/[id].astro). */
function resolvePathForNav(pathname: string) {
  const n = normalizePath(pathname);
  if (n.startsWith('/events/')) return '/gallery';
  return n;
}

function subscribeNavPath(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  document.addEventListener('astro:after-swap', onChange);
  document.addEventListener('astro:page-load', onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    document.removeEventListener('astro:after-swap', onChange);
    document.removeEventListener('astro:page-load', onChange);
  };
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Главная',
    icon: <GoHomeFill className="bb-icon bb-icon--home" />,
  },
  {
    path: '/gallery',
    label: 'Галерея',
    icon: <ImCamera className="bb-icon bb-icon--gallery" />,
  },
  {
    path: '/sportsmen',
    label: 'Команда',
    icon: <ImCool className="bb-icon bb-icon--sportsmen" />,
  },
  {
    path: '/shop',
    label: 'Мерч',
    icon: <PiTShirtBold className="bb-icon bb-icon--shop" />,
  },
];

const BottomBar = ({ currentPath }: BottomBarProps) => {
  // При transition:persist остров не перемонтируется и props не обновляются — путь берём из URL + lifecycle Astro.
  // after-swap: история уже обновлена; page-load иногда недостаточен/порядок отличается для части переходов.
  const path = useSyncExternalStore(
    subscribeNavPath,
    () => resolvePathForNav(window.location.pathname),
    () => resolvePathForNav(currentPath ?? '/')
  );

  const isActive = (itemPath: string) => normalizePath(path) === normalizePath(itemPath);
  const isHomePage = normalizePath(path) === '/';

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, navPath: string) => {
    if (normalizePath(navPath) === normalizePath(window.location.pathname)) {
      e.preventDefault();
      return;
    }
  };

  return (
    <nav
      className={`bb ${!isHomePage ? 'bb--blurred' : ''}`}
      data-astro-transition-scope="bottom-bar"
    >
      {navItems.map((item) => (
        <a
          data-astro-prefetch
          key={item.path}
          href={item.path}
          onClick={(e) => handleNavigation(e, item.path)}
          className={`bb-item ${isActive(item.path) ? 'bb-item--active' : ''}`}
        >
          {item.icon}
          <span className="bb-label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default BottomBar;
