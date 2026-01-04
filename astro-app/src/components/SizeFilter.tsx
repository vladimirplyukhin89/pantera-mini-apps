// src/components/SizeFilter.tsx
// Компонент фильтрации по размерам (React компонент)

import { useState, useEffect } from 'react';
import styles from './SizeFilter.module.css';

interface SizeFilterProps {
  availableSizes?: string[];
  selectedSize?: string | null;
}

const SizeFilter = ({ 
  availableSizes = ['XS', 'S', 'M', 'L', 'XL'],
  selectedSize: initialSelectedSize = null 
}: SizeFilterProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(initialSelectedSize);

  useEffect(() => {
    // Функция для получения размеров товара из карточки
    const getProductSizes = (card: Element): string[] => {
      const sizesElement = card.querySelector('.product-sizes');
      if (!sizesElement) return [];
      
      const sizesText = sizesElement.textContent || '';
      const match = sizesText.match(/Размеры:\s*(.+)/);
      if (!match) return [];
      
      return match[1].split(',').map((s: string) => s.trim());
    };

    // Функция фильтрации товаров
    const filterProducts = (size: string | null) => {
      const productCards = document.querySelectorAll('.product-card');
      
      productCards.forEach((card) => {
        const cardElement = card as HTMLElement;
        
        if (size === null || size === 'all') {
          // Показать все товары
          cardElement.style.display = '';
        } else {
          // Показать только товары с выбранным размером
          const productSizes = getProductSizes(cardElement);
          if (productSizes.includes(size)) {
            cardElement.style.display = '';
          } else {
            cardElement.style.display = 'none';
          }
        }
      });
    };

    // Применяем фильтр при изменении selectedSize
    filterProducts(selectedSize);
  }, [selectedSize]);

  const handleSizeClick = (size: string | null) => {
    setSelectedSize(size);
  };

  return (
    <div className={styles.sizeFilter} data-filter-component>
      <div className={styles.sizeFilterLabel}>Фильтр по размеру:</div>
      <div className={styles.sizeFilterButtons}>
        <button
          className={`${styles.sizeFilterButton} ${selectedSize === null ? styles.sizeFilterButtonActive : ''}`}
          onClick={() => handleSizeClick(null)}
          data-size="all"
        >
          Все
        </button>
        {availableSizes.map((size) => (
          <button
            key={size}
            className={`${styles.sizeFilterButton} ${selectedSize === size ? styles.sizeFilterButtonActive : ''}`}
            onClick={() => handleSizeClick(size)}
            data-size={size}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeFilter;
