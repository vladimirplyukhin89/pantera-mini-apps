// src/scripts/add-products.js
// Скрипт для добавления товаров (футболок) в базу данных
// ЗАПОЛНИТЕ СВОИМИ ДАННЫМИ!

import db from '../lib/db.js';
import { initDatabase } from '../lib/init-db.js';

// Сначала инициализируем БД (создаем таблицы, если их нет)
initDatabase();

/**
 * ФУНКЦИЯ ДЛЯ ДОБАВЛЕНИЯ ТОВАРА
 * 
 * Эта функция добавляет товар и его варианты (размеры) в базу данных
 * 
 * @param {Object} product - Объект с данными товара
 * @param {string} product.name - Название товара
 * @param {string} product.description - Описание товара
 * @param {number} product.price - Цена товара (в рублях)
 * @param {string} product.image_url - Путь к изображению (например: "/images/tshirt-black.jpg")
 * @param {Array} product.variants - Массив размеров с остатками
 * @param {string} product.variants[].size - Размер (S, M, L, XL и т.д.)
 * @param {number} product.variants[].stock - Количество на складе
 */
function addProduct(product) {
  try {
    // Подготовка SQL запроса для вставки товара
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, image_url, collection_name, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Вставляем товар и получаем его ID
    const result = insertProduct.run(
      product.name,                    // название
      product.description,             // описание
      product.price,                   // цена
      product.image_url,               // путь к изображению
      product.collection_name || null, // название коллекции (опционально)
      1                                // active = 1 (активен)
    );

    const productId = result.lastInsertRowid;
    console.log(`✅ Товар добавлен: "${product.name}" (ID: ${productId})`);

    // Подготовка SQL запроса для вставки вариантов (размеров)
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (product_id, size, stock)
      VALUES (?, ?, ?)
    `);

    // Добавляем все варианты (размеры) для этого товара
    for (const variant of product.variants) {
      insertVariant.run(
        productId,        // ID товара
        variant.size,     // размер (S, M, L, XL...)
        variant.stock     // остаток на складе
      );
      console.log(`   📦 Размер ${variant.size}: ${variant.stock} шт.`);
    }

    return productId;
  } catch (error) {
    console.error(`❌ Ошибка при добавлении товара "${product.name}":`, error);
    throw error;
  }
}

// ============================================
// ⬇️ ЗАПОЛНИТЕ ЗДЕСЬ СВОИМИ ДАННЫМИ ⬇️
// ============================================

const products = [
  // ПРИМЕР 1: Черная футболка
  {
    name: 'Футболка Pantera - Черная',
    description: 'Классическая черная футболка с логотипом зала бокса Pantera. 100% хлопок.',
    price: 1500,  // цена в рублях
    image_url: '/images/tshirt-black.jpg',  // путь к изображению (поместите файл в public/images/)
    variants: [
      { size: 'S', stock: 10 },   // размер S, остаток 10 штук
      { size: 'M', stock: 15 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ]
  },

  // ПРИМЕР 2: Белая футболка
  // Раскомментируйте и заполните своими данными:
  /*
  {
    name: 'Футболка Pantera - Белая',
    description: 'Белая футболка с логотипом зала бокса Pantera.',
    price: 1500,
    image_url: '/images/tshirt-white.jpg',
    variants: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 10 }
    ]
  },
  */

  // Добавьте свои товары здесь:
  // ...
];

// ============================================
// Запуск добавления товаров
// ============================================

console.log('🚀 Начинаем добавление товаров...\n');

try {
  // Добавляем все товары
  for (const product of products) {
    addProduct(product);
    console.log(''); // пустая строка для читаемости
  }

  console.log('✅ Все товары успешно добавлены!');
  console.log(`📊 Всего добавлено товаров: ${products.length}`);

  // Показываем статистику
  const countProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  const countVariants = db.prepare('SELECT COUNT(*) as count FROM product_variants').get();
  
  console.log(`\n📈 Статистика БД:`);
  console.log(`   Товаров в БД: ${countProducts.count}`);
  console.log(`   Вариантов (размеров) в БД: ${countVariants.count}`);

} catch (error) {
  console.error('❌ Ошибка при добавлении товаров:', error);
  process.exit(1);
} finally {
  db.close();
}

