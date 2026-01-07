// src/components/CartIcon.tsx
// React компонент для иконки корзины с бейджем количества товаров

import { ImFire } from 'react-icons/im';
import { useEffect, useState, useCallback } from 'react';
import { getTelegramUserId } from '@/lib/telegram-utils.js';

interface CartIconProps {
  className?: string;
  size?: number;
  showBadge?: boolean;
}

const CartIcon = ({ className = '', size = 24, showBadge = true }: CartIconProps) => {
  const [itemsCount, setItemsCount] = useState(0);

  // Мемоизируем функцию загрузки для избежания лишних ререндеров
  const loadCartCount = useCallback(async () => {
    const telegramUserId = getTelegramUserId();
    
    if (!telegramUserId) {
      // Если нет telegram_user_id, проверяем localStorage
      const cachedCount = localStorage.getItem('cart_items_count');
      if (cachedCount) {
        setItemsCount(parseInt(cachedCount, 10));
      }
      return;
    }

    try {
      const response = await fetch(`/api/cart?telegram_user_id=${telegramUserId}`);
      if (response.ok) {
        const cart = await response.json();
        const count = cart.items?.length || 0;
        setItemsCount(count);
        
        // Сохраняем в localStorage для синхронизации
        localStorage.setItem('cart_items_count', String(count));
      }
    } catch (error) {
      console.error('Ошибка при загрузке количества товаров в корзине:', error);
      // При ошибке используем кэш из localStorage
      const cachedCount = localStorage.getItem('cart_items_count');
      if (cachedCount) {
        setItemsCount(parseInt(cachedCount, 10));
      }
    }
  }, []); // Пустой массив зависимостей, так как getTelegramUserId стабильна

  useEffect(() => {
    // Загружаем сразу при монтировании
    loadCartCount();

    // Подписываемся на события обновления корзины
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [loadCartCount]); // loadCartCount в зависимостях, но она мемоизирована

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ImFire className={className} size={size} />
      {showBadge && itemsCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: 'var(--tg-theme-button-color, var(--color-accent-blue))',
            color: 'var(--tg-theme-button-text-color, var(--color-white))',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {itemsCount > 99 ? '99+' : itemsCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;

