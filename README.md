# Pantera Mini Apps

Telegram Mini App для продажи футболок зала бокса Pantera.

## 🚀 Быстрый старт

```bash
# Перейти в папку приложения
cd astro-app

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение будет доступно по адресу `http://localhost:4321`

## 📁 Структура проекта

```
pantera-mini-apps/
├── astro-app/          # Astro приложение
│   ├── src/            # Исходный код
│   ├── database/       # SQLite база данных
│   └── public/         # Статические файлы
└── docs/               # Документация проекта
```

## 🛠️ Технологии

- **Astro** - фреймворк для веб-приложений (SSR, file-based routing)
- **React** - библиотека для интерактивных компонентов
- **SQLite** - база данных (better-sqlite3)
- **Node.js** - runtime для Astro SSR
- **Telegram WebApp SDK** - интеграция с Telegram

## 📚 Документация

Вся документация находится в папке [`docs/`](./docs/):

- **[docs/README.md](./docs/README.md)** - основная документация проекта
- **[docs/PLAN.md](./docs/PLAN.md)** - полный план реализации проекта
- **[docs/BACKEND_GUIDE.md](./docs/BACKEND_GUIDE.md)** - руководство для бекендера
- **[docs/REFACTORING_PLAN.md](./docs/REFACTORING_PLAN.md)** - план рефакторинга

### Быстрые ссылки

- [Работа с базой данных](./docs/HOW_TO_USE_SQL.md)
- [Использование logger](./docs/LOGGER_USAGE.md)
- [API Endpoints](./docs/README.md#api-endpoints)
- [Типизация и импорты](./docs/TYPES_AND_IMPORTS_GUIDE.md)

## 🗄️ База данных

Проект использует SQLite для хранения данных:
- Товары и варианты (размеры, остатки)
- Корзины пользователей
- Заказы

База данных находится в `astro-app/database/shop.db`

## 🔧 Разработка

### Команды

```bash
# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Просмотр production сборки
npm run preview
```

### Работа с БД

```bash
# Открыть SQLite CLI
cd astro-app
sqlite3 database/shop.db
```

Подробнее см. [SQLITE_CLI_GUIDE.md](./docs/SQLITE_CLI_GUIDE.md)

## 📝 Лицензия

Private project

---

**Версия:** 1.0.0  
**Дата обновления:** 2026-01-06
