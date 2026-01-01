// src/scripts/migrate-add-price-to-variants.js
// Миграция: Добавление поля price в таблицу product_variants

import db from '../lib/db.js';

console.log('🔄 Выполнение миграции: добавление поля price в product_variants...');

try {
  // Проверяем, существует ли уже поле price
  const tableInfo = db.prepare("PRAGMA table_info(product_variants)").all();
  const hasPrice = tableInfo.some(col => col.name === 'price');

  if (hasPrice) {
    console.log('ℹ️  Поле price уже существует, миграция не требуется.');
    db.close();
    process.exit(0);
  }

  // Выполняем SQL команду ALTER TABLE
  db.exec(`
    ALTER TABLE product_variants 
    ADD COLUMN price REAL
  `);

  console.log('✅ Миграция выполнена успешно!');
  console.log('📊 Поле price добавлено в таблицу product_variants');
  console.log('\n💡 Теперь нужно заполнить цены для существующих размеров:');
  console.log('   - Для размеров S, M, L: price = 3500');
  console.log('   - Для размера XL: price = 3700');
  
  // Проверяем результат
  const newTableInfo = db.prepare("PRAGMA table_info(product_variants)").all();
  const priceField = newTableInfo.find(col => col.name === 'price');
  
  if (priceField) {
    console.log('\n📋 Информация о новом поле:');
    console.log(`   Имя: ${priceField.name}`);
    console.log(`   Тип: ${priceField.type}`);
    console.log(`   Обязательное: ${priceField.notnull ? 'Да' : 'Нет'}`);
  }

} catch (error) {
  console.error('❌ Ошибка при выполнении миграции:', error);
  process.exit(1);
} finally {
  db.close();
}

