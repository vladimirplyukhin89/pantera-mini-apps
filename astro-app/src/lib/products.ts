// src/lib/products.ts
// Функции для работы с товарами из базы данных

import db from './db.js';
import type { Product, ProductRow, ProductVariant } from './types.js';

/**
 * Получить все активные товары
 * @returns {Product[]} Массив товаров с их вариантами (размерами)
 */
export function getAllProducts(): Product[] {
  try {
    // SQL запрос для получения всех активных товаров
    // JOIN объединяет данные из двух таблиц
    const products = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.image_url,
        p.collection_name,
        p.active,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.active = 1
      ORDER BY p.id
    `).all() as ProductRow[];

    // Для каждого товара получаем его варианты (размеры)
    const productsWithVariants: Product[] = products.map(product => {
      const variants = getProductVariants(product.id);
      return {
        ...product,
        variants
      };
    });

    return productsWithVariants;
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    throw error;
  }
}

/**
 * Получить товар по ID
 * @param {number} id - ID товара
 * @returns {Product | null} Товар с вариантами или null если не найден
 */
export function getProductById(id: number): Product | null {
  try {
    // Получаем товар по ID
    const product = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.image_url,
        p.collection_name,
        p.active,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.id = ?
    `).get(id) as ProductRow | undefined;

    // Если товар не найден, возвращаем null
    if (!product) {
      return null;
    }

    // Получаем варианты (размеры) для этого товара
    const variants = getProductVariants(id);

    return {
      ...product,
      variants
    };
  } catch (error) {
    console.error(`Ошибка при получении товара с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Получить варианты (размеры) товара
 * @param {number} productId - ID товара
 * @returns {ProductVariant[]} Массив вариантов товара (размеры с ценами и остатками)
 */
export function getProductVariants(productId: number): ProductVariant[] {
  try {
    // Получаем все варианты (размеры) для товара
    const variants = db.prepare(`
      SELECT 
        id,
        size,
        stock,
        price
      FROM product_variants
      WHERE product_id = ?
      ORDER BY 
        CASE size
          WHEN 'XS' THEN 1
          WHEN 'S' THEN 2
          WHEN 'M' THEN 3
          WHEN 'L' THEN 4
          WHEN 'XL' THEN 5
          ELSE 6
        END
    `).all(productId) as Omit<ProductVariant, 'product_id' | 'created_at' | 'updated_at'>[];
    
    // Добавляем product_id к каждому варианту
    return variants.map(variant => ({
      ...variant,
      product_id: productId
    }));
  } catch (error) {
    console.error(`Ошибка при получении вариантов товара ${productId}:`, error);
    throw error;
  }
}
