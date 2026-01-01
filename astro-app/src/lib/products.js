// src/lib/products.js
// Функции для работы с товарами из базы данных

import db from './db.js';

/**
 * Получить все активные товары
 * @returns {Array} Массив товаров с их вариантами (размерами)
 */
export function getAllProducts() {
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
    `).all();

    // Для каждого товара получаем его варианты (размеры)
    const productsWithVariants = products.map(product => {
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
 * @returns {Object|null} Товар с вариантами или null если не найден
 */
export function getProductById(id) {
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
    `).get(id);

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
 * @returns {Array} Массив вариантов товара (размеры с ценами и остатками)
 */
export function getProductVariants(productId) {
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
          WHEN 'XXL' THEN 6
          ELSE 7
        END
    `).all(productId);

    return variants;
  } catch (error) {
    console.error(`Ошибка при получении вариантов товара ${productId}:`, error);
    throw error;
  }
}

