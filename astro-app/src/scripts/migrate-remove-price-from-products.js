// src/scripts/migrate-remove-price-from-products.js
// Миграция: Удаление поля price из таблицы products
// (В SQLite нельзя DROP COLUMN напрямую, поэтому создаем новую таблицу)

import db from '../lib/db.js';

console.log('🔄 Выполнение миграции: удаление поля price из products...');

try {
  // Проверяем, есть ли поле price в products
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasPrice = tableInfo.some(col => col.name === 'price');

  if (!hasPrice) {
    console.log('ℹ️  Поле price уже отсутствует в таблице products, миграция не требуется.');
    db.close();
    process.exit(0);
  }

  console.log('📊 Поле price найдено, начинаем миграцию...');

  // SQLite не поддерживает DROP COLUMN напрямую
  // Поэтому создаем новую таблицу без price и копируем данные

  db.exec('BEGIN TRANSACTION');

  try {
    // 1. Создаем новую таблицу без поля price
    db.exec(`
      CREATE TABLE products_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        collection_name TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Копируем данные из старой таблицы (без поля price)
    db.exec(`
      INSERT INTO products_new (id, name, description, image_url, collection_name, active, created_at, updated_at)
      SELECT id, name, description, image_url, collection_name, active, created_at, updated_at
      FROM products
    `);

    // 3. Удаляем старую таблицу
    db.exec('DROP TABLE products');

    // 4. Переименовываем новую таблицу
    db.exec('ALTER TABLE products_new RENAME TO products');

    // 5. Коммитим транзакцию
    db.exec('COMMIT');

    console.log('✅ Миграция выполнена успешно!');
    console.log('📊 Поле price удалено из таблицы products');
    console.log('💡 Теперь цена хранится только в product_variants.price');

  } catch (error) {
    // Откатываем транзакцию при ошибке
    db.exec('ROLLBACK');
    throw error;
  }

  // Проверяем результат
  const newTableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasPriceAfter = newTableInfo.some(col => col.name === 'price');

  if (!hasPriceAfter) {
    console.log('\n✅ Подтверждение: поле price успешно удалено');
    console.log('\n📋 Текущие поля таблицы products:');
    newTableInfo.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
  }

} catch (error) {
  console.error('❌ Ошибка при выполнении миграции:', error);
  process.exit(1);
} finally {
  db.close();
}

