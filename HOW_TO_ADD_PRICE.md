# Как работать с ценами в product_variants

## Проблема

Цена зависит от размера:
- Размеры S, M, L: **3500 рублей**
- Размер XL: **3700 рублей** (дороже)

## Решение

Добавлено поле `price` в таблицу `product_variants`. Теперь каждый размер имеет свою цену.

---

## Как добавить товар с ценами через SQLite CLI

```bash
cd ~/projects/pantera-mini-apps/astro-app
sqlite3 database/shop.db
```

### 1. Добавить товар

```sql
.headers on
.mode column

INSERT INTO products (name, description, image_url, collection_name, active)
VALUES ('Футболка Pantera - Черная', 'Черная футболка с логотипом', '/images/black.jpg', 'Pantera Collection', 1);

-- Проверяем ID (предположим это 1)
SELECT last_insert_rowid();
```

### 2. Добавить размеры с ценами

```sql
-- Размер S - цена 3500
INSERT INTO product_variants (product_id, size, stock, price) 
VALUES (1, 'S', 10, 3500);

-- Размер M - цена 3500
INSERT INTO product_variants (product_id, size, stock, price) 
VALUES (1, 'M', 15, 3500);

-- Размер L - цена 3500
INSERT INTO product_variants (product_id, size, stock, price) 
VALUES (1, 'L', 12, 3500);

-- Размер XL - цена 3700 (дороже!)
INSERT INTO product_variants (product_id, size, stock, price) 
VALUES (1, 'XL', 8, 3700);
```

### 3. Проверить результат

```sql
SELECT 
  p.name,
  pv.size,
  pv.stock,
  pv.price
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = 1;
```

**Результат:**
```
name                      | size | stock | price
--------------------------|------|-------|-------
Футболка Pantera - Черная | S    | 10    | 3500
Футболка Pantera - Черная | M    | 15    | 3500
Футболка Pantera - Черная | L    | 12    | 3500
Футболка Pantera - Черная | XL   | 8     | 3700
```

---

## Обновление цен для существующих размеров

Если у вас уже есть размеры без цен:

```sql
-- Установить цену 3500 для всех размеров кроме XL
UPDATE product_variants 
SET price = 3500 
WHERE size IN ('S', 'M', 'L');

-- Установить цену 3700 для размера XL
UPDATE product_variants 
SET price = 3700 
WHERE size = 'XL';

-- Проверить
SELECT size, price FROM product_variants;
```

---

## Что делать с полем price в таблице products?

Поле `price` в таблице `products` можно использовать как:

1. **Базовую цену** (для отображения в каталоге)
2. **Сделать NULL** (так как цена теперь в variants)
3. **Оставить как есть** (для обратной совместимости)

**Рекомендация:** Можно оставить для отображения в каталоге, но реальная цена берется из `product_variants.price` при выборе размера.

---

## Пример: Добавление второго товара

```sql
-- Товар 2
INSERT INTO products (name, description, image_url, collection_name, active)
VALUES ('Футболка Pantera - Белая', 'Белая футболка', '/images/white.jpg', 'Pantera Collection', 1);

-- Размеры (ID товара будет 2)
INSERT INTO product_variants (product_id, size, stock, price) VALUES (2, 'S', 8, 3500);
INSERT INTO product_variants (product_id, size, stock, price) VALUES (2, 'M', 20, 3500);
INSERT INTO product_variants (product_id, size, stock, price) VALUES (2, 'L', 15, 3500);
INSERT INTO product_variants (product_id, size, stock, price) VALUES (2, 'XL', 10, 3700);

-- Проверка всех товаров с ценами
SELECT 
  p.name,
  pv.size,
  pv.price,
  pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.id, pv.size;
```

