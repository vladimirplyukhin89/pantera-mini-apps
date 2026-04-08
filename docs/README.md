# Pantera Website

Вебсайт боксёрского клуба Pantera с лендингом, галереей, событиями и страницей спортсменов. Контент управляется через Strapi CMS.

## Быстрый старт

```bash
# Astro (фронтенд)
cd astro-app && npm install && npm run dev
# → http://localhost:4321

# Strapi (CMS)
cd strapi-cms && npm install && npm run develop
# → http://localhost:1337/admin
```

Для связки нужны переменные окружения в `astro-app/.env` (шаблон: `astro-app/.env.example`):

```
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=<API token из Strapi>
```

**Сборка (`npm run build`)** без этих переменных будет ходить на `localhost:1337`; если Strapi не запущен, появятся ошибки `ECONNREFUSED` и страницы соберутся без данных. Подробнее: [beget-migration-ssg.md](./beget-migration-ssg.md).

Полный перенос сайта и Strapi на платный Beget (домен + поддомен CMS): [beget-full-migration.md](./beget-full-migration.md).

## Структура проекта

```
pantera-mini-apps/
├── astro-app/              # Astro SSR приложение (React islands)
│   ├── src/
│   │   ├── pages/          # Маршруты (file-based routing)
│   │   ├── components/     # UI-компоненты (Astro + React)
│   │   ├── lib/strapi.ts   # Клиент Strapi API, типы, утилиты
│   │   └── styles/         # Глобальные стили
│   └── public/             # Статика (favicon, шрифты)
├── strapi-cms/             # Strapi 5 CMS (SQLite)
│   └── src/api/            # Content Types (схемы контента)
└── docs/                   # Документация
```

## Страницы

| Маршрут | Описание |
|---------|----------|
| `/` | Лендинг — герой-баннер из Strapi |
| `/gallery` | Галерея — события (слайдер), фотосетка, ценности клуба |
| `/sportsmen` | Спортсмены — карточки атлетов, контакты, соцсети |
| `/events/[slug]` | Детальная страница события — медиагалерея (фото + видео), текст |
| `/404` | Страница ошибки |

## Strapi Content Types

| Сущность | Назначение | Ключевые поля |
|----------|------------|---------------|
| **Event** | События клуба | `title`, `teaser`, `body` (blocks), `media` (фото + видео), `video_cover` (обложка видео), `statusPlan`, `date_label`, `order` |
| **Gallery Photo** | Фотосетка на галерее | `image`, `alt`, `variant` (default/tall/wide), `order` |
| **Club Value** | Ценности клуба | `title`, `description`, `photo`, `accent_color`, `order` |
| **Athlete** | Спортсмены | `label`, `name`, `quote`, `stats`, `photo`, `badge`, `order` |
| **Hero** | Баннер главной | `title`, `description`, `cta_link`, `bg_mobile`, `bg_desktop` |
| **Contact Info** | Контактная информация | `title`, `address`, `phone`, `email`, `schedule` |
| **Social Link** | Соцсети | `name`, `url`, `icon`, `order` |
| **Gallery Settings** | Настройки галереи | `events_slider_bg` (glow/diagonal/mesh/salad) |

## Видео в событиях

Поле `media` в Event принимает как изображения, так и видео. Логика отображения:

- **Слайдер событий** (`EventsSlider`) — карточка всегда показывает картинку: `video_cover` → первое изображение из `media` → плейсхолдер. Если есть видео — на карточке индикатор play.
- **Детальная страница** (`EventMediaGallery`) — видео отображается в карусели с кнопкой Play поверх обложки. По нажатию открывается модальный плеер (нативный `<video>` с controls, закрытие по Escape / клику вне).

## Технологии

- **Astro 5** — SSR, file-based routing, островная архитектура
- **React 19** — интерактивные компоненты (`client:load`)
- **Embla Carousel** — карусели (события, медиагалерея)
- **Strapi 5** — headless CMS, REST API, SQLite
- **CSS Modules** — стилизация компонентов
- **Node.js adapter** — серверный рендеринг для Astro

## Команды

```bash
# Astro
npm run dev          # Dev-сервер с HMR
npm run build        # Production-сборка
npm run preview      # Просмотр сборки

# Strapi
npm run develop      # Dev-сервер с hot-reload
npm run build        # Сборка admin-панели
npm run start        # Production-запуск
```

---

**Версия:** 2.0.0
**Дата обновления:** 2026-04-07
