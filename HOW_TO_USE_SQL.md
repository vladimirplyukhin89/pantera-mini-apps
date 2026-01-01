# Как использовать SQL команды в проекте

## Общие понятия

### Что такое SQL?
SQL (Structured Query Language) - язык для работы с базами данных. С его помощью мы:
- Создаем таблицы (CREATE TABLE)
- Добавляем данные (INSERT)
- Читаем данные (SELECT)
- Изменяем данные (UPDATE)
- Удаляем данные (DELETE)
- Изменяем структуру таблиц (ALTER TABLE)

### Как выполнить SQL команду?

В нашем проекте есть **три способа** выполнить SQL команду:

---

## Способ 1: Через скрипт миграции (РЕКОМЕНДУЕТСЯ)

**Для чего:** Изменение структуры БД (добавление/удаление полей, создание таблиц)

**Пример:** Добавление поля `collection_name` в таблицу `products`

**Шаг 1:** Создайте файл миграции (например: `src/scripts/migrate-add-collection-name.js`)

**Шаг 2:** Используйте `db.exec()` для выполнения SQL:

```javascript
import db from '../lib/db.js';

db.exec(`
  ALTER TABLE products 
  ADD COLUMN collection_name TEXT
`);
```

**Шаг 3:** Запустите скрипт:
```bash
npm run migrate:add-collection-name
```

**Плюсы:**
- ✅ Версионирование изменений БД
- ✅ Можно повторить на другой машине
- ✅ Безопасно (проверки на существование поля)

---

## Способ 2: Через better-sqlite3 напрямую в коде

**Для чего:** Выполнение SQL в приложении (API endpoints, функции)

**Методы:**

### `db.exec()` - для команд без результата
```javascript
import db from '../lib/db.js';

// Создание таблицы, изменение структуры
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY)');
```

### `db.prepare()` + `.run()` - для INSERT/UPDATE/DELETE
```javascript
const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
const result = insert.run('Футболка', 1500);
console.log(result.lastInsertRowid); // ID добавленной записи
```

### `db.prepare()` + `.get()` - для SELECT одной записи
```javascript
const select = db.prepare('SELECT * FROM products WHERE id = ?');
const product = select.get(1);
console.log(product); // { id: 1, name: 'Футболка', price: 1500 }
```

### `db.prepare()` + `.all()` - для SELECT многих записей
```javascript
const selectAll = db.prepare('SELECT * FROM products');
const products = selectAll.all();
console.log(products); // [{ id: 1, ... }, { id: 2, ... }]
```

**Плюсы:**
- ✅ Безопасно от SQL инъекций (prepared statements)
- ✅ Быстро (prepared statements кешируются)
- ✅ Используется в приложении

---

## Способ 3: Через SQLite CLI (командная строка)

**Для чего:** Быстрая проверка данных, отладка

**Шаг 1:** Установите SQLite CLI (если нет):
```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS (через Homebrew)
brew install sqlite3
```

**Шаг 2:** Откройте базу данных:
```bash
cd astro-app
sqlite3 database/shop.db
```

**Шаг 3:** Выполняйте SQL команды:
```sql
-- Посмотреть все таблицы
.tables

-- Посмотреть структуру таблицы
.schema products

-- Выбрать данные
SELECT * FROM products;

-- Добавить поле (но лучше через миграцию!)
ALTER TABLE products ADD COLUMN collection_name TEXT;

-- Выйти
.exit
```

**Плюсы:**
- ✅ Быстро для проверки данных
- ✅ Удобно для отладки

**Минусы:**
- ⚠️ Изменения через CLI не версионируются
- ⚠️ Лучше использовать миграции для изменений структуры

---

## Примеры SQL команд

### Создание таблицы
```sql
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL
);
```

### Добавление поля в таблицу
```sql
ALTER TABLE products 
ADD COLUMN description TEXT;
```

### Добавление данных (INSERT)
```sql
INSERT INTO products (name, price) 
VALUES ('Футболка', 1500);
```

### Чтение данных (SELECT)
```sql
-- Все товары
SELECT * FROM products;

-- Товар по ID
SELECT * FROM products WHERE id = 1;

-- Только активные товары
SELECT * FROM products WHERE active = 1;
```

### Обновление данных (UPDATE)
```sql
UPDATE products 
SET price = 2000 
WHERE id = 1;
```

### Удаление данных (DELETE)
```sql
DELETE FROM products WHERE id = 1;
```

---

## Важные моменты

### Prepared Statements (защита от SQL инъекций)

**❌ Плохо (небезопасно):**
```javascript
const name = "Футболка'; DROP TABLE products; --";
db.exec(`INSERT INTO products (name) VALUES ('${name}')`);
// Это может удалить таблицу!
```

**✅ Хорошо (безопасно):**
```javascript
const name = "Футболка'; DROP TABLE products; --";
const insert = db.prepare('INSERT INTO products (name) VALUES (?)');
insert.run(name); // SQLite обработает это безопасно
```

### Транзакции (для нескольких операций)

```javascript
const insertProduct = db.prepare('INSERT INTO products (name) VALUES (?)');
const insertVariant = db.prepare('INSERT INTO product_variants (product_id, size) VALUES (?, ?)');

const insertMany = db.transaction((products) => {
  for (const product of products) {
    const result = insertProduct.run(product.name);
    const productId = result.lastInsertRowid;
    
    for (const variant of product.variants) {
      insertVariant.run(productId, variant.size);
    }
  }
});

insertMany(products); // Все выполнится как одна операция
```

---

## Рекомендации

1. **Для изменения структуры БД** → используйте миграции (скрипты)
2. **Для работы с данными в приложении** → используйте `db.prepare()` в коде
3. **Для быстрой проверки** → используйте SQLite CLI

