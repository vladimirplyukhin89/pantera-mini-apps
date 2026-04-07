# Интеграция со Strapi — Pantera

Документ описывает все динамические данные сайта, которые должны поступать из Strapi CMS.

---

## Обзор архитектуры

- **Frontend**: Astro (SSR, `@astrojs/node`) + React-компоненты
- **CMS**: Strapi v5 (headless)
- **Подход**: Astro-страницы получают данные из Strapi REST API в серверном коде (`---` блоке), а затем передают пропсами в компоненты

```
[Strapi API] ──REST──▸ [Astro SSR] ──props──▸ [React / Astro компоненты]
```

---

## Content Types (типы контента)

### 1. `hero` — Single Type

Главная страница (`/`).

| Поле            | Тип               | Описание                                   |
| --------------- | ------------------ | ------------------------------------------ |
| `title`         | Short text         | Заголовок hero-секции                      |
| `description`   | Short text         | Подзаголовок                               |
| `cta_link`      | Short text         | Ссылка для CTA-кнопки (напр. `/sportsmen`) |
| `bg_mobile`     | Media (image)      | Фон для мобильных                          |
| `bg_desktop`    | Media (image)      | Фон для десктопа (>= 769px)               |

**Используется в**: `HeroSection.astro`, `index.astro`

---

### 2. `gallery-photo` — Collection Type

Фотографии для сетки на странице «Галерея» (`/gallery`).

| Поле       | Тип               | Описание                                       |
| ---------- | ------------------ | ---------------------------------------------- |
| `image`    | Media (image)      | Фотография                                     |
| `alt`      | Short text         | Alt-текст                                       |
| `variant`  | Enumeration        | `default` / `tall` / `wide` — layout в сетке   |
| `order`    | Integer            | Порядок отображения                             |

**Используется в**: `gallery.astro` → `PhotoGrid.tsx`

**Пагинация**: PhotoGrid поддерживает infinite scroll. Strapi отдаёт все записи; пагинация на клиенте.

---

### 2a. `gallery-settings` — Single Type

Настройки внешнего вида страницы «Галерея» (`/gallery`).

| Поле                 | Тип           | Описание                                                                 |
| -------------------- | ------------- | ------------------------------------------------------------------------ |
| `events_slider_bg`   | Enumeration   | Фон блока слайдера событий: `glow`, `diagonal`, `mesh` |

Значения совпадают с вариантами в `EventsSlider` (`bgVariant`). Это **не** поле у отдельного события — один фон на весь слайдер на странице.

- **`mesh`** — нейтральный фон по умолчанию (смешанные пятна без явного голубого/оранжевого доминирования).
- **`diagonal`** — более **оранжевый** тон (акцент `--color-bg-orange`).
- **`glow`** — более **голубой** тон (акцент `--color-accent-blue-overlay`).

**Используется в**: `gallery.astro` → проп `bgVariant` у `EventsSlider`.

Если Single Type ещё не создан или запрос к API падает, используется фон по умолчанию: **`mesh`**.

---

### 3. `club-value` — Collection Type

Ценности клуба, секция «Наши ценности» на галерее.

| Поле           | Тип              | Описание                           |
| -------------- | ----------------- | ---------------------------------- |
| `photo`        | Media (image)     | Фоновое фото карточки              |
| `title`        | Short text        | Название ценности                  |
| `description`  | Long text         | Краткое описание                   |
| `accent_color` | Short text        | CSS-цвет акцента тега              |
| `order`        | Integer           | Порядок отображения                |

**Используется в**: `ClubValues.astro`

--`slug`        | UID (от title)      | URL-идентификатор, напр. `pantera-cup`                  |
| -

### 4. `event` — Collection Type

События клуба — планируемые и прошедшие.

**Используется в**: `ClubValues.astro`

--`slug`        | UID (от title)      | URL-идентификатор, напр. `pantera-cup`                  |
| 
| Поле          | Тип                | Описание                                                |
| ------------- | ------------------- | ------------------------------------------------------- |
| `emoji`       | Short text          | Emoji-иконка                                            |
| `title`       | Short text          | Название события                                        |
| `teaser`      | Long text           | Краткое описание (для карточки в слайдере)              |
| `date_label`  | Short text          | Текстовая метка даты (`Скоро`, `Февраль 2026`)         |
| `statusPlan`  | Enumeration         | `planned` / `past` — планируемое vs прошедшее          |
| `body`        | Rich text           | Полное описание события (Markdown / HTML)               |
| `media`       | Media (multiple)    | Фото и видео — обязательны для `past`, опционально для `planned` |
| `accent_index`| Integer (0-3)       | Индекс акцентного цвета                                |
| `order`       | Integer             | Порядок в слайдере                                      |

**Используется в**:
- `gallery.astro` → `EventsSlider` (карточки в слайдере)
- `events/[id].astro` (страница события)

**Важно**: Для прошедших событий (`past`) поле `media` обязательно (минимум 1 фото/видео). Для планируемых — опционально.

**Как попадают «будущие» события в слайдер на галерее**

1. В админке Strapi откройте коллекцию **Event** и создайте запись (или отредактируйте существующую).
2. Установите **`statusPlan` = `planned`** — тогда событие попадёт в блок **«Что впереди»** на `/gallery` (клиентский `EventsSlider` получает массив `planned` из `gallery.astro`; в коде это поле мапится в `statusCode`).
3. Заполните **`title`**, **`teaser`**, **`date_label`** (текст на карточке), при необходимости **`media`**, **`slug`** (или сгенерируйте из UID), **`order`** для сортировки.
4. Сохраните и опубликуйте. Сайт при запросе `GET /api/events?populate=media&sort=order:asc` подтягивает все события; фронт делит их на `planned` и `past` по полю **`statusPlan`** (в объектах для слайдера — `statusCode`).

Если **`planned`** не заполнено, блок «Что впереди» не показывается (если есть только `past`, виден только блок «Прошедшие»).

---

### 5. `athlete` — Collection Type

Спортсмены клуба.

| Поле       | Тип                | Описание                                |
| ---------- | ------------------- | --------------------------------------- |
| `photo`    | Media (image)       | Фото спортсмена                         |
| `label`    | Short text          | Подпись/лейбл                           |
| `name`     | Short text          | Имя / прозвище                          |
| `quote`    | Long text           | Цитата                                  |
| `stats`    | JSON / Component    | Массив `{ value, label }` — статистика  |
| `badge`    | Short text          | Текст бейджа (необязательно)            |
| `order`    | Integer             | Порядок отображения                     |

**Используется в**: `sportsmen.astro` → `AthleteCard.astro`

> В будущем на странице может быть несколько спортсменов — список карточек.

---

### 6. `contact-info` — Single Type

Контактная информация клуба.

| Поле          | Тип              | Описание                              |
| ------------- | ----------------- | ------------------------------------- |
| `title`       | Short text        | Заголовок секции                      |
| `subtitle`    | Short text        | Подзаголовок                          |
| `address`     | Short text        | Физический адрес                      |
| `phone`       | Short text        | Номер телефона                        |
| `email`       | Short text        | Email                                 |
| `schedule`    | Short text        | График работы                         |
| `quote`       | Long text         | Цитата / слоган в футере секции       |

**Используется в**: `sportsmen.astro` → `ContactSection.astro`

---

### 7. `social-link` — Collection Type

Ссылки на соцсети.

| Поле    | Тип         | Описание              |
| ------- | ------------ | --------------------- |
| `name`  | Short text   | Название (Telegram)   |
| `url`   | Short text   | URL ссылки            |
| `icon`  | Short text   | Emoji или SVG-иконка  |
| `order` | Integer      | Порядок отображения   |

**Используется в**: `ContactSection.astro`

---

## Карта «страница → данные из Strapi»

| Страница         | Route              | Content Types                                        |
| ---------------- | ------------------- | ---------------------------------------------------- |
| Главная          | `/`                 | `hero`                                               |
| Галерея          | `/gallery`         | `gallery-photo`, `club-value`, `event`               |
| Событие          | `/events/[slug]`    | `event` (один по slug)                               |
| Спортсмены       | `/sportsmen`        | `athlete`, `contact-info`, `social-link`             |

---

## Пример интеграции (Astro → Strapi)

### Конфиг

```typescript
// src/lib/strapi.ts
const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

export async function fetchStrapi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}
```

### Пример: галерея

```astro
---
// src/pages/gallery.astro
import { fetchStrapi } from '../lib/strapi';

const photos = await fetchStrapi('gallery-photos?sort=order:asc&populate=image');
const values = await fetchStrapi('club-values?sort=order:asc&populate=photo');
const events = await fetchStrapi('events?sort=order:asc&populate=media');
---
```

### Пример: событие

```astro
---
// src/pages/events/[slug].astro
import { fetchStrapi } from '../../lib/strapi';

const { slug } = Astro.params;
const events = await fetchStrapi(`events?filters[slug][$eq]=${slug}&populate=media`);
const event = events[0];

if (!event) return Astro.redirect('/gallery');
---
```

---

## Переменные окружения

```env
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=ваш_api_token
```

Добавить в `.env` файл Astro-приложения. Strapi-токен создаётся через `Settings → API Tokens` в админке Strapi.

---

## Медиа-файлы

Strapi хранит медиа в `/uploads`. URL изображений из API будут вида:

```
http://localhost:1337/uploads/photo_abc123.jpg
```

При рендеринге нужно подставлять `STRAPI_URL` перед относительным путём:

```typescript
function getStrapiMediaUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}
```

---

## Порядок миграции

1. **Развернуть Strapi** — `npx create-strapi@latest`
2. **Создать Content Types** — по таблицам выше
3. **Наполнить контентом** — перенести текущие хардкод-данные в Strapi
4. **Создать `src/lib/strapi.ts`** — утилита для запросов к API
5. **Заменить хардкод в страницах** — на `fetchStrapi()` вызовы
6. **Настроить медиа** — перенести фото из `public/images/jpg/` в Strapi Media Library
7. **Тестирование** — проверить все страницы с реальными данными
8. **Деплой** — настроить переменные окружения на продакшене

---

## Заметки

- Все текстовые данные (заголовки, описания, цитаты) должны быть динамическими
- Все фото и видео должны загружаться через Strapi Media Library
- Emoji для событий — обычные текстовые поля в Strapi
- Для Rich Text полей (`body` в событиях) рекомендуется использовать Markdown — Astro умеет его рендерить
- CSS-стили остаются на фронтенде, Strapi отдаёт только данные
