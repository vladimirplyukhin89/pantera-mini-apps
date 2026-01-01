# Полное руководство по работе с БД через SQLite CLI

**Это руководство для работы с базой данных ТОЛЬКО через SQLite CLI (командная строка).**

---

## ⚠️ Важные правила

### 1. Всегда завершайте SQL команды точкой с запятой `;`
```sql
-- ✅ Правильно
SELECT * FROM products;

-- ❌ Неправильно (SQLite будет ждать завершения)
SELECT * FROM products
.exit  -- это не сработает!
```

### 2. Если забыли точку с запятой:
- Нажмите `Ctrl+C` чтобы отменить текущую команду
- Затем введите команду заново с `;` или выполните `.exit`

### 3. Команды SQLite (с точкой) НЕ требуют точки с запятой:
```sql
.tables     -- правильно (без ;)
.schema     -- правильно (без ;)
.exit       -- правильно (без ;)
```

---

## 🚀 Быстрый старт

### Открыть базу данных:
```bash
cd ~/projects/pantera-mini-apps/astro-app
sqlite3 database/shop.db
```

Теперь вы внутри SQLite CLI (промпт `sqlite>`)

---

## 📋 Базовые команды

### Просмотр структуры

#### Все таблицы:
```sql
.tables
```

#### Структура таблицы:
```sql
.schema products
.schema product_variants
.schema carts
.schema cart_items
.schema orders
.schema order_items
```

#### Структура всех таблиц:
```sql
.schema
```

#### Подробная информация о колонках:
```sql
PRAGMA table_info(products);
```

---

### Настройка отображения

#### Включить заголовки колонок:
```sql
.headers on
```

#### Красивый режим таблицы:
```sql
.mode column
```

#### Вернуть обычный режим:
```sql
.mode list
.headers off
```

**Рекомендуется использовать:**
```sql
.headers on
.mode column
```

---

## 📊 Просмотр данных (SELECT)

### Простые запросы

#### Все товары:
```sql
SELECT * FROM products;
```

#### Товары с форматированием:
```sql
.headers on
.mode column
SELECT * FROM products;
```

#### Конкретные поля:
```sql
SELECT id, name, price FROM products;
```

#### Товар по ID:
```sql
SELECT * FROM products WHERE id = 1;
```

#### Только активные товары:
```sql
SELECT * FROM products WHERE active = 1;
```

#### Количество товаров:
```sql
SELECT COUNT(*) FROM products;
```

---

### Сложные запросы (JOIN)

#### Товары с их размерами:
```sql
SELECT 
  p.id,
  p.name,
  p.price,
  p.collection_name,
  pv.size,
  pv.stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.id, pv.size;
```

#### Все размеры конкретного товара:
```sql
SELECT 
  products.name,
  product_variants.size,
  product_variants.stock
FROM products
JOIN product_variants ON products.id = product_variants.product_id
WHERE products.id = 1;
```

#### Товары в корзине (если есть):
```sql
SELECT 
  p.name,
  p.price,
  ci.size,
  ci.quantity
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.cart_id = 1;
```

---

## ➕ Добавление данных (INSERT)

### Добавление товара

#### Базовый пример:
```sql
INSERT INTO products (name, description, price, image_url, collection_name, active)
VALUES ('Футболка Pantera - Черная', 'Классическая черная футболка', 1500, '/images/black.jpg', 'Pantera Collection', 1);
```

**Важно:** После выполнения запомните `id` товара (он будет показан, или используйте `SELECT last_insert_rowid();`)

#### Добавление товара с получением ID:
```sql
-- Добавляем товар
INSERT INTO products (name, description, price, image_url, collection_name, active)
VALUES ('Футболка Pantera - Белая', 'Белая футболка с логотипом', 1500, '/images/white.jpg', 'Pantera Collection', 1);

-- Получаем ID добавленного товара
SELECT last_insert_rowid();
```

---

### Добавление размеров (вариантов товара)

После добавления товара, добавьте его размеры. **Важно:** `product_id` должен существовать!

```sql
-- Предположим, что товар имеет id = 1
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'S', 10);
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'M', 15);
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'L', 12);
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'XL', 8);
```

#### Проверка:
```sql
SELECT * FROM product_variants WHERE product_id = 1;
```

---

### Полный пример добавления товара с размерами

```sql
-- 1. Добавляем товар
INSERT INTO products (name, description, price, image_url, collection_name, active)
VALUES ('Футболка Pantera - Красная', 'Яркая красная футболка', 1500, '/images/red.jpg', 'Pantera Collection', 1);

-- 2. Получаем ID (предположим это 2)
-- Или запоминаем ID из вывода предыдущей команды

-- 3. Добавляем размеры (замените 2 на реальный ID)
INSERT INTO product_variants (product_id, size, stock) VALUES (2, 'S', 5);
INSERT INTO product_variants (product_id, size, stock) VALUES (2, 'M', 12);
INSERT INTO product_variants (product_id, size, stock) VALUES (2, 'L', 10);
INSERT INTO product_variants (product_id, size, stock) VALUES (2, 'XL', 6);

-- 4. Проверяем результат
.headers on
.mode column
SELECT 
  p.id,
  p.name,
  p.price,
  pv.size,
  pv.stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = 2;
```

---

## ✏️ Обновление данных (UPDATE)

### Обновление товара

#### Изменить цену:
```sql
UPDATE products SET price = 2000 WHERE id = 1;
```

#### Изменить название:
```sql
UPDATE products SET name = 'Новое название' WHERE id = 1;
```

#### Изменить название коллекции для всех товаров:
```sql
UPDATE products SET collection_name = 'Pantera Collection 2024';
```

#### Изменить несколько полей:
```sql
UPDATE products 
SET price = 1800, description = 'Новое описание' 
WHERE id = 1;
```

### Обновление размеров

#### Изменить остаток размера:
```sql
UPDATE product_variants 
SET stock = 20 
WHERE product_id = 1 AND size = 'M';
```

#### Изменить остаток всех размеров товара:
```sql
UPDATE product_variants 
SET stock = stock + 10 
WHERE product_id = 1;
```

---

## 🗑️ Удаление данных (DELETE)

### Удаление товара

```sql
DELETE FROM products WHERE id = 1;
```

**Важно:** Благодаря `ON DELETE CASCADE`, все связанные размеры (`product_variants`) удалятся автоматически!

### Удаление размера

```sql
DELETE FROM product_variants WHERE id = 1;
```

Или:
```sql
DELETE FROM product_variants WHERE product_id = 1 AND size = 'XL';
```

### Очистка всех данных (ОСТОРОЖНО!)

```sql
-- Удалить все товары (и их размеры автоматически)
DELETE FROM products;

-- Удалить все размеры
DELETE FROM product_variants;

-- Удалить все корзины (и товары в них)
DELETE FROM carts;
```

---

## 🔍 Полезные запросы для работы

### Проверка что таблица пуста:
```sql
SELECT COUNT(*) as count FROM products;
-- Если count = 0, таблица пуста
```

### Посмотреть последний добавленный товар:
```sql
SELECT * FROM products ORDER BY id DESC LIMIT 1;
```

### Посмотреть товары с общим количеством размеров:
```sql
SELECT 
  p.id,
  p.name,
  p.price,
  COUNT(pv.id) as variants_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;
```

### Посмотреть товары с общей суммой остатков:
```sql
SELECT 
  p.id,
  p.name,
  SUM(pv.stock) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;
```

### Поиск товаров:
```sql
-- По названию
SELECT * FROM products WHERE name LIKE '%Черная%';

-- По коллекции
SELECT * FROM products WHERE collection_name = 'Pantera Collection';
```

---

## 🛠️ Практические сценарии

### Сценарий 1: Добавить новый товар с размерами

```sql
-- Включить красивое отображение
.headers on
.mode column

-- 1. Добавить товар
INSERT INTO products (name, description, price, image_url, collection_name, active)
VALUES ('Футболка Pantera - Синяя', 'Синяя футболка', 1500, '/images/blue.jpg', 'Pantera Collection', 1);

-- 2. Узнать ID (замените на реальный)
-- Например, если это первый товар, id = 1

-- 3. Добавить размеры
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'S', 10);
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'M', 15);
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'L', 12);
INSERT INTO product_variants (product_id, size, stock) VALUES (1, 'XL', 8);

-- 4. Проверить результат
SELECT 
  p.id,
  p.name,
  p.price,
  p.collection_name,
  pv.size,
  pv.stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = 1;
```

### Сценарий 2: Обновить остатки после продажи

```sql
-- Продали 3 футболки размера M товара с id=1
UPDATE product_variants 
SET stock = stock - 3 
WHERE product_id = 1 AND size = 'M';

-- Проверить новый остаток
SELECT * FROM product_variants WHERE product_id = 1 AND size = 'M';
```

### Сценарий 3: Изменить цену на все товары коллекции

```sql
UPDATE products 
SET price = 1800 
WHERE collection_name = 'Pantera Collection';

-- Проверить
SELECT name, price, collection_name FROM products;
```

### Сценарий 4: Посмотреть статистику по товарам

```sql
.headers on
.mode column

-- Все товары с их размерами и остатками
SELECT 
  p.id,
  p.name,
  p.price,
  p.collection_name,
  pv.size,
  pv.stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.id, pv.size;

-- Итоговая статистика
SELECT 
  COUNT(DISTINCT p.id) as total_products,
  COUNT(pv.id) as total_variants,
  SUM(pv.stock) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id;
```

---

## 🚪 Выход из SQLite CLI

```sql
.exit
```

или

```sql
.quit
```

или просто нажмите `Ctrl+D`

---

## ⚠️ Частые ошибки и решения

### Ошибка: "unable to open database file"
**Причина:** Неправильный путь к файлу  
**Решение:** Убедитесь что вы в папке `astro-app`:
```bash
cd ~/projects/pantera-mini-apps/astro-app
sqlite3 database/shop.db
```

### Ошибка: Команда не завершается
**Причина:** Забыли точку с запятой `;`  
**Решение:** Нажмите `Ctrl+C`, затем добавьте `;` к команде

### Ошибка: "FOREIGN KEY constraint failed"
**Причина:** Пытаетесь добавить размер для несуществующего товара  
**Решение:** Сначала добавьте товар, затем его размеры

### Ошибка: ".exit не работает"
**Причина:** Команда SQL не завершена точкой с запятой  
**Решение:** Нажмите `Ctrl+C`, затем `.exit`

---

## 💡 Рекомендации для разработки

1. **Всегда используйте `.headers on` и `.mode column`** для удобного просмотра
2. **После INSERT** используйте `SELECT last_insert_rowid();` чтобы узнать ID
3. **Проверяйте данные** после каждого изменения командой `SELECT`
4. **Используйте транзакции** для нескольких связанных операций (если нужно)
5. **Делайте резервные копии** базы данных:
   ```bash
   cp database/shop.db database/shop.db.backup
   ```

---

## 📚 Дополнительные команды

### Выполнить SQL из файла:
```bash
sqlite3 database/shop.db < script.sql
```

### Выполнить одну команду без входа в CLI:
```bash
sqlite3 database/shop.db "SELECT * FROM products;"
```

### Экспорт в CSV:
```bash
sqlite3 database/shop.db <<EOF
.headers on
.mode csv
.output products.csv
SELECT * FROM products;
.quit
EOF
```

### Создать резервную копию:
```bash
sqlite3 database/shop.db ".backup database/shop.db.backup"
```
