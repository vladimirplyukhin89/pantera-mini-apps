# Объяснение столбцов таблицы product_variants

## Структура таблицы product_variants

```sql
CREATE TABLE product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price REAL,  -- цена зависит от размера!
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, size)
);
```

---

## Пояснение каждого столбца

### 1. `id INTEGER PRIMARY KEY AUTOINCREMENT`

**Что это:**
- Уникальный идентификатор каждого варианта товара (размера)
- Автоматически увеличивается при добавлении новой записи (1, 2, 3, 4...)

**Пример:**
```sql
-- Первый размер: id = 1
-- Второй размер: id = 2
-- И т.д.
```

**Зачем нужно:**
- Чтобы можно было ссылаться на конкретный размер (используется в `cart_items.variant_id`)
- Для быстрого поиска записей

---

### 2. `product_id INTEGER NOT NULL`

**Что это:**
- Ссылка на товар из таблицы `products`
- `NOT NULL` означает что это поле обязательно (не может быть пустым)

**Пример:**
```sql
-- Товар "Футболка Pantera - Черная" имеет id = 1
-- Все размеры этого товара будут иметь product_id = 1
```

**Зачем нужно:**
- Чтобы знать, к какому товару относится этот размер
- Связывает размер с товаром

**Визуализация:**
```
products:          product_variants:
id | name          id | product_id | size
1  | Футболка      1  | 1          | S    ← ссылается на товар id=1
                 2  | 1          | M    ← ссылается на товар id=1
                 3  | 1          | L    ← ссылается на товар id=1
                 4  | 1          | XL   ← ссылается на товар id=1
```

---

### 3. `stock INTEGER NOT NULL DEFAULT 0`

**Что это:**
- Количество товара на складе для данного размера
- `NOT NULL` - обязательно должно быть число (не может быть NULL)
- `DEFAULT 0` - если не указать, автоматически будет 0

**Пример:**
```sql
-- Размер S: stock = 10 (10 штук на складе)
-- Размер M: stock = 15 (15 штук на складе)
-- Размер L: stock = 0 (нет на складе)
```

**Зачем нужно:**
- Чтобы знать, сколько товара есть в наличии
- Для проверки наличия перед добавлением в корзину
- Для управления складом

---

### 4. `price REAL` (новое поле!)

**Что это:**
- Цена товара для данного размера
- `REAL` - тип данных для дробных чисел (подходит для цен)
- Может быть NULL (необязательное поле)

**Пример:**
```sql
-- Размер S: price = 3500 руб
-- Размер M: price = 3500 руб
-- Размер L: price = 3500 руб
-- Размер XL: price = 3700 руб (дороже!)
```

**Зачем нужно:**
- Цена зависит от размера (XL стоит дороже)
- Каждый размер может иметь свою цену

---

### 5. `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`

**Что это:**
- **FOREIGN KEY** - внешний ключ (связь с другой таблицей)
- `product_id` должен существовать в таблице `products`
- `ON DELETE CASCADE` - при удалении товара, все его размеры удаляются автоматически

**Пример:**

✅ **Правильно:**
```sql
-- Сначала добавляем товар
INSERT INTO products (name, price) VALUES ('Футболка', 3500);

-- Затем добавляем размер (product_id = 1 существует)
INSERT INTO product_variants (product_id, size) VALUES (1, 'M');
```

❌ **Неправильно:**
```sql
-- Попытка добавить размер для несуществующего товара
INSERT INTO product_variants (product_id, size) VALUES (999, 'M');
-- Ошибка: FOREIGN KEY constraint failed
```

**ON DELETE CASCADE в действии:**
```sql
-- Удаляем товар
DELETE FROM products WHERE id = 1;

-- Автоматически удалятся ВСЕ размеры этого товара!
-- Не нужно удалять их вручную
```

**Зачем нужно:**
- Защита от "осиротевших" записей (размеров без товара)
- Автоматическая очистка при удалении товара
- Целостность данных

---

### 6. `UNIQUE(product_id, size)`

**Что это:**
- Ограничение уникальности на комбинацию `(product_id, size)`
- Один товар не может иметь два одинаковых размера

**Пример:**

✅ **Правильно:**
```sql
-- Товар 1 может иметь размеры S, M, L, XL
INSERT INTO product_variants (product_id, size) VALUES (1, 'S');
INSERT INTO product_variants (product_id, size) VALUES (1, 'M');
INSERT INTO product_variants (product_id, size) VALUES (1, 'L');
INSERT INTO product_variants (product_id, size) VALUES (1, 'XL');
```

❌ **Неправильно:**
```sql
-- Нельзя добавить размер S дважды для одного товара
INSERT INTO product_variants (product_id, size) VALUES (1, 'S');
INSERT INTO product_variants (product_id, size) VALUES (1, 'S');  -- Ошибка!
-- Ошибка: UNIQUE constraint failed
```

✅ **Но разные товары могут иметь одинаковые размеры:**
```sql
-- Товар 1, размер S - OK
INSERT INTO product_variants (product_id, size) VALUES (1, 'S');

-- Товар 2, размер S - OK (это другой товар!)
INSERT INTO product_variants (product_id, size) VALUES (2, 'S');
```

**Зачем нужно:**
- Защита от дублирования размеров
- Один размер = одна запись для каждого товара
- Предотвращает ошибки данных

---

## Полный пример с пояснениями

```sql
-- Товар "Футболка Pantera - Черная"
INSERT INTO products (name, description, price, image_url, collection_name)
VALUES ('Футболка Pantera - Черная', 'Черная футболка', 3500, '/images/black.jpg', 'Pantera Collection');
-- product_id будет 1 (автоматически)

-- Размеры этого товара:
INSERT INTO product_variants (product_id, size, stock, price)
VALUES (1, 'S', 10, 3500);   -- размер S, 10 шт, цена 3500
-- id = 1, product_id = 1 (ссылка на товар), size = 'S'

INSERT INTO product_variants (product_id, size, stock, price)
VALUES (1, 'M', 15, 3500);   -- размер M, 15 шт, цена 3500
-- id = 2, product_id = 1 (тот же товар!), size = 'M'

INSERT INTO product_variants (product_id, size, stock, price)
VALUES (1, 'L', 12, 3500);   -- размер L, 12 шт, цена 3500
-- id = 3, product_id = 1 (тот же товар!), size = 'L'

INSERT INTO product_variants (product_id, size, stock, price)
VALUES (1, 'XL', 8, 3700);   -- размер XL, 8 шт, цена 3700 (дороже!)
-- id = 4, product_id = 1 (тот же товар!), size = 'XL'
```

**Результат в таблице product_variants:**
```
id | product_id | size | stock | price
---|------------|------|-------|-------
1  | 1          | S    | 10    | 3500
2  | 1          | M    | 15    | 3500
3  | 1          | L    | 12    | 3500
4  | 1          | XL   | 8     | 3700
```

Все записи ссылаются на `product_id = 1` (один товар), но имеют разные размеры и цены!

---

## Резюме

| Столбец | Назначение | Важно |
|---------|------------|-------|
| `id` | Уникальный идентификатор размера | Автоматически создается |
| `product_id` | Ссылка на товар | ОБЯЗАТЕЛЬНО, должен существовать в products |
| `size` | Размер товара (S, M, L, XL...) | ОБЯЗАТЕЛЬНО |
| `stock` | Остаток на складе | ОБЯЗАТЕЛЬНО, по умолчанию 0 |
| `price` | Цена для этого размера | Необязательно (может быть NULL) |
| `FOREIGN KEY` | Защита целостности данных | Автоматически проверяется |
| `UNIQUE` | Защита от дублей | Один размер = одна запись |

