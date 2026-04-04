import { useEffect, useState, type ReactElement } from 'react';
import { ImCool, ImPowerCord as ImPowerCode } from 'react-icons/im';
import styles from './BottomBar.module.css';

interface BottomBarProps {
  currentPath?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: ReactElement;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Главная',
    icon: <ImCool className={`${styles.icon} ${styles.iconHome}`} />,
  },
  {
    path: '/sportsmen',
    label: 'Спортсмены',
    icon: <ImPowerCode className={`${styles.icon} ${styles.iconSportsmen}`} />,
  },
];

const BottomBar = ({ currentPath }: BottomBarProps) => {
  const [path, setPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return currentPath || window.location.pathname;
    }
    return currentPath || '/';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    document.addEventListener('astro:page-load', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('astro:page-load', handleLocationChange);
    };
  }, []);

  const isActive = (itemPath: string) => path === itemPath;
  const isHomePage = path === '/';

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, navPath: string) => {
    if (navPath === window.location.pathname) {
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
