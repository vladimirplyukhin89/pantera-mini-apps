// src/lib/cart.ts
// Функции для работы с корзиной из базы данных

import db from './db.js';
import type { Cart, CartRow, CartItem, CartItemRow } from './types.js';
import { logger } from './logger.js';

/**
 * Получить или создать корзину для пользователя
 * @param {string} telegramUserId - ID пользователя Telegram
 * @returns {CartRow} Корзина пользователя
 */
export function getOrCreateCart(telegramUserId: string): CartRow {
  try {
    // Проверяем, есть ли уже корзина у пользователя
    let cart = db.prepare(`
      SELECT * FROM carts
      WHERE telegram_user_id = ?
    `).get(telegramUserId) as CartRow | undefined;

    // Если корзины нет, создаем новую
    if (!cart) {
      const result = db.prepare(`
        INSERT INTO carts (telegram_user_id)
        VALUES (?)
      `).run(telegramUserId);
      
      // Получаем созданную корзину
      cart = db.prepare(`
        SELECT * FROM carts
        WHERE id = ?
      `).get(result.lastInsertRowid) as CartRow;
    }

    return cart;
  } catch (error) {
    logger.error('Ошибка при получении/создании корзины', {
      function: 'getOrCreateCart',
      telegram_user_id: telegramUserId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Получить корзину пользователя с элементами
 * @param {string} telegramUserId - ID пользователя Telegram
 * @returns {Cart | null} Корзина с элементами или null если не найдена
 */
export function getCart(telegramUserId: string): Cart | null {
  try {
    // Получаем корзину пользователя
    const cart = db.prepare(`
      SELECT * FROM carts
      WHERE telegram_user_id = ?
    `).get(telegramUserId) as CartRow | undefined;

    // Если корзины нет, возвращаем null
    if (!cart) {
      return null;
    }

    // Получаем элементы корзины с информацией о товарах
    // Используем JOIN для объединения данных из нескольких таблиц
    const items = db.prepare(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.variant_id,
        ci.size,
        ci.quantity,
        ci.created_at,
        p.name as product_name,
        p.image_url as product_image_url,
        pv.price,
        pv.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at
    `).all(cart.id) as CartItem[];

    return {
      ...cart,
      items
    };
  } catch (error) {
    logger.error('Ошибка при получении корзины пользователя', {
      function: 'getCart',
      telegram_user_id: telegramUserId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Добавить товар в корзину или увеличить количество, если товар уже есть
 * @param {string} telegramUserId - ID пользователя Telegram
 * @param {number} productId - ID товара
 * @param {number} variantId - ID варианта товара (размера)
 * @param {number} quantity - Количество (по умолчанию 1)
 * @returns {CartItem} Добавленный или обновленный элемент корзины
 */
export function addCartItem(
  telegramUserId: string,
  productId: number,
  variantId: number,
  quantity: number = 1
): CartItem {
  try {
    // Получаем или создаем корзину
    const cart = getOrCreateCart(telegramUserId);

    // Проверяем существование варианта товара и его остаток
    const variant = db.prepare(`
      SELECT * FROM product_variants
      WHERE id = ? AND product_id = ?
    `).get(variantId, productId) as { id: number; stock: number; size: string; price: number } | undefined;

    if (!variant) {
      throw new Error('Вариант товара не найден');
    }

    if (variant.stock < quantity) {
      throw new Error(`Недостаточно товара на складе. Доступно: ${variant.stock}`);
    }

    // Проверяем, есть ли уже этот товар в корзине
    const existingItem = db.prepare(`
      SELECT * FROM cart_items
      WHERE cart_id = ? AND variant_id = ?
    `).get(cart.id, variantId) as CartItemRow | undefined;

    let cartItem: CartItemRow;

    if (existingItem) {
      // Если товар уже есть, увеличиваем количество
      const newQuantity = existingItem.quantity + quantity;
      
      // Проверяем остаток
      if (variant.stock < newQuantity) {
        throw new Error(`Недостаточно товара на складе. Доступно: ${variant.stock}, в корзине: ${existingItem.quantity}`);
      }

      // Обновляем количество
      db.prepare(`
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
      `).run(newQuantity, existingItem.id);

      cartItem = db.prepare(`
        SELECT * FROM cart_items
        WHERE id = ?
      `).get(existingItem.id) as CartItemRow;
    } else {
      // Если товара нет, добавляем новый
      // Получаем размер из варианта
      const size = variant.size;

      const result = db.prepare(`
        INSERT INTO cart_items (cart_id, product_id, variant_id, size, quantity)
        VALUES (?, ?, ?, ?, ?)
      `).run(cart.id, productId, variantId, size, quantity);

      cartItem = db.prepare(`
        SELECT * FROM cart_items
        WHERE id = ?
      `).get(result.lastInsertRowid) as CartItemRow;
    }

    // Обновляем время изменения корзины
    db.prepare(`
      UPDATE carts
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cart.id);

    // Получаем полную информацию об элементе корзины
    const fullItem = db.prepare(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.variant_id,
        ci.size,
        ci.quantity,
        ci.created_at,
        p.name as product_name,
        p.image_url as product_image_url,
        pv.price,
        pv.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.id = ?
    `).get(cartItem.id) as CartItem;

    return fullItem;
  } catch (error) {
    logger.error('Ошибка при добавлении товара в корзину', {
      function: 'addCartItem',
      telegram_user_id: telegramUserId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Обновить количество товара в корзине
 * @param {number} cartItemId - ID элемента корзины
 * @param {number} quantity - Новое количество
 * @returns {CartItem | null} Обновленный элемент корзины или null если не найден
 */
export function updateCartItem(cartItemId: number, quantity: number): CartItem | null {
  try {
    // Проверяем, что количество положительное
    if (quantity <= 0) {
      throw new Error('Количество должно быть больше 0');
    }

    // Получаем элемент корзины
    const cartItem = db.prepare(`
      SELECT * FROM cart_items
      WHERE id = ?
    `).get(cartItemId) as CartItemRow | undefined;

    if (!cartItem) {
      return null;
    }

    // Проверяем остаток товара
    const variant = db.prepare(`
      SELECT stock FROM product_variants
      WHERE id = ?
    `).get(cartItem.variant_id) as { stock: number } | undefined;

    if (!variant) {
      throw new Error('Вариант товара не найден');
    }

    if (variant.stock < quantity) {
      throw new Error(`Недостаточно товара на складе. Доступно: ${variant.stock}`);
    }

    // Обновляем количество
    db.prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
    `).run(quantity, cartItemId);

    // Обновляем время изменения корзины
    db.prepare(`
      UPDATE carts
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cartItem.cart_id);

    // Получаем полную информацию об элементе корзины
    const fullItem = db.prepare(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.variant_id,
        ci.size,
        ci.quantity,
        ci.created_at,
        p.name as product_name,
        p.image_url as product_image_url,
        pv.price,
        pv.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.id = ?
    `).get(cartItemId) as CartItem;

    return fullItem;
  } catch (error) {
    logger.error('Ошибка при обновлении элемента корзины', {
      function: 'updateCartItem',
      cart_item_id: cartItemId,
      quantity,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Удалить товар из корзины
 * @param {number} cartItemId - ID элемента корзины
 * @returns {boolean} true если успешно удалено, false если не найдено
 */
export function deleteCartItem(cartItemId: number): boolean {
  try {
    // Получаем элемент корзины для обновления времени корзины
    const cartItem = db.prepare(`
      SELECT cart_id FROM cart_items
      WHERE id = ?
    `).get(cartItemId) as { cart_id: number } | undefined;

    if (!cartItem) {
      return false;
    }

    // Удаляем элемент корзины
    const result = db.prepare(`
      DELETE FROM cart_items
      WHERE id = ?
    `).run(cartItemId);

    // Обновляем время изменения корзины
    db.prepare(`
      UPDATE carts
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cartItem.cart_id);

    return result.changes > 0;
  } catch (error) {
    logger.error('Ошибка при удалении элемента корзины', {
      function: 'deleteCartItem',
      cart_item_id: cartItemId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Очистить корзину пользователя
 * @param {string} telegramUserId - ID пользователя Telegram
 * @returns {boolean} true если успешно очищена, false если корзина не найдена
 */
export function clearCart(telegramUserId: string): boolean {
  try {
    // Получаем корзину пользователя
    const cart = db.prepare(`
      SELECT id FROM carts
      WHERE telegram_user_id = ?
    `).get(telegramUserId) as { id: number } | undefined;

    if (!cart) {
      return false;
    }

    // Удаляем все элементы корзины
    db.prepare(`
      DELETE FROM cart_items
      WHERE cart_id = ?
    `).run(cart.id);

    // Обновляем время изменения корзины
    db.prepare(`
      UPDATE carts
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cart.id);

    return true;
  } catch (error) {
    logger.error('Ошибка при очистке корзины пользователя', {
      function: 'clearCart',
      telegram_user_id: telegramUserId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

