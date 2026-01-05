// src/pages/api/cart/items/[id].js
// API endpoint: PUT /api/cart/items/:id, DELETE /api/cart/items/:id
// PUT - изменить количество товара в корзине
// DELETE - удалить товар из корзины

import { updateCartItem, deleteCartItem } from '@/lib/cart.js';

/**
 * PUT /api/cart/items/:id
 * Изменить количество товара в корзине
 * Body: { quantity: number }
 */
export async function PUT(context) {
  try {
    // Получаем ID элемента корзины из параметров роута
    const cartItemId = parseInt(context.params.id);

    // Проверяем что ID - это число
    if (isNaN(cartItemId)) {
      return new Response(
        JSON.stringify({ 
          error: 'Неверный ID элемента корзины',
          message: 'ID должен быть числом'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Парсим JSON из request body
    const body = await context.request.json();

    // Проверяем наличие обязательного поля quantity
    const { quantity } = body;

    if (!quantity || typeof quantity !== 'number') {
      return new Response(
        JSON.stringify({ 
          error: 'Не указано quantity',
          message: 'Поле quantity обязательно и должно быть числом'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Проверяем, что quantity - положительное число
    if (quantity <= 0) {
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

    // Обновляем количество товара в корзине
    const cartItem = updateCartItem(cartItemId, quantity);

    // Если элемент корзины не найден
    if (!cartItem) {
      return new Response(
        JSON.stringify({ 
          error: 'Элемент корзины не найден',
          message: `Элемент корзины с ID ${cartItemId} не существует`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Возвращаем успешный ответ с данными элемента корзины
    return new Response(JSON.stringify(cartItem), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Обработка ошибок
    console.error(`Ошибка в PUT /api/cart/items/${context.params.id}:`, error);
    
    // Определяем код статуса в зависимости от типа ошибки
    let status = 500;
    if (error.message.includes('не найден') || error.message.includes('Недостаточно') || error.message.includes('должно быть')) {
      status = 400;
    }

    return new Response(
      JSON.stringify({ 
        error: 'Не удалось обновить элемент корзины',
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

/**
 * DELETE /api/cart/items/:id
 * Удалить товар из корзины
 */
export async function DELETE(context) {
  try {
    // Получаем ID элемента корзины из параметров роута
    const cartItemId = parseInt(context.params.id);

    // Проверяем что ID - это число
    if (isNaN(cartItemId)) {
      return new Response(
        JSON.stringify({ 
          error: 'Неверный ID элемента корзины',
          message: 'ID должен быть числом'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Удаляем товар из корзины
    const success = deleteCartItem(cartItemId);

    // Если элемент корзины не найден
    if (!success) {
      return new Response(
        JSON.stringify({ 
          error: 'Элемент корзины не найден',
          message: `Элемент корзины с ID ${cartItemId} не существует`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Возвращаем успешный ответ
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Товар успешно удален из корзины'
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
    console.error(`Ошибка в DELETE /api/cart/items/${context.params.id}:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Не удалось удалить товар из корзины',
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

