// src/components/BottomBar.tsx
// Нижняя навигационная панель (React компонент)

import { useEffect, useState, type ReactElement } from 'react';
import { ImCool, ImPointRight, ImFire, ImPowerCord as ImPowerCode } from 'react-icons/im';
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
    path: '/catalog',
    label: 'Каталог',
    icon: <ImPointRight className={`${styles.icon} ${styles.iconCatalog}`} />,
  },
  {
    path: '/cart',
    label: 'Корзина',
    icon: <ImFire className={`${styles.icon} ${styles.iconFire}`} />,
  },
  {
    path: '/contacts',
    label: 'Контакты',
    icon: <ImPowerCode className={`${styles.icon} ${styles.iconContacts}`} />,
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
    
    // Обновляем путь при изменении URL (для SPA-навигации)
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const isActive = (itemPath: string) => path === itemPath;

  return (
    <nav className={styles.bottomBar}>
      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
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
