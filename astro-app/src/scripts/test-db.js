// src/scripts/test-db.js
// Тестовый скрипт для проверки работы базы данных

import { initDatabase } from '@/lib/init-db.js';
import db from '@/lib/db.js';

// Запускаем инициализацию
initDatabase();

// Проверяем что таблицы созданы
console.log('\n📋 Проверка созданных таблиц:');
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
`).all();

console.log('Созданные таблицы:');
tables.forEach(table => {
  console.log(`  ✅ ${table.name}`);
});

// Простой тест - пробуем добавить тестовый товар
console.log('\n🧪 Тест: Добавление тестового товара...');

try {
  // Вставляем товар
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image_url, active)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = insertProduct.run(
    'Тестовая футболка',
    'Это тестовый товар для проверки работы БД',
    1500,
    '/images/test.jpg',
    1
  );
  
  console.log(`✅ Товар добавлен с ID: ${result.lastInsertRowid}`);
  
  // Читаем обратно
  const selectProduct = db.prepare('SELECT * FROM products WHERE id = ?');
  const product = selectProduct.get(result.lastInsertRowid);
  
  console.log('\n📦 Данные товара:');
  console.log(product);
  
  // Удаляем тестовый товар
  const deleteProduct = db.prepare('DELETE FROM products WHERE id = ?');
  deleteProduct.run(result.lastInsertRowid);
  console.log('\n🗑️  Тестовый товар удален');
  
} catch (error) {
  console.error('❌ Ошибка при тестировании:', error);
}

console.log('\n✅ Тест завершен успешно!');
db.close();

