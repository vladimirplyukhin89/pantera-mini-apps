# Telegram Mini App - Магазин футболок зала бокса Pantera

Telegram Mini App для продажи футболок зала бокса. Приложение построено на Astro с использованием SQLite для хранения данных.

## 🚀 Технологии

- **Astro** - фреймворк для веб-приложений (SSR, file-based routing)
- **Node.js** - runtime для Astro SSR
- **SQLite** - база данных (better-sqlite3)
- **Telegram WebApp SDK** - интеграция с Telegram

## 📁 Структура проекта

```
pantera-mini-apps/
├── astro-app/              # Astro приложение
│   ├── src/
│   │   ├── pages/          # Страницы и API endpoints
│   │   ├── components/     # UI компоненты
│   │   ├── lib/            # Функции для работы с БД
│   │   └── scripts/        # Скрипты (миграции, тесты)
│   ├── database/           # SQLite база данных
│   │   └── shop.db         # (не коммитится в Git)
│   └── public/             # Статические файлы
├── PLAN.md                 # План реализации проекта
└── *.md                    # Документация
```

## 📋 Статус проекта

### ✅ Этап 1: Настройка проекта и базы данных (ЗАВЕРШЕН)
- [x] Astro проект создан
- [x] База данных настроена (SQLite)
- [x] Все таблицы созданы
- [x] Товары добавлены в БД

### ⏭️ Этап 2: Products API (следующий)
- [ ] API endpoints для товаров
- [ ] SQL JOIN для получения данных

## 🛠️ Разработка

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

См. документацию:
- `astro-app/SQLITE_CLI_GUIDE.md` - работа через SQLite CLI
- `astro-app/HOW_TO_USE_SQL.md` - как использовать SQL команды
- `astro-app/SCRIPTS_EXPLAINED.md` - объяснение скриптов

### Миграции базы данных

```bash
# Добавить поле collection_name
npm run migrate:add-collection-name

# Добавить поле price в variants
npm run migrate:add-price-to-variants

# Удалить price из products
npm run migrate:remove-price-from-products
```

## 📚 Документация

- `PLAN.md` - полный план реализации проекта
- `DATABASE_RELATIONS.md` - схема связей таблиц БД
- `astro-app/EXPLAIN_PRODUCT_VARIANTS.md` - объяснение структуры таблицы variants
- `astro-app/SQLITE_CLI_GUIDE.md` - руководство по SQLite CLI

## 🗄️ База данных

### Структура

- **products** - товары (название, описание, изображение, коллекция)
- **product_variants** - варианты товаров (размеры, остатки, цены)
- **carts** - корзины пользователей
- **cart_items** - товары в корзине
- **orders** - заказы
- **order_items** - элементы заказов

Все данные хранятся в SQLite (`astro-app/database/shop.db`).

## 📝 Лицензия

Private project

