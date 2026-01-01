# SQL JOIN - Объединение данных из разных таблиц

## Проблема

У нас есть две таблицы:
- **products** - товары (id, name, description, image_url...)
- **product_variants** - варианты товаров (product_id, size, stock, price...)

Они связаны через `product_variants.product_id = products.id`.

**Вопрос:** Как получить товар вместе со всеми его размерами одним запросом?

---

## Решение 1: Два отдельных запроса (текущий подход)

**Как работает сейчас в нашем коде:**

```javascript
// 1. Получаем товары
const products = db.prepare(`
  SELECT * FROM products WHERE active = 1
`).all();

// 2. Для каждого товара получаем его варианты
products.forEach(product => {
  const variants = db.prepare(`
    SELECT * FROM product_variants WHERE product_id = ?
  `).all(product.id);
  product.variants = variants;
});
```

**Плюсы:**
- ✅ Просто понять
- ✅ Легко структурировать данные (товар + массив вариантов)

**Минусы:**
- ⚠️ Много запросов к БД (1 запрос для товаров + N запросов для вариантов)
- ⚠️ Медленнее для большого количества товаров

---

## Решение 2: SQL JOIN (один запрос)

**JOIN объединяет данные из разных таблиц в один результат.**

### Типы JOIN:

1. **INNER JOIN** - только совпадающие записи
2. **LEFT JOIN** - все записи из левой таблицы + совпадающие из правой
3. **RIGHT JOIN** - все записи из правой таблицы + совпадающие из левой
4. **FULL JOIN** - все записи из обеих таблиц

---

## INNER JOIN - только совпадающие записи

**Синтаксис:**
```sql
SELECT 
  products.*,
  product_variants.*
FROM products
INNER JOIN product_variants ON products.id = product_variants.product_id
```

**Результат:**
```
id | name              | description | ... | variant_id | product_id | size | stock | price
---|-------------------|-------------|-----|------------|------------|------|-------|------
2  | Китайская пантера | Розовая...  | ... | 1          | 2          | XS   | 1     | 3500
2  | Китайская пантера | Розовая...  | ... | 2          | 2          | M    | 1     | 3500
2  | Китайская пантера | Розовая...  | ... | 3          | 2          | XL   | 1     | 3700
3  | Китайская пантера | Голубая...  | ... | 4          | 3          | M    | 1     | 3500
3  | Китайская пантера | Голубая...  | ... | 5          | 3          | XL   | 1     | 3700
```

**Что происходит:**
- Для товара с ID=2 есть 3 варианта → 3 строки в результате
- Для товара с ID=3 есть 2 варианта → 2 строки в результате
- **Внимание:** Данные товара дублируются в каждой строке!

**Проблема:** Если у товара 3 размера, данные товара повторятся 3 раза. Нужно группировать.

---

## LEFT JOIN - все товары, даже без вариантов

**Синтаксис:**
```sql
SELECT 
  products.*,
  product_variants.*
FROM products
LEFT JOIN product_variants ON products.id = product_variants.product_id
WHERE products.active = 1
```

**Результат:**
- Все товары из `products`
- Если у товара нет вариантов → поля из `product_variants` будут NULL

**Разница с INNER JOIN:**
- INNER JOIN: товары без вариантов НЕ попадут в результат
- LEFT JOIN: товары без вариантов попадут с NULL значениями

---

## Пример с нашими данными

Давайте посмотрим что вернет JOIN запрос:

```sql
SELECT 
  p.id,
  p.name,
  p.image_url,
  pv.size,
  pv.stock,
  pv.price
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.active = 1
ORDER BY p.id, pv.size;
```

**Результат:**
```
id | name              | image_url      | size | stock | price
---|-------------------|----------------|------|-------|------
2  | Китайская пантера | /images/pink.jpg | XS  | 1     | 3500
2  | Китайская пантера | /images/pink.jpg | M   | 1     | 3500
2  | Китайская пантера | /images/pink.jpg | XL  | 1     | 3700
3  | Китайская пантера | /images/blue.jpg | M   | 1     | 3500
3  | Китайская пантера | /images/blue.jpg | XL  | 1     | 3700
4  | Китайская пантера | /images/green.jpg | M  | 1     | 3500
5  | Китайская пантера | /images/black.jpg | M  | 1     | 3500
6  | Китайская пантера | /images/white.jpg | M  | 1     | 3500
```

**Проблема:** Товар с ID=2 повторяется 3 раза! Нужно преобразовать это в структуру:
```json
{
  "id": 2,
  "name": "Китайская пантера",
  "variants": [
    { "size": "XS", "stock": 1, "price": 3500 },
    { "size": "M", "stock": 1, "price": 3500 },
    { "size": "XL", "stock": 1, "price": 3700 }
  ]
}
```

---

## Как преобразовать результат JOIN в нужную структуру?

### Вариант 1: Группировка в JavaScript (рекомендуется)

```javascript
export function getAllProductsWithJoin() {
  // Один SQL запрос с JOIN
  const rows = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.description,
      p.image_url,
      p.collection_name,
      p.active,
      p.created_at,
      p.updated_at,
      pv.id as variant_id,
      pv.size,
      pv.stock,
      pv.price
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.active = 1
    ORDER BY p.id, 
      CASE pv.size
        WHEN 'XS' THEN 1
        WHEN 'S' THEN 2
        WHEN 'M' THEN 3
        WHEN 'L' THEN 4
        WHEN 'XL' THEN 5
        ELSE 6
      END
  `).all();

  // Группируем результаты по товару
  const productsMap = new Map();

  for (const row of rows) {
    // Если товара еще нет в Map - создаем
    if (!productsMap.has(row.id)) {
      productsMap.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        image_url: row.image_url,
        collection_name: row.collection_name,
        active: row.active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        variants: []
      });
    }

    // Если есть вариант (не NULL) - добавляем его
    if (row.variant_id) {
      const product = productsMap.get(row.id);
      product.variants.push({
        id: row.variant_id,
        size: row.size,
        stock: row.stock,
        price: row.price
      });
    }
  }

  // Преобразуем Map в массив
  return Array.from(productsMap.values());
}
```

**Как это работает:**
1. Один SQL запрос возвращает "плоский" результат (товар повторяется для каждого варианта)
2. В JavaScript группируем по `id` товара
3. Для каждого товара собираем массив вариантов
4. Возвращаем массив товаров с вариантами

---

## Сравнение подходов

### Текущий подход (два запроса):

```javascript
// Запрос 1: Получить товары
SELECT * FROM products WHERE active = 1
// Результат: 5 строк

// Запрос 2-6: Для каждого товара получить варианты
SELECT * FROM product_variants WHERE product_id = 2
SELECT * FROM product_variants WHERE product_id = 3
SELECT * FROM product_variants WHERE product_id = 4
SELECT * FROM product_variants WHERE product_id = 5
SELECT * FROM product_variants WHERE product_id = 6
// Результат: 8 строк всего

// Итого: 6 запросов к БД
```

### JOIN подход (один запрос):

```javascript
// Запрос 1: Получить товары с вариантами одним JOIN
SELECT ... FROM products 
LEFT JOIN product_variants ON ...
// Результат: 8 строк (товары повторяются)

// Группировка в JavaScript
// Итого: 1 запрос к БД + обработка в JS
```

**Вывод:** JOIN подход эффективнее для большого количества товаров (меньше запросов к БД).

---

## Практический пример: getProductById с JOIN

### Вариант с JOIN:

```javascript
export function getProductByIdWithJoin(id) {
  const rows = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.description,
      p.image_url,
      p.collection_name,
      p.active,
      pv.id as variant_id,
      pv.size,
      pv.stock,
      pv.price
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.id = ?
    ORDER BY 
      CASE pv.size
        WHEN 'XS' THEN 1
        WHEN 'S' THEN 2
        WHEN 'M' THEN 3
        WHEN 'L' THEN 4
        WHEN 'XL' THEN 5
        ELSE 6
      END
  `).all(id);

  if (rows.length === 0) {
    return null;
  }

  // Первая строка содержит данные товара (они повторяются в каждой строке)
  const firstRow = rows[0];
  const product = {
    id: firstRow.id,
    name: firstRow.name,
    description: firstRow.description,
    image_url: firstRow.image_url,
    collection_name: firstRow.collection_name,
    active: firstRow.active,
    variants: []
  };

  // Собираем варианты (игнорируем строки где variant_id = NULL)
  for (const row of rows) {
    if (row.variant_id) {
      product.variants.push({
        id: row.variant_id,
        size: row.size,
        stock: row.stock,
        price: row.price
      });
    }
  }

  return product;
}
```

---

## Когда использовать JOIN?

### Используйте JOIN когда:
- ✅ Нужно получить данные из нескольких таблиц
- ✅ Хотите уменьшить количество запросов к БД
- ✅ Работаете с большим количеством данных

### Используйте отдельные запросы когда:
- ✅ Нужна простая структура кода
- ✅ Данных немного (не критично для производительности)
- ✅ Хотите более явный код

---

## Другие примеры JOIN

### Получить товары в корзине с их данными:

```sql
SELECT 
  ci.id,
  ci.quantity,
  p.name,
  p.image_url,
  pv.size,
  pv.price
FROM cart_items ci
INNER JOIN products p ON ci.product_id = p.id
INNER JOIN product_variants pv ON ci.variant_id = pv.id
WHERE ci.cart_id = ?
```

### Получить заказы с товарами:

```sql
SELECT 
  o.id,
  o.order_number,
  o.total_amount,
  oi.product_name,
  oi.size,
  oi.quantity,
  oi.price
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.telegram_user_id = ?
```

---

## Резюме

1. **JOIN объединяет данные из разных таблиц** в один результат
2. **LEFT JOIN** - все записи из левой таблицы (products) + совпадающие из правой (variants)
3. **INNER JOIN** - только совпадающие записи (товары без вариантов не попадут)
4. **Результат JOIN** - "плоский" список, где товары повторяются для каждого варианта
5. **Нужна группировка** в JavaScript чтобы преобразовать в нужную структуру
6. **JOIN эффективнее** для большого количества данных (меньше запросов к БД)

---

## Вопросы для проверки

1. **В чем разница между INNER JOIN и LEFT JOIN?**
   - INNER JOIN: только совпадающие записи
   - LEFT JOIN: все записи из левой таблицы + совпадающие из правой

2. **Почему после JOIN товары повторяются?**
   - Каждый вариант товара создает отдельную строку
   - Данные товара дублируются в каждой строке

3. **Когда использовать JOIN, а когда отдельные запросы?**
   - JOIN: когда много данных, важна производительность
   - Отдельные запросы: когда код проще, данных немного

