# CI/CD и деплой

## Архитектура деплоя

```
pantera-boxing.ru → Vercel (Astro SSR)
                       ↓ STRAPI_URL + STRAPI_TOKEN
                    Strapi Cloud (PostgreSQL)

GitHub push main → auto-deploy на обе платформы
                 → GitHub Actions CI (lint, typecheck, build)
```

| Сервис | Платформа | Что деплоится |
|---|---|---|
| Фронтенд (Astro SSR) | Vercel (free) | `astro-app/` |
| CMS (Strapi 5) | Strapi Cloud (free) | `strapi-cms/` |

Обе платформы подключены к GitHub и деплоят автоматически при пуше в `main`.

---

## GitHub Actions CI

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

CI запускается на `push` и `pull_request` в `main`. Деплоем занимаются Vercel и Strapi Cloud — GitHub Actions только проверяет код.

### Что проверяется

**Astro (job `check-frontend`):**
1. `npm run format:check` — Prettier
2. `npx astro check` — TypeScript / Astro типы
3. `npm run build` — сборка проходит без ошибок

**Strapi (job `check-backend`):**
1. `npm run build` — сборка admin-панели проходит без ошибок

Jobs запускаются параллельно.

### GitHub Secrets для CI

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Описание | Пример |
|---|---|---|
| `STRAPI_URL` | URL Strapi Cloud | `https://xxx.strapiapp.com` |
| `STRAPI_TOKEN` | API-токен из Strapi Cloud | из Strapi Admin → Settings → API Tokens |

Эти секреты нужны для `npm run build` в Astro (SSR-сборка делает запросы к Strapi).

---

## Настройка Strapi Cloud

1. Зайти на [cloud.strapi.io](https://cloud.strapi.io), авторизоваться через GitHub
2. **Create project** → выбрать репозиторий `pantera-mini-apps`
3. В **Base directory** указать `strapi-cms`
4. Выбрать **Free plan**, регион **Europe (West)**
5. Добавить переменные окружения:

| Переменная | Описание |
|---|---|
| `APP_KEYS` | Ключи приложения (через запятую) |
| `API_TOKEN_SALT` | Соль для API-токенов |
| `ADMIN_JWT_SECRET` | JWT-секрет админки |
| `TRANSFER_TOKEN_SALT` | Соль для transfer-токенов |
| `JWT_SECRET` | JWT-секрет |
| `ENCRYPTION_KEY` | Ключ шифрования |

Strapi Cloud сам задаёт `DATABASE_CLIENT=postgres` и остальные `DATABASE_*` переменные — БД создаётся автоматически.

6. Нажать **Deploy**
7. После деплоя: создать admin-пользователя, затем **Settings → API Tokens → Create new API Token**
8. Запомнить URL проекта (`https://xxx.strapiapp.com`) и API-токен

---

## Настройка Vercel

1. Зайти на [vercel.com](https://vercel.com), авторизоваться через GitHub
2. **Import project** → выбрать репозиторий `pantera-mini-apps`
3. В **Root Directory** указать `astro-app`
4. Framework Preset: **Astro** (определяется автоматически)
5. Добавить **Environment Variables**:
   - `STRAPI_URL` = URL из Strapi Cloud (шаг выше)
   - `STRAPI_TOKEN` = API-токен из Strapi Cloud
6. Нажать **Deploy**

### Привязка домена pantera-boxing.ru

1. В Vercel: **Project Settings → Domains → Add** `pantera-boxing.ru`
2. Vercel покажет нужные DNS-записи (A-запись или CNAME)
3. В панели Beget: **DNS-управление** → добавить указанные записи
4. Vercel автоматически выпустит SSL-сертификат

---

## Миграция на VPS (при необходимости)

При переходе на собственный хостинг:

1. Заменить `@astrojs/vercel` обратно на `@astrojs/node` в `astro-app`
2. Настроить VPS: nginx, systemd-сервисы, SSL (certbot)
3. Обновить CI workflow на SCP/SSH деплой
4. Перенаправить DNS `pantera-boxing.ru` на IP сервера
