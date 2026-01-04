// src/components/CartIcon.tsx
// React компонент для иконки корзины (для использования в Astro компонентах)

import { ImFire } from 'react-icons/im';

interface CartIconProps {
  className?: string;
  size?: number;
}

const CartIcon = ({ className = '', size = 24 }: CartIconProps) => {
  return <ImFire className={className} size={size} />;
};

export default CartIcon;

