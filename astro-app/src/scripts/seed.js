// src/scripts/seed.js
// Скрипт для заполнения базы данных реальными данными о товарах
// Используется для восстановления БД на новой машине или после очистки

import { initDatabase } from '@/lib/init-db.js';
import db from '@/lib/db.js';

console.log('🌱 Заполнение базы данных товарами...\n');

// Инициализируем БД (создаем таблицы)
initDatabase();

/**
 * Добавляет товар с его размерами в базу данных
 */
function addProduct(product) {
  try {
    // Подготовка SQL запроса для вставки товара
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, image_url, collection_name, active)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Вставляем товар и получаем его ID
    const result = insertProduct.run(
      product.name,                    // название
      product.description || null,     // описание (может быть null)
      product.image_url || null,       // путь к изображению
      product.collection_name || null, // название коллекции
      1                                // active = 1 (активен)
    );

    const productId = result.lastInsertRowid;
    console.log(`✅ Товар добавлен: "${product.name}" (ID: ${productId})`);

    // Подготовка SQL запроса для вставки вариантов (размеров)
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (product_id, size, stock, price)
      VALUES (?, ?, ?, ?)
    `);

    // Добавляем все варианты (размеры) для этого товара
    for (const variant of product.variants) {
      insertVariant.run(
        productId,        // ID товара
        variant.size,     // размер (XS, S, M, L, XL...)
        variant.stock,    // остаток на складе
        variant.price     // цена для этого размера
      );
      console.log(`   📦 Размер ${variant.size}: ${variant.stock} шт., цена ${variant.price} руб.`);
    }

    return productId;
  } catch (error) {
    console.error(`❌ Ошибка при добавлении товара "${product.name}":`, error);
    throw error;
  }
}

// ============================================
// Реальные данные о товарах
// ============================================

const products = [
  {
    name: 'Китайская пантера',
    description: 'Розовая футболка, оверсайз крой, плотность 230, хлопок',
    image_url: '/images/pink.jpg',
    collection_name: 'STRIKE WITH FIRE',
    variants: [
      { size: 'XS', stock: 1, price: 3500 },
      { size: 'M', stock: 1, price: 3500 },
      { size: 'XL', stock: 1, price: 3700 }
    ]
  },
  {
    name: 'Китайская пантера',
    description: 'Голубая футболка, оверсайз крой, плотность 230, хлопок',
    image_url: '/images/blue.jpg',
    collection_name: 'STRIKE WITH FIRE',
    variants: [
      { size: 'M', stock: 1, price: 3500 },
      { size: 'XL', stock: 1, price: 3700 }
    ]
  },
  {
    name: 'Китайская пантера',
    description: 'Зеленая футболка, оверсайз крой, плотность 230, хлопок',
    image_url: '/images/green.jpg',
    collection_name: 'STRIKE WITH FIRE',
    variants: [
      { size: 'M', stock: 1, price: 3500 }
    ]
  },
  {
    name: 'Китайская пантера',
    description: 'Черная футболка, оверсайз крой, плотность 230, хлопок',
    image_url: '/images/black.jpg',
    collection_name: 'STRIKE WITH FIRE',
    variants: [
      { size: 'M', stock: 1, price: 3500 }
    ]
  },
  {
    name: 'Китайская пантера',
    description: 'Белая футболка, оверсайз крой, плотность 230, хлопок',
    image_url: '/images/white.jpg',
    collection_name: 'STRIKE WITH FIRE',
    variants: [
      { size: 'M', stock: 1, price: 3500 }
    ]
  } 
];

// ============================================
// Запуск заполнения БД
// ============================================

console.log('🚀 Начинаем заполнение базы данных...\n');

try {
  // Проверяем есть ли уже данные в БД
  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (existingProducts.count > 0) {
    console.log(`⚠️  В БД уже есть ${existingProducts.count} товаров.`);
    console.log('   Пропускаем заполнение (данные уже есть).');
    console.log('   Для перезаписи удалите файл database/shop.db и запустите скрипт заново.\n');
    db.close();
    process.exit(0);
  }

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
  console.error('❌ Ошибка при заполнении базы данных:', error);
  process.exit(1);
} finally {
  db.close();
}

