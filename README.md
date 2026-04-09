[![CI](https://github.com/vladimirplyukhin89/pantera-mini-apps/actions/workflows/deploy.yml/badge.svg)](https://github.com/vladimirplyukhin89/pantera-mini-apps/actions/workflows/deploy.yml)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](http://pantera-club.ru)

# Pantera Mini Apps

Веб-приложение боксёрского клуба **Pantera** — лендинг, галерея событий, страница спортсменов и медиагалерея с фото и видео. Контент полностью управляется через Strapi CMS.

## Стек

- **Astro 5** + **React 19** — SSR с островной архитектурой
- **Strapi 5** — headless CMS (REST API, SQLite)
- **Embla Carousel** — карусели событий и медиа
- **CSS Modules** — стилизация компонентов

## Структура

| Директория | Назначение |
|------------|------------|
| `astro-app/` | Фронтенд — Astro SSR + React-острова |
| `strapi-cms/` | CMS — Strapi 5, Content Types, REST API |
| `docs/` | Документация: обзор, деплой, CI; миграция CMS — [strapi-cloud-to-beget.md](docs/strapi-cloud-to-beget.md) |

## Быстрый старт

```bash
# Фронтенд
cd astro-app && npm install && npm run dev   # → http://localhost:4321

# CMS
cd strapi-cms && npm install && npm run develop   # → http://localhost:1337/admin
```

Переменные окружения в `astro-app/.env`:

```
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=<API token из Strapi>
```

Подробнее — в [docs/README.md](docs/README.md).  
Миграция админки Strapi со Strapi Cloud на поддомен Beget: [docs/strapi-cloud-to-beget.md](docs/strapi-cloud-to-beget.md).
