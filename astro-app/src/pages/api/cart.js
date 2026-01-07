// src/pages/api/cart.js
// API endpoint: GET /api/cart, DELETE /api/cart
// GET - получить корзину пользователя
// DELETE - очистить корзину пользователя

import { getCart, clearCart } from '@/lib/cart.js';
import { logger } from '@/lib/logger.js';

/**
 * GET /api/cart?telegram_user_id=xxx
 * Получить корзину пользователя
 */
export async function GET(context) {
  try {
    // Получаем query параметры из URL
    const url = new URL(context.request.url);
    const telegramUserId = url.searchParams.get('telegram_user_id');

    // Проверяем наличие обязательного параметра
    if (!telegramUserId) {
      return new Response(
        JSON.stringify({ 
          error: 'Не указан параметр telegram_user_id',
          message: 'Параметр telegram_user_id обязателен'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Получаем корзину пользователя
    const cart = getCart(telegramUserId);

    // Если корзина не найдена, возвращаем пустую корзину
    if (!cart) {
      logger.debug('Корзина не найдена, возвращаем пустую', {
        endpoint: 'GET /api/cart',
        telegram_user_id: telegramUserId
      });
      
      return new Response(
        JSON.stringify({
          id: null,
          telegram_user_id: telegramUserId,
          created_at: null,
          updated_at: null,
          items: []
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Логируем успешное получение корзины (только если есть товары)
    if (cart.items && cart.items.length > 0) {
      logger.debug('Корзина получена', {
        endpoint: 'GET /api/cart',
        telegram_user_id: telegramUserId,
        items_count: cart.items.length
      });
    }

    // Возвращаем корзину с элементами
    return new Response(JSON.stringify(cart), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Обработка ошибок
    logger.error('Ошибка при получении корзины', {
      endpoint: 'GET /api/cart',
      telegram_user_id,
      error: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Не удалось получить корзину',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * DELETE /api/cart?telegram_user_id=xxx
 * Очистить корзину пользователя
 */
export async function DELETE(context) {
  try {
    // Получаем query параметры из URL
    const url = new URL(context.request.url);
    const telegramUserId = url.searchParams.get('telegram_user_id');

    // Проверяем наличие обязательного параметра
    if (!telegramUserId) {
      return new Response(
        JSON.stringify({ 
          error: 'Не указан параметр telegram_user_id',
          message: 'Параметр telegram_user_id обязателен'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Логируем попытку очистки
    logger.info('Попытка очистки корзины', {
      endpoint: 'DELETE /api/cart',
      telegram_user_id: telegramUserId
    });

    // Очищаем корзину пользователя
    const success = clearCart(telegramUserId);

    if (!success) {
      logger.warn('Корзина не найдена при очистке', {
        endpoint: 'DELETE /api/cart',
        telegram_user_id: telegramUserId
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Корзина не найдена',
          message: 'Корзина для данного пользователя не существует'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Логируем успешную очистку
    logger.info('Корзина успешно очищена', {
      endpoint: 'DELETE /api/cart',
      telegram_user_id: telegramUserId
    });

    // Возвращаем успешный ответ
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Корзина успешно очищена'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Обработка ошибок
    logger.error('Ошибка при очистке корзины', {
      endpoint: 'DELETE /api/cart',
      telegram_user_id,
      error: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Не удалось очистить корзину',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

