// src/scripts/migrate-add-collection-name.js
// Миграция: Добавление поля collection_name в таблицу products

import db from '../lib/db.js';

console.log('🔄 Выполнение миграции: добавление поля collection_name...');

try {
  // Проверяем, существует ли уже поле collection_name
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasCollectionName = tableInfo.some(col => col.name === 'collection_name');

  if (hasCollectionName) {
    console.log('ℹ️  Поле collection_name уже существует, миграция не требуется.');
    db.close();
    process.exit(0);
  }

  // Выполняем SQL команду ALTER TABLE
  db.exec(`
    ALTER TABLE products 
    ADD COLUMN collection_name TEXT
  `);

  console.log('✅ Миграция выполнена успешно!');
  console.log('📊 Поле collection_name добавлено в таблицу products');
  
  // Проверяем результат
  const newTableInfo = db.prepare("PRAGMA table_info(products)").all();
  const collectionNameField = newTableInfo.find(col => col.name === 'collection_name');
  
  if (collectionNameField) {
    console.log('\n📋 Информация о новом поле:');
    console.log(`   Имя: ${collectionNameField.name}`);
    console.log(`   Тип: ${collectionNameField.type}`);
    console.log(`   Обязательное: ${collectionNameField.notnull ? 'Да' : 'Нет'}`);
  }

} catch (error) {
  console.error('❌ Ошибка при выполнении миграции:', error);
  process.exit(1);
} finally {
  db.close();
}

