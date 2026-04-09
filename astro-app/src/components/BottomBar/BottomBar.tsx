import { useEffect, useState, type ReactElement } from 'react';
import { ImCool, ImCamera } from 'react-icons/im';
import { PiTShirtBold } from "react-icons/pi";
import { GoHomeFill } from "react-icons/go";
import styles from './BottomBar.module.css';

interface BottomBarProps {
  currentPath?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: ReactElement;
}

function normalizePath(p: string) {
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Главная',
    icon: <GoHomeFill className={`${styles.icon} ${styles.iconHome}`} />,
  },
  {
    path: '/gallery',
    label: 'Галерея',
    icon: <ImCamera className={`${styles.icon} ${styles.iconGallery}`} />,
  },
  {
    path: '/sportsmen',
    label: 'Команда',
    icon: <ImCool className={`${styles.icon} ${styles.iconSportsmen}`} />,
  },
  {
    path: '/shop',
    label: 'Мерч',
    icon: <PiTShirtBold className={`${styles.icon} ${styles.iconShop}`} />,
  },
];

const BottomBar = ({ currentPath }: BottomBarProps) => {
  const [path, setPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return currentPath ?? window.location.pathname;
    }
    return currentPath ?? '/';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncPath = () => {
      setPath(currentPath ?? window.location.pathname);
    };

    syncPath();
    window.addEventListener('popstate', syncPath);
    document.addEventListener('astro:page-load', syncPath);

    return () => {
      window.removeEventListener('popstate', syncPath);
      document.removeEventListener('astro:page-load', syncPath);
    };
  }, [currentPath]);

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
      className={`${styles.bottomBar} ${!isHomePage ? styles.bottomBarBlurred : ''}`}
      data-astro-transition-scope="bottom-bar"
    >
      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          data-astro-prefetch="hover"
          onClick={(e) => handleNavigation(e, item.path)}
          className={`${styles.bottomBarItem} ${isActive(item.path) ? styles.bottomBarItemActive : ''}`}
        >
          {item.icon}
          <span className={styles.label}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default BottomBar;
