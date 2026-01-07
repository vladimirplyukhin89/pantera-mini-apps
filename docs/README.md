# Документация проекта Pantera Mini Apps

Telegram Mini App для продажи футболок зала бокса. Приложение построено на Astro с использованием SQLite для хранения данных.

## 📚 Содержание

- [План проекта](#план-проекта)
- [Архитектура](#архитектура)
- [Работа с базой данных](#работа-с-базой-данных)
- [API Endpoints](#api-endpoints)
- [Логирование](#логирование)
- [Разработка](#разработка)

---

## План проекта

### Основной план реализации
См. [PLAN.md](./PLAN.md) - полный план реализации проекта с описанием всех этапов.

### План рефакторинга
См. [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) - план рефакторинга Cart и Product страниц на React.

---

## Архитектура

### Технологии

- **Astro** - фреймворк для веб-приложений (SSR, file-based routing)
- **Node.js** - runtime для Astro SSR
- **React** - библиотека для интерактивных компонентов
- **SQLite** - база данных (better-sqlite3)
- **Telegram WebApp SDK** - интеграция с Telegram

### Структура проекта

```
pantera-mini-apps/
├── astro-app/              # Astro приложение
│   ├── src/
│   │   ├── pages/          # Страницы и API endpoints
│   │   │   └── api/        # API endpoints
│   │   ├── components/     # UI компоненты (Astro + React)
│   │   ├── lib/            # Функции для работы с БД
│   │   │   ├── db.js       # Подключение к SQLite
│   │   │   ├── products.ts # Функции для товаров
│   │   │   ├── cart.ts     # Функции для корзины
│   │   │   ├── logger.js   # Логирование
│   │   │   └── types.ts    # TypeScript типы
│   │   └── scripts/        # Скрипты (миграции, тесты)
│   ├── database/           # SQLite база данных
│   │   └── shop.db         # (не коммитится в Git)
│   └── public/             # Статические файлы
└── docs/                   # Документация
```

### Принципы архитектуры

- **Минимум слоев** - все данные в одной БД (SQLite)
- **Файловый роутинг** - Astro автоматически создает маршруты из файлов
- **SSR из коробки** - страницы рендерятся на сервере
- **API endpoints** - в папке `src/pages/api/`
- **Гибридный подход** - Astro для статики, React для интерактивности

---

## Работа с базой данных

### Структура БД

Все данные хранятся в SQLite (`astro-app/database/shop.db`):

- **products** - товары (название, описание, изображение, коллекция)
- **product_variants** - варианты товаров (размеры, остатки, цены)
- **carts** - корзины пользователей
- **cart_items** - товары в корзине
- **orders** - заказы
- **order_items** - элементы заказов

### Работа с SQL

#### Способы выполнения SQL:

1. **Через скрипты миграции** (рекомендуется для изменений структуры)
   ```bash
   npm run migrate:add-collection-name
   ```

2. **Через better-sqlite3 в коде** (для работы с данными)
   ```javascript
   import db from '@/lib/db.js';
   const products = db.prepare('SELECT * FROM products').all();
   ```

3. **Через SQLite CLI** (для отладки и проверки)
   ```bash
   cd astro-app
   sqlite3 database/shop.db
   ```

---

## API Endpoints

### Products API

- `GET /api/products` - получить все активные товары
- `GET /api/products/:id` - получить товар по ID
- `GET /api/products/:id/variants` - получить варианты товара (размеры)

### Cart API

- `GET /api/cart?telegram_user_id=xxx` - получить корзину пользователя
- `POST /api/cart/items` - добавить товар в корзину
- `PUT /api/cart/items/:id` - изменить количество товара
- `DELETE /api/cart/items/:id` - удалить товар из корзины
- `DELETE /api/cart?telegram_user_id=xxx` - очистить корзину

### Orders API

- `POST /api/orders` - создать заказ
- `GET /api/orders?telegram_user_id=xxx` - получить заказы пользователя
- `GET /api/orders/:id` - получить заказ по ID

### Документация по API

Подробная информация об API endpoints доступна в [BACKEND_GUIDE.md](./BACKEND_GUIDE.md).

---

## Логирование

### Быстрый старт

```javascript
import { logger } from '@/lib/logger.js';

// Логирование ошибки
logger.error('Ошибка при добавлении товара', {
  endpoint: 'POST /api/cart/items',
  product_id: 2,
  error: error.message
});

// Логирование успешного события
logger.info('Товар добавлен в корзину', {
  cart_item_id: 123,
  telegram_user_id: '123456789'
});
```

### Уровни логирования

- **`logger.error()`** - для ошибок
- **`logger.warn()`** - для предупреждений
- **`logger.info()`** - для информационных сообщений
- **`logger.debug()`** - для отладочной информации

### Где хранятся логи

Логи записываются в папку `astro-app/logs/`:
- `YYYY-MM-DD-combined.log` - все логи
- `YYYY-MM-DD-error.log` - только ошибки

### Документация по логированию

Логирование реализовано через `logger.js` в `src/lib/`. Логи записываются в папку `astro-app/logs/`:
- `YYYY-MM-DD-combined.log` - все логи
- `YYYY-MM-DD-error.log` - только ошибки

---

## Разработка

### Типизация и импорты

В проекте используется TypeScript для типизации. Файлы в `src/lib/` используют TypeScript (`.ts`), а импорты выполняются с расширением `.js`:

```typescript
import { getAllProducts } from '@/lib/products.js';
import type { Product } from '@/lib/types.js';
```

Алиасы `@/` настроены в `tsconfig.json` и `astro.config.mjs` для удобных импортов.

### Компоненты

Компоненты находятся в `src/components/`:
- Astro компоненты (`.astro`) - для статических частей
- React компоненты (`.tsx`) - для интерактивных элементов

### Telegram SDK

Интеграция с Telegram WebApp SDK реализована через компонент `TelegramWebAppInit.astro`.

---

## Быстрый старт

### Установка зависимостей

```bash
cd astro-app
npm install
```

### Запуск dev сервера

```bash
npm run dev
```

### Работа с базой данных

```bash
# Открыть SQLite CLI
sqlite3 database/shop.db

# Или использовать скрипты миграции
npm run migrate:add-collection-name
```

---

## Важные файлы

- [PLAN.md](./PLAN.md) - полный план реализации проекта
- [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) - план рефакторинга
- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - руководство для бекендера

---

**Дата обновления:** 2026-01-06

