# Этап 2: Products API - Объяснение

## Что было создано

### 1. `src/lib/products.js` - Функции для работы с товарами

Этот файл содержит функции для работы с базой данных. Они используют SQL запросы для получения данных.

#### `getAllProducts()`
Получает все активные товары из БД.

**Как работает:**
1. Выполняет SQL запрос `SELECT * FROM products WHERE active = 1`
2. Для каждого товара получает его варианты (размеры) через `getProductVariants()`
3. Возвращает массив товаров с их вариантами

**SQL запрос:**
```sql
SELECT 
  p.id,
  p.name,
  p.description,
  p.image_url,
  p.collection_name,
  p.active,
  p.created_at,
  p.updated_at
FROM products p
WHERE p.active = 1
ORDER BY p.id
```

#### `getProductById(id)`
Получает один товар по его ID.

**Как работает:**
1. Выполняет SQL запрос `SELECT * FROM products WHERE id = ?`
2. Если товар не найден, возвращает `null`
3. Получает варианты (размеры) для этого товара
4. Возвращает товар с вариантами

**SQL запрос:**
```sql
SELECT * FROM products WHERE id = ?
```

#### `getProductVariants(productId)`
Получает все варианты (размеры) для товара.

**Как работает:**
1. Выполняет SQL запрос `SELECT * FROM product_variants WHERE product_id = ?`
2. Сортирует размеры в правильном порядке (XS, S, M, L, XL)
3. Возвращает массив вариантов с размерами, остатками и ценами

**SQL запрос:**
```sql
SELECT 
  id,
  size,
  stock,
  price
FROM product_variants
WHERE product_id = ?
ORDER BY 
  CASE size
    WHEN 'XS' THEN 1
    WHEN 'S' THEN 2
    WHEN 'M' THEN 3
    WHEN 'L' THEN 4
    WHEN 'XL' THEN 5
    WHEN 'XXL' THEN 6
    ELSE 7
  END
```

**Почему CASE в ORDER BY?**
Чтобы размеры сортировались правильно (XS → S → M → L → XL), а не по алфавиту (L → M → S → XL → XS).

---

### 2. API Endpoints

В Astro API endpoints создаются в папке `src/pages/api/`. Файловая структура определяет URL маршруты.

#### `src/pages/api/products/index.js` - GET /api/products

**Что делает:**
- Обрабатывает GET запросы на `/api/products`
- Возвращает все активные товары в формате JSON

**Структура:**
```javascript
export async function GET() {
  // 1. Получаем товары через функцию из lib/products.js
  const products = getAllProducts();
  
  // 2. Возвращаем JSON ответ
  return new Response(JSON.stringify(products), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

**Как тестировать:**
```bash
# В браузере или через curl
curl http://localhost:4321/api/products
```

#### `src/pages/api/products/[id].js` - GET /api/products/:id

**Что делает:**
- Обрабатывает GET запросы на `/api/products/2`, `/api/products/3` и т.д.
- Возвращает один товар по ID

**Структура:**
```javascript
export async function GET(context) {
  // 1. Получаем ID из параметров URL
  const id = parseInt(context.params.id);
  
  // 2. Валидация: проверяем что ID - число
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Неверный ID' }), {
      status: 400,
    });
  }
  
  // 3. Получаем товар
  const product = getProductById(id);
  
  // 4. Если товар не найден - возвращаем 404
  if (!product) {
    return new Response(JSON.stringify({ error: 'Товар не найден' }), {
      status: 404,
    });
  }
  
  // 5. Возвращаем товар
  return new Response(JSON.stringify(product), {
    status: 200,
  });
}
```

**Как тестировать:**
```bash
# Получить товар с ID 2
curl http://localhost:4321/api/products/2

# Получить товар с ID 999 (не существует - вернется 404)
curl http://localhost:4321/api/products/999
```

---

## Важные концепции

### 1. Prepared Statements (защита от SQL инъекций)

**❌ Небезопасно:**
```javascript
const query = `SELECT * FROM products WHERE id = ${id}`;
```

**✅ Безопасно (используем мы):**
```javascript
const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
```

`?` - это плейсхолдер. SQLite автоматически экранирует значение, защищая от SQL инъекций.

### 2. HTTP Status Codes

- **200 OK** - успешный запрос
- **400 Bad Request** - неверные параметры (например, ID не число)
- **404 Not Found** - ресурс не найден (товар не существует)
- **500 Internal Server Error** - ошибка на сервере

### 3. JSON Responses

Все API endpoints возвращают данные в формате JSON:
```json
{
  "id": 2,
  "name": "Китайская пантера",
  "description": "Розовая футболка...",
  "variants": [
    {
      "id": 1,
      "size": "XS",
      "stock": 1,
      "price": 3500
    }
  ]
}
```

### 4. Обработка ошибок

Используем `try/catch` для перехвата ошибок:
```javascript
try {
  const products = getAllProducts();
  return new Response(JSON.stringify(products), { status: 200 });
} catch (error) {
  console.error('Ошибка:', error);
  return new Response(
    JSON.stringify({ error: 'Не удалось получить товары' }),
    { status: 500 }
  );
}
```

---

## Что дальше?

1. **Протестировать API endpoints** - запустить dev сервер и проверить работу
2. **Проверить данные** - убедиться что товары возвращаются правильно
3. **Изучить SQL JOIN** - понять как объединяются данные из разных таблиц

---

## Вопросы для проверки понимания

1. **Почему мы используем `?` в SQL запросах?**
   - Для защиты от SQL инъекций (prepared statements)

2. **Как работает динамический маршрут `[id].js`?**
   - Квадратные скобки `[id]` означают параметр маршрута
   - Доступ через `context.params.id`

3. **Зачем сортировать размеры через CASE?**
   - Чтобы размеры шли в правильном порядке (XS → S → M → L → XL), а не по алфавиту

4. **Почему `getProductVariants()` вызывается отдельно?**
   - Чтобы получить варианты для каждого товара
   - Можно было бы использовать JOIN, но это упрощает структуру данных

