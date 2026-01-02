# Файловый роутинг в Astro - Объяснение

## Как работает роутинг в Astro?

В Astro **структура папок в `src/pages/` определяет URL маршруты**.

---

## Разница между файлом и папкой

### Вариант 1: Файл `api/products.js`

**Структура:**
```
src/pages/
  api/
    products.js  ← файл
```

**Результат:**
- URL: `/api/products`
- Это **статический маршрут** (один endpoint)

**Ограничение:**
- Нельзя создать вложенные маршруты типа `/api/products/:id`
- Для этого нужна **папка**

---

### Вариант 2: Папка `api/products/` с файлом `index.js`

**Структура:**
```
src/pages/
  api/
    products/
      index.js  ← файл в папке
```

**Результат:**
- URL: `/api/products` (тот же самый!)
- `index.js` в папке эквивалентен файлу с именем папки

**Преимущество:**
- Можно добавить другие файлы в эту папку
- Можно создать динамические маршруты

---

### Вариант 3: Папка `api/products/` с несколькими файлами (наш случай)

**Структура:**
```
src/pages/
  api/
    products/
      index.js      ← GET /api/products
      [id].js       ← GET /api/products/:id
```

**Результат:**
- `/api/products` → обрабатывается `index.js`
- `/api/products/2` → обрабатывается `[id].js` (id = 2)
- `/api/products/3` → обрабатывается `[id].js` (id = 3)

**Это то, что мы используем!**

---

## Правила файлового роутинга

### 1. Статические маршруты

**Файл:**
```
src/pages/about.astro → /about
src/pages/catalog.astro → /catalog
src/pages/api/products.js → /api/products
```

### 2. Динамические маршруты (параметры)

**Квадратные скобки `[]` в имени файла:**
```
src/pages/product/[id].astro → /product/1, /product/2, /product/123
src/pages/api/products/[id].js → /api/products/1, /api/products/2
```

**Доступ к параметру:**
```javascript
export async function GET(context) {
  const id = context.params.id;  // получаем значение из URL
  // /api/products/123 → id = "123"
}
```

### 3. index файлы

**`index.js` или `index.astro` создает маршрут с именем папки:**
```
src/pages/api/products/index.js → /api/products
src/pages/index.astro → /
```

### 4. Вложенные маршруты

**Папки создают вложенные маршруты:**
```
src/pages/api/products/[id].js → /api/products/:id
src/pages/api/cart/items.js → /api/cart/items
```

---

## Примеры структур

### Пример 1: Простой API endpoint

**Вариант A (файл):**
```
src/pages/api/status.js
```
→ `/api/status`

**Вариант B (папка + index):**
```
src/pages/api/status/index.js
```
→ `/api/status` (тот же результат!)

**Выбор:** Неважно, но файл проще если только один endpoint.

---

### Пример 2: API с динамическими маршрутами (наш случай)

**Структура:**
```
src/pages/api/products/
  index.js      → GET /api/products
  [id].js       → GET /api/products/:id
```

**Почему нужна папка?**
- Если бы был только `api/products.js` → можно создать только `/api/products`
- Чтобы добавить `/api/products/:id` → нужна папка `api/products/` + файл `[id].js`

---

### Пример 3: Много маршрутов для одного ресурса

**Структура:**
```
src/pages/api/products/
  index.js      → GET /api/products
  [id].js       → GET /api/products/:id
  [id]/variants.js → GET /api/products/:id/variants
```

**Все маршруты для продуктов в одной папке!**

---

## Сравнение подходов

### Для одного endpoint:

**Файл (проще):**
```
api/products.js → /api/products
```

**Папка (то же самое):**
```
api/products/index.js → /api/products
```

**Выбор:** Файл проще, если только один endpoint.

---

### Для нескольких endpoints:

**Только файлы (не работает):**
```
api/products.js → /api/products
api/products-id.js → /api/products-id (❌ не то что нужно!)
```

**Папка (правильно):**
```
api/products/
  index.js → /api/products
  [id].js → /api/products/:id ✅
```

**Выбор:** Обязательно папка!

---

## Наша структура

```
src/pages/api/products/
├── index.js    → GET /api/products (все товары)
└── [id].js     → GET /api/products/:id (товар по ID)
```

**Почему папка, а не файл?**
- Потому что у нас **два маршрута** для продуктов:
  1. Список всех товаров (`/api/products`)
  2. Один товар по ID (`/api/products/:id`)

**Если бы был только один маршрут** `/api/products`, можно было бы использовать файл:
```
api/products.js → /api/products
```

Но для второго маршрута `/api/products/:id` нужна папка!

---

## Другие примеры

### Корзина (если сделаем так):

```
src/pages/api/cart/
  index.js          → GET /api/cart
  items.js          → GET /api/cart/items
  items/[id].js     → PUT /api/cart/items/:id, DELETE /api/cart/items/:id
```

Или проще:

```
src/pages/api/cart.js           → GET /api/cart
src/pages/api/cart/items.js     → POST /api/cart/items
src/pages/api/cart/items/[id].js → PUT, DELETE /api/cart/items/:id
```

---

## Резюме

| Сценарий | Используем | Пример |
|----------|-----------|--------|
| Один endpoint | Файл | `api/status.js` → `/api/status` |
| Несколько endpoints для одного ресурса | Папка | `api/products/index.js` + `[id].js` |
| Динамические маршруты | Папка с `[]` | `api/products/[id].js` → `/api/products/:id` |

**Наш случай:**
- Папка `api/products/` нужна, потому что у нас **два маршрута**:
  - `/api/products` (index.js)
  - `/api/products/:id` ([id].js)

**Если бы был только `/api/products`** → можно использовать файл `api/products.js`

---

## Вопросы для проверки

1. **Что создаст маршрут `/api/products`?**
   - `api/products.js` ИЛИ `api/products/index.js`

2. **Можно ли создать `/api/products/:id` используя только файл?**
   - Нет, нужна папка `api/products/` + файл `[id].js`

3. **Зачем нам папка `api/products/` вместо файла `api/products.js`?**
   - Чтобы добавить второй маршрут `/api/products/:id` с файлом `[id].js`

