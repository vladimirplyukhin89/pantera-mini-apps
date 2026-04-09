# Pantera Website

Вебсайт боксёрского клуба Pantera с лендингом, галереей, событиями, страницей спортсменов и мерчем. Контент управляется через Strapi CMS.

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

**Сборка (`npm run build`)** без Strapi на `STRAPI_URL` даст пустой/урезанный контент: для полноценного `dist` API должен отвечать во время сборки.

**Перенос админки и API со Strapi Cloud на поддомен Beget** (пошагово): [strapi-cloud-to-beget.md](./strapi-cloud-to-beget.md).

### SEO и превью ссылок (Google, соцсети)

Прод-домен задан в `astro-app/astro.config.mjs` (`site`). Компонент `Layout.astro` выводит `<title>`, `meta description`, `canonical`, Open Graph и Twitter Card.

**Что заполнять в Strapi (без отдельных SEO-полей):**

| Тип контента | Поля в админке | Как используется на сайте |
|--------------|----------------|---------------------------|
| **Hero** (single) | **Description** | Текст для meta description главной (обрезается ~до 160 символов; простой текст или HTML — теги снимаются). |
| | **Фон (desktop)** / **Фон (mobile)** | Картинка для превью ссылки при шаринге главной (приоритет desktop, иначе mobile). Абсолютный URL берётся из медиа Strapi. |
| **Event** | **Teaser** | Meta description и `og:description` на странице события (`/events/…`). Желательно 1–2 коротких предложения, до ~160 символов. |
| | **Video cover** или первое **изображение** в **Media** | Картинка для превью ссылки события (если нет — подставляется дефолт с сайта). |

Страницы `/gallery`, `/sportsmen`, `/shop` используют **фиксированные** описания в коде; при желании позже можно вынести тексты в Single Type «SEO» или настройки в Strapi.

После деплоя превью можно проверить в [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

---

## Деплой: статика на Beget + Strapi в Cloud

Типовая схема до полной миграции CMS:

| Что | Где |
|-----|-----|
| Публичный сайт | Beget, в корень сайта — содержимое `astro-app/dist/` |
| API и админка | Strapi Cloud (`*.strapiapp.com`) |

1. В Strapi Cloud создайте **API Token** (чтение нужных типов).
2. В `astro-app/.env` (и в CI): `STRAPI_URL`, `STRAPI_TOKEN`.
3. Сборка: `cd astro-app && npm ci && npm run build`.
4. На хостинг загрузите **содержимое** `dist/`, не вложенную папку `dist`.

Проверка API: `curl -I "https://<проект>.strapiapp.com/api/hero?populate=*"`.

Автопересборка и выкладка по FTP: workflow [`.github/workflows/rebuild-static.yml`](../.github/workflows/rebuild-static.yml) — секреты `STRAPI_*`, опционально `BEGET_FTP_*` и переменная `BEGET_FTP_DEPLOY=true`. Webhook из Strapi на GitHub описан в [strapi-cloud-to-beget.md](./strapi-cloud-to-beget.md) (раздел 6).

**Частые проблемы:** `fetch failed` / пустой контент — проверьте URL, токен и доступность API; `503` у Cloud — повторите сборку после восстановления API.

---

## CI/CD

### Схема

| Сервис | Назначение |
|--------|------------|
| GitHub Actions | Проверки при push/PR (`deploy.yml`), опционально пересборка статики и FTP (`rebuild-static.yml`) |
| Strapi Cloud | Хостинг CMS (при текущей схеме) |
| Beget | Статика сайта (после выкладки `dist/`) |

Workflow CI: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — на push/PR в `main`: Prettier, `astro check`, сборка Astro; сборка Strapi admin.

**Секреты для сборки Astro** (Settings → Actions → Secrets): `STRAPI_URL`, `STRAPI_TOKEN`.

**Strapi Cloud (кратко):** [cloud.strapi.io](https://cloud.strapi.io) → проект, base directory `strapi-cms`, переменные `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` — см. шаблон в панели Cloud.

---

## Структура проекта

```
pantera-mini-apps/
├── astro-app/              # Astro (output: static), React-острова
│   ├── src/
│   │   ├── pages/          # Маршруты
│   │   ├── components/
│   │   ├── lib/strapi.ts
│   │   └── styles/
│   └── public/
├── strapi-cms/             # Strapi 5 (локально SQLite; Cloud — Postgres)
│   └── src/api/
└── docs/                   # Документация
```

## Страницы

| Маршрут | Описание |
|---------|----------|
| `/` | Лендинг — герой из Strapi |
| `/gallery` | Галерея — события, фото, ценности |
| `/sportsmen` | Спортсмены, контакты, соцсети |
| `/shop` | Мерч (заглушка) |
| `/events/[slug]` | Событие — медиа, текст |
| `/404` | Ошибка |

## Strapi Content Types

| Сущность | Назначение | Ключевые поля |
|----------|------------|---------------|
| **Event** | События | `title`, `teaser`, `body`, `media`, `video_cover`, `statusPlan`, `date_label`, `order` |
| **Gallery Photo** | Фотосетка | `image`, `alt`, `variant`, `order` |
| **Club Value** | Ценности | `title`, `description`, `photo`, `accent_color`, `order` |
| **Athlete** | Спортсмены | `label`, `name`, `quote`, `stats`, `photo`, `badge`, `order` |
| **Hero** | Главная | `title`, `description`, `cta_link`, `bg_mobile`, `bg_desktop` |
| **Contact Info** | Контакты | `title`, `address`, `phone`, `email`, `schedule` |
| **Social Link** | Соцсети | `name`, `url`, `icon`, `order` |
| **Gallery Settings** | Галерея | `events_slider_bg` |

## Видео в событиях

- **EventsSlider** — обложка: `video_cover` → первое изображение в `media` → плейсхолдер; индикатор play при видео.
- **EventMediaGallery** — видео в карусели, модальный `<video>`.

## Технологии

- **Astro 5** — статическая сборка (`output: 'static'`), View Transitions / prefetch
- **React 19** — `client:load`
- **Embla Carousel**
- **Strapi 5** — REST API
- **CSS Modules**

## Команды

```bash
# Astro (из каталога astro-app)
npm run dev
npm run build
npm run preview

# Strapi (из каталога strapi-cms)
npm run develop
npm run build
npm run start
```

---

**Версия:** 2.1.0  
**Обновлено:** 2026-04-09
