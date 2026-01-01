# Объяснение файлов в папке scripts

Папка `src/scripts/` содержит вспомогательные скрипты для работы с базой данных.

---

## 📁 Структура папки scripts

```
src/scripts/
├── test-db.js    # Тестирование и инициализация БД
└── seed.js       # Заполнение БД реальными данными товаров
```

---

## 1. test-db.js

### Назначение:
**Тестирование и инициализация базы данных**

### Что делает:
1. ✅ Инициализирует БД (создает все таблицы через `initDatabase()`)
2. ✅ Проверяет что таблицы созданы
3. ✅ Тестирует добавление/чтение/удаление данных
4. ✅ Показывает статистику БД

### Когда использовать:
- При первом запуске проекта (создание таблиц)
- Для проверки что БД работает правильно
- Для тестирования подключения

### Запуск:
```bash
npm run init-db
```

### Код разбор:

```javascript
// Импортируем функции и подключение к БД
import { initDatabase } from '../lib/init-db.js';
import db from '../lib/db.js';

// Запускаем инициализацию (создание таблиц)
initDatabase();

// Проверяем что таблицы созданы
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
`).all();
// sqlite_master - системная таблица SQLite со списком всех таблиц

// Тест: добавляем тестовый товар
const insertProduct = db.prepare(`
  INSERT INTO products (name, description, image_url, collection_name, active)
  VALUES (?, ?, ?, ?, ?)
`);
// db.prepare() - подготавливает SQL запрос (безопасно от SQL инъекций)
// ? - плейсхолдеры (заменяются значениями при .run())

const result = insertProduct.run(
  'Тестовая футболка',
  'Это тестовый товар',
  '/images/test.jpg',
  'Test Collection',
  1
);
// .run() - выполняет INSERT/UPDATE/DELETE

// Читаем обратно
const selectProduct = db.prepare('SELECT * FROM products WHERE id = ?');
const product = selectProduct.get(result.lastInsertRowid);
// .get() - получает одну запись (SELECT)
// lastInsertRowid - ID последней добавленной записи
```

---

## 2. seed.js

### Назначение:
**Заполнение базы данных реальными данными о товарах**

### Что делает:
1. ✅ Инициализирует БД (создает все таблицы)
2. ✅ Заполняет таблицу `products` реальными товарами
3. ✅ Заполняет таблицу `product_variants` размерами с ценами
4. ✅ Показывает статистику добавленных данных

### Когда использовать:
- При настройке проекта на новой машине
- После очистки БД (удаления файла `database/shop.db`)
- Для восстановления данных после миграций

### Запуск:
```bash
npm run seed
```

### Важно:
- Скрипт проверяет наличие данных в БД и предупреждает если данные уже есть
- Для перезаписи удалите файл `database/shop.db` и запустите скрипт заново

### Структура данных в скрипте:

```javascript
const products = [
  {
    name: 'Китайская пантера',
    description: 'Розовая футболка, оверсайз крой, плотность 230, хлопок',
    image_url: '/images/pink.jpg',
    collection_name: 'STRIKE WITH FIRE',
    variants: [
      { size: 'XS', stock: 1, price: 3500 },
      { size: 'M', stock: 1, price: 3500 },
      { size: 'XL', stock: 1, price: 3700 }  // XL дороже!
    ]
  },
  // ... другие товары
];
```

### Код разбор:

```javascript
// Инициализация БД (создание таблиц)
initDatabase();

// Функция для добавления товара с размерами
function addProduct(product) {
  // 1. Добавляем товар в таблицу products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, image_url, collection_name, active)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = insertProduct.run(...);
  const productId = result.lastInsertRowid; // Получаем ID нового товара

  // 2. Добавляем размеры в таблицу product_variants
  const insertVariant = db.prepare(`
    INSERT INTO product_variants (product_id, size, stock, price)
    VALUES (?, ?, ?, ?)
  `);
  for (const variant of product.variants) {
    insertVariant.run(productId, variant.size, variant.stock, variant.price);
  }
}
```

---

## Резюме

| Файл | Назначение | Когда использовать |
|------|-----------|-------------------|
| `test-db.js` | Инициализация и тестирование БД | Первый запуск, проверка БД |
| `seed.js` | Заполнение реальными данными | Настройка на новой машине, восстановление данных |

---

## Типичный workflow

### На новой машине:
```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd pantera-mini-apps/astro-app

# 2. Установить зависимости
npm install

# 3. Инициализировать БД (создать таблицы)
npm run init-db

# 4. Заполнить БД товарами
npm run seed
```

### После очистки БД:
```bash
# Удалить файл БД
rm database/shop.db

# Заполнить заново
npm run seed
```

---

## Важные замечания

1. **База данных НЕ коммитится в Git** - файл `database/shop.db` в `.gitignore`
2. **Структура БД** определена в `src/lib/init-db.js` - там создаются все таблицы
3. **Реальные данные** хранятся в `seed.js` - обновляйте их при изменении товаров
4. **Price только в product_variants** - цена зависит от размера, поэтому хранится там
