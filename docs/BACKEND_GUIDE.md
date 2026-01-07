# Руководство для бекендера

Это руководство объясняет структуру бекенда проекта Pantera Mini Apps, фокусируясь на папках `src/lib/` и `src/pages/api/`.

---

## 📁 Структура бекенда

```
astro-app/src/
├── lib/              # Библиотеки и функции для работы с БД
│   ├── db.js         # Подключение к SQLite
│   ├── products.ts   # Функции для работы с товарами
│   ├── cart.ts       # Функции для работы с корзиной
│   ├── logger.js     # Логирование
│   └── types.ts      # TypeScript типы
└── pages/api/        # API endpoints (Astro file-based routing)
    ├── products/     # Products API
    ├── cart/         # Cart API
    └── orders/       # Orders API (будущее)
```

---

## 📚 Папка `src/lib/` - Библиотеки

Папка `lib/` содержит функции для работы с базой данных и утилиты. Это **бизнес-логика**, которая не зависит от HTTP запросов.

### `db.js` - Подключение к базе данных

**Назначение:** Создает и экспортирует подключение к SQLite базе данных.

```javascript
// src/lib/db.js
import Database from 'better-sqlite3';

const db = new Database('database/shop.db');
db.pragma('foreign_keys = ON'); // Включаем внешние ключи

export default db;
```

**Использование:**
```javascript
import db from '@/lib/db.js';

// Выполнить SQL запрос
const products = db.prepare('SELECT * FROM products').all();
```

**Важно:**
- ✅ Используйте `db.prepare()` для всех SQL запросов (защита от SQL инъекций)
- ✅ Всегда используйте prepared statements с параметрами: `db.prepare('SELECT * FROM products WHERE id = ?').get(id)`
- ✅ Для транзакций используйте `db.transaction()`

---

### `products.ts` - Функции для товаров

**Назначение:** Функции для работы с товарами из базы данных.

**Основные функции:**

```typescript
// Получить все активные товары
getAllProducts(): Product[]

// Получить товар по ID
getProductById(id: number): Product | null

// Получить варианты товара (размеры)
getProductVariants(productId: number): ProductVariant[]
```

**Пример использования:**
```javascript
import { getAllProducts, getProductById } from '@/lib/products.js';

// В API endpoint
const products = getAllProducts();
const product = getProductById(1);
```

**Особенности:**
- ✅ Использует TypeScript для типизации
- ✅ Все функции работают с SQLite через `db.prepare()`
- ✅ Автоматически объединяет данные из `products` и `product_variants` (JOIN)
- ✅ Логирует ошибки через `logger`

---

### `cart.ts` - Функции для корзины

**Назначение:** Функции для работы с корзиной пользователя.

**Основные функции:**

```typescript
// Получить или создать корзину
getOrCreateCart(telegramUserId: string): CartRow

// Получить корзину с элементами
getCart(telegramUserId: string): Cart | null

// Добавить товар в корзину
addCartItem(telegramUserId: string, productId: number, variantId: number, quantity: number): CartItem

// Обновить количество товара
updateCartItem(itemId: number, quantity: number): boolean

// Удалить товар из корзины
deleteCartItem(itemId: number): boolean

// Очистить корзину
clearCart(telegramUserId: string): boolean
```

**Пример использования:**
```javascript
import { getCart, addCartItem } from '@/lib/cart.js';

// Получить корзину
const cart = getCart('123456789');

// Добавить товар
const item = addCartItem('123456789', 1, 5, 2); // user_id, product_id, variant_id, quantity
```

**Особенности:**
- ✅ Автоматически создает корзину, если её нет
- ✅ Проверяет наличие товара на складе перед добавлением
- ✅ Использует транзакции для сложных операций
- ✅ Логирует все операции

---

### `logger.js` - Логирование

**Назначение:** Централизованное логирование для всего приложения.

**Уровни логирования:**
```javascript
import { logger } from '@/lib/logger.js';

logger.error('Ошибка', { context });
logger.warn('Предупреждение', { context });
logger.info('Информация', { context });
logger.debug('Отладка', { context });
```

**Где хранятся логи:**
- `astro-app/logs/YYYY-MM-DD-combined.log` - все логи
- `astro-app/logs/YYYY-MM-DD-error.log` - только ошибки

**Пример:**
```javascript
try {
  const cart = getCart(userId);
  logger.info('Корзина получена', { telegram_user_id: userId, items_count: cart.items.length });
} catch (error) {
  logger.error('Ошибка при получении корзины', {
    telegram_user_id: userId,
    error: error.message,
    stack: error.stack
  });
}
```

---

### `types.ts` - TypeScript типы

**Назначение:** Определение типов для TypeScript.

**Основные типы:**
```typescript
// Товар
interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
  collection_name: string;
  variants: ProductVariant[];
}

// Вариант товара (размер)
interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  stock: number;
  price: number;
}

// Корзина
interface Cart {
  id: number;
  telegram_user_id: string;
  items: CartItem[];
}

// Элемент корзины
interface CartItem {
  id: number;
  product_id: number;
  variant_id: number;
  size: string;
  quantity: number;
  price: number;
  product_name: string;
}
```

**Использование:**
```typescript
import type { Product, Cart } from '@/lib/types.js';

function getProduct(): Product | null {
  // ...
}
```

---

## 🌐 Папка `src/pages/api/` - API Endpoints

В Astro используется **file-based routing** - файлы в `src/pages/api/` автоматически становятся API endpoints.

### Структура API

```
src/pages/api/
├── products/
│   ├── index.js          # GET /api/products
│   └── [id].js           # GET /api/products/:id
├── cart.js               # GET /api/cart, DELETE /api/cart
└── cart/
    └── items/
        ├── index.js      # POST /api/cart/items
        └── [id].js       # PUT /api/cart/items/:id, DELETE /api/cart/items/:id
```

### Как работают API endpoints

**Базовый пример:**
```javascript
// src/pages/api/products/index.js
import { getAllProducts } from '@/lib/products.js';

export async function GET() {
  const products = getAllProducts();
  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**С параметрами:**
```javascript
// src/pages/api/products/[id].js
export async function GET(context) {
  const id = parseInt(context.params.id);
  const product = getProductById(id);
  
  if (!product) {
    return new Response(JSON.stringify({ error: 'Товар не найден' }), {
      status: 404
    });
  }
  
  return new Response(JSON.stringify(product), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**С query параметрами:**
```javascript
// src/pages/api/cart.js
export async function GET(context) {
  const url = new URL(context.request.url);
  const telegramUserId = url.searchParams.get('telegram_user_id');
  
  if (!telegramUserId) {
    return new Response(JSON.stringify({ error: 'Не указан telegram_user_id' }), {
      status: 400
    });
  }
  
  const cart = getCart(telegramUserId);
  return new Response(JSON.stringify(cart), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**POST запрос:**
```javascript
// src/pages/api/cart/items/index.js
export async function POST(context) {
  const body = await context.request.json();
  const { telegram_user_id, product_id, variant_id, quantity } = body;
  
  try {
    const item = addCartItem(telegram_user_id, product_id, variant_id, quantity);
    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }
}
```

---

## 🔄 Взаимодействие между lib и api

### Принцип разделения ответственности

1. **`lib/`** - бизнес-логика (работа с БД, валидация, вычисления)
2. **`api/`** - HTTP слой (обработка запросов, валидация параметров, форматирование ответов)

### Пример полного потока

**Запрос:** `POST /api/cart/items`

```javascript
// 1. API endpoint получает запрос
// src/pages/api/cart/items/index.js
export async function POST(context) {
  // 2. Парсим тело запроса
  const body = await context.request.json();
  const { telegram_user_id, product_id, variant_id, quantity } = body;
  
  // 3. Валидация параметров (API слой)
  if (!telegram_user_id || !product_id || !variant_id || !quantity) {
    return new Response(JSON.stringify({ error: 'Не все параметры указаны' }), {
      status: 400
    });
  }
  
  try {
    // 4. Вызываем функцию из lib/ (бизнес-логика)
    const item = addCartItem(telegram_user_id, product_id, variant_id, quantity);
    
    // 5. Логируем успех
    logger.info('Товар добавлен в корзину', {
      cart_item_id: item.id,
      telegram_user_id
    });
    
    // 6. Возвращаем ответ
    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // 7. Обработка ошибок
    logger.error('Ошибка при добавлении товара', {
      telegram_user_id,
      error: error.message
    });
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }
}
```

**Функция в lib/ выполняет:**
```typescript
// src/lib/cart.ts
export function addCartItem(telegramUserId: string, productId: number, variantId: number, quantity: number) {
  // 1. Получить или создать корзину
  const cart = getOrCreateCart(telegramUserId);
  
  // 2. Проверить наличие товара на складе
  const variant = getProductVariantById(variantId);
  if (variant.stock < quantity) {
    throw new Error('Недостаточно товара на складе');
  }
  
  // 3. Добавить товар в корзину (SQL INSERT)
  const result = db.prepare(`
    INSERT INTO cart_items (cart_id, product_id, variant_id, size, quantity)
    VALUES (?, ?, ?, ?, ?)
  `).run(cart.id, productId, variantId, variant.size, quantity);
  
  // 4. Вернуть созданный элемент
  return getCartItemById(result.lastInsertRowid);
}
```

---

## 📝 Рекомендации для разработки

### 1. Всегда используйте функции из `lib/`

**❌ Плохо:**
```javascript
// В API endpoint
const products = db.prepare('SELECT * FROM products').all();
```

**✅ Хорошо:**
```javascript
// В API endpoint
import { getAllProducts } from '@/lib/products.js';
const products = getAllProducts();
```

### 2. Валидация на двух уровнях

- **API слой** - проверка наличия параметров, типов
- **Lib слой** - проверка бизнес-правил (наличие товара, остатки)

### 3. Обработка ошибок

```javascript
try {
  const result = someFunction();
  logger.info('Операция успешна', { context });
  return new Response(JSON.stringify(result), { status: 200 });
} catch (error) {
  logger.error('Ошибка операции', {
    error: error.message,
    stack: error.stack,
    context
  });
  
  return new Response(JSON.stringify({ 
    error: 'Не удалось выполнить операцию',
    message: error.message 
  }), {
    status: 400 // или 500 в зависимости от типа ошибки
  });
}
```

### 4. Логирование

- ✅ Логируйте все важные операции (добавление в корзину, создание заказа)
- ✅ Логируйте все ошибки с контекстом
- ✅ Используйте разные уровни (error, warn, info, debug)

### 5. Типизация

- ✅ Используйте TypeScript типы из `types.ts`
- ✅ Типизируйте функции в `lib/*.ts`
- ✅ В API endpoints можно использовать JSDoc для типизации

---

## 🚀 Быстрый старт для нового endpoint

### Шаг 1: Создать функцию в `lib/`

```typescript
// src/lib/orders.ts
export function createOrder(telegramUserId: string, orderData: OrderData): Order {
  // Бизнес-логика создания заказа
  // ...
}
```

### Шаг 2: Создать API endpoint

```javascript
// src/pages/api/orders/index.js
import { createOrder } from '@/lib/orders.js';
import { logger } from '@/lib/logger.js';

export async function POST(context) {
  try {
    const body = await context.request.json();
    const order = createOrder(body.telegram_user_id, body);
    
    logger.info('Заказ создан', { order_id: order.id });
    
    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('Ошибка при создании заказа', { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }
}
```

---

## 📚 Дополнительные ресурсы

- [README.md](./README.md) - общая документация проекта
- [HOW_TO_USE_SQL.md](./HOW_TO_USE_SQL.md) - работа с SQL
- [LOGGER_USAGE.md](./LOGGER_USAGE.md) - подробное руководство по логированию
- [TYPES_AND_IMPORTS_GUIDE.md](./TYPES_AND_IMPORTS_GUIDE.md) - типизация и импорты

---

**Дата обновления:** 2026-01-06

