[![CI](https://github.com/vladimirplyukhin89/pantera-mini-apps/actions/workflows/deploy.yml/badge.svg)](https://github.com/vladimirplyukhin89/pantera-mini-apps/actions/workflows/deploy.yml)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](http://pantera-club.ru)

# Pantera Mini Apps

Веб-приложение боксёрского клуба **Pantera** — лендинг, галерея событий, страница спортсменов и медиагалерея с фото и видео. Контент полностью управляется через Strapi CMS.

## Стек

- **Astro 5** + **React 19** — SSR с островной архитектурой
- **Strapi 5** — headless CMS (REST API); исходники CMS — в отдельном репозитории (см. [docs/repo-split-strapi-amvera.md](docs/repo-split-strapi-amvera.md))
- **Embla Carousel** — карусели событий и медиа
- **CSS Modules** — стилизация компонентов

## Структура

| Директория | Назначение |
|------------|------------|
| `astro-app/` | Фронтенд — Astro SSR + React-острова (сборка тянет контент по API с развёрнутого Strapi) |
| `docs/` | Документация: обзор, деплой, CI; миграция CMS — [strapi-cloud-to-beget.md](docs/strapi-cloud-to-beget.md) |

## Быстрый старт

```bash
cd astro-app && npm install && npm run dev   # → http://localhost:4321
```

Strapi (админка и API) поднимается из **отдельного репозитория** — см. [docs/repo-split-strapi-amvera.md](docs/repo-split-strapi-amvera.md).

Переменные окружения в `astro-app/.env` (укажите URL и токен вашего Strapi — локальный или прод):

```
STRAPI_URL=https://…
STRAPI_TOKEN=<API token из Strapi>
```

Подробнее — в [docs/README.md](docs/README.md).  
Миграция админки Strapi со Strapi Cloud на поддомен Beget: [docs/strapi-cloud-to-beget.md](docs/strapi-cloud-to-beget.md).
