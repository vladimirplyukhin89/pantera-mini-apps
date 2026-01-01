// src/pages/api/products/[id].js
// API endpoint: GET /api/products/:id
// Возвращает товар по ID

import { getProductById } from '../../../lib/products.js';

export async function GET(context) {
  try {
    const id = parseInt(context.params.id);

    // Проверяем что ID - это число
    if (isNaN(id)) {
      return new Response(
        JSON.stringify({ 
          error: 'Неверный ID товара',
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

    const product = getProductById(id);

    // Если товар не найден
    if (!product) {
      return new Response(
        JSON.stringify({ 
          error: 'Товар не найден',
          message: `Товар с ID ${id} не существует`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Возвращаем JSON ответ
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Ошибка в GET /api/products/${context.params.id}:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Не удалось получить товар',
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

