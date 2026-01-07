// src/pages/api/cart/items.js
// API endpoint: POST /api/cart/items
// Добавить товар в корзину

import { addCartItem } from '@/lib/cart.js';
import { logger } from '@/lib/logger.js';

/**
 * POST /api/cart/items
 * Добавить товар в корзину
 * Body: { telegram_user_id: string, product_id: number, variant_id: number, quantity?: number }
 */
export async function POST(context) {
  try {
    // Парсим JSON из request body
    const body = await context.request.json();

    // Проверяем наличие обязательных полей
    const { telegram_user_id, product_id, variant_id, quantity } = body;

    if (!telegram_user_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Не указан telegram_user_id',
          message: 'Поле telegram_user_id обязательно'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!product_id || typeof product_id !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'Не указан product_id',
          message: 'Поле product_id обязательно и должно быть числом'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!variant_id || typeof variant_id !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'Не указан variant_id',
          message: 'Поле variant_id обязательно и должно быть числом'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Если quantity не указан, используем значение по умолчанию 1
    const itemQuantity = quantity || 1;

    // Проверяем, что quantity - положительное число
    if (typeof itemQuantity !== 'number' || itemQuantity <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Неверное значение quantity',
          message: 'Поле quantity должно быть положительным числом'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Логируем попытку добавления товара
    logger.info('Попытка добавления товара в корзину', {
      endpoint: 'POST /api/cart/items',
      telegram_user_id,
      product_id,
      variant_id,
      quantity: itemQuantity
    });

    // Добавляем товар в корзину
    const cartItem = addCartItem(telegram_user_id, product_id, variant_id, itemQuantity);

    // Логируем успешное добавление
    logger.info('Товар успешно добавлен в корзину', {
      endpoint: 'POST /api/cart/items',
      cart_item_id: cartItem.id,
      telegram_user_id,
      product_id,
      variant_id,
      quantity: itemQuantity
    });

    // Возвращаем успешный ответ с данными элемента корзины
    return new Response(JSON.stringify(cartItem), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Обработка ошибок
    logger.error('Ошибка при добавлении товара в корзину', {
      endpoint: 'POST /api/cart/items',
      telegram_user_id: body?.telegram_user_id,
      product_id: body?.product_id,
      variant_id: body?.variant_id,
      error: error.message,
      stack: error.stack
    });
    
    // Определяем код статуса в зависимости от типа ошибки
    let status = 500;
    if (error.message.includes('не найден') || error.message.includes('Недостаточно')) {
      status = 400;
    }

    return new Response(
      JSON.stringify({ 
        error: 'Не удалось добавить товар в корзину',
        message: error.message 
      }),
      {
        status: status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

