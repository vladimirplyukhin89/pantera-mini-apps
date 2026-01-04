// src/components/HeroAccent.tsx
// Акцентный элемент со стрелкой для Hero секции (React компонент)

import { ImPointRight } from 'react-icons/im';

interface HeroAccentProps {
  linkTo?: string;
  className?: string;
}

const HeroAccent = ({ linkTo = '/catalog', className = '' }: HeroAccentProps) => {
  // Используем фиксированный размер, который будет изменяться через CSS
  // Это предотвращает несоответствие между серверным и клиентским рендерингом
  const iconSize = 40; // Базовый размер, CSS изменит его через media queries

  return (
    <a href={linkTo} className={className} aria-label="Перейти в каталог">
      <ImPointRight size={iconSize} />
    </a>
  );
};

export default HeroAccent;
