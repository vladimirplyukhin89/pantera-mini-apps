// src/pages/api/products/index.js
// API endpoint: GET /api/products
// Возвращает все активные товары

import { getAllProducts } from '@/lib/products.js';
import { logger } from '@/lib/logger.js';

export async function GET() {
  try {
    // Получаем все активные товары
    const products = getAllProducts();

    // Возвращаем JSON ответ
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Обработка ошибок
    logger.error('Ошибка при получении товаров', {
      endpoint: 'GET /api/products',
      error: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Не удалось получить товары',
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

