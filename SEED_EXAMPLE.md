# Пример Seed скрипта

Это пример того, как будет выглядеть seed скрипт для заполнения базы данных тестовыми товарами.

## Что такое Seed?

**Seed** (от английского "семя") - это скрипт, который "засеивает" вашу базу данных начальными тестовыми данными.

**Зачем нужно:**
- ✅ Чтобы сразу видеть товары при разработке
- ✅ Чтобы протестировать каталог, корзину и заказы
- ✅ Чтобы быстро восстановить данные после очистки базы

## Как использовать:

1. **Запустить один раз** после создания таблиц в БД
2. **Запустить снова**, если очистили базу данных
3. **Не запускать в продакшене** (только для разработки)

## Пример кода `src/scripts/seed.js`:

```javascript
// src/scripts/seed.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к файлу базы данных
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../database/shop.db');

// Подключаемся к базе данных
const db = new Database(dbPath);

// Тестовые данные - футболки для зала бокса
const products = [
  {
    name: 'Футболка Pantera - Черная',
    description: 'Классическая черная футболка с логотипом зала бокса Pantera. 100% хлопок.',
    price: 1500,
    image_url: '/images/tshirt-black.jpg',
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ]
  },
  {
    name: 'Футболка Pantera - Белая',
    description: 'Белая футболка с логотипом зала бокса Pantera. Идеальна для тренировок.',
    price: 1500,
    image_url: '/images/tshirt-white.jpg',
    variants: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 10 }
    ]
  },
  {
    name: 'Футболка Pantera - Красная',
    description: 'Яркая красная футболка с логотипом зала бокса Pantera.',
    price: 1500,
    image_url: '/images/tshirt-red.jpg',
    variants: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 6 }
    ]
  }
];

try {
  console.log('🌱 Начинаем заполнение базы данных...');
  
  // Начинаем транзакцию (все операции должны выполниться успешно)
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image_url, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
  `);
  
  const insertVariant = db.prepare(`
    INSERT INTO product_variants (product_id, size, stock, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  const insertMany = db.transaction((products) => {
    for (const product of products) {
      // Вставляем товар и получаем его ID
      const result = insertProduct.run(
        product.name,
        product.description,
        product.price,
        product.image_url
      );
      
      const productId = result.lastInsertRowid;
      
      // Вставляем все варианты (размеры) для этого товара
      for (const variant of product.variants) {
        insertVariant.run(productId, variant.size, variant.stock);
      }
      
      console.log(`✅ Добавлен товар: ${product.name} (ID: ${productId})`);
    }
  });
  
  // Выполняем транзакцию
  insertMany(products);
  
  console.log('🎉 База данных успешно заполнена!');
  console.log(`📊 Добавлено товаров: ${products.length}`);
  
} catch (error) {
  console.error('❌ Ошибка при заполнении базы данных:', error);
  process.exit(1);
} finally {
  db.close();
}
```

## Как запустить:

```bash
# Из корня проекта
node src/scripts/seed.js
```

Или добавить в `package.json`:

```json
{
  "scripts": {
    "seed": "node src/scripts/seed.js"
  }
}
```

Тогда можно запускать просто:
```bash
npm run seed
```

## Что делает скрипт:

1. **Подключается к SQLite базе данных** (`database/shop.db`)
2. **Вставляет товары** в таблицу `products` (название, описание, цена, изображение)
3. **Вставляет размеры** в таблицу `product_variants` для каждого товара (S, M, L, XL с остатками)
4. **Использует транзакцию** - если что-то пойдет не так, все изменения откатятся
5. **Выводит информацию** о том, что было добавлено

## В результате:

После запуска seed скрипта у вас будет:
- 3 тестовые футболки в базе данных
- Каждая футболка будет иметь 4 размера (S, M, L, XL)
- Все товары будут видны в каталоге приложения

---

**Важно:** Этот скрипт нужно запускать **после** создания таблиц в базе данных (Этап 2 плана).
