# Деплой на Beget: только статика Astro, Strapi остаётся в Cloud

Этот сценарий проще и надёжнее:  
- **CMS и админка** остаются в **Strapi Cloud**  
- на **Beget** размещается только результат `astro-app/dist`  
- при обновлении контента в Strapi запускается пересборка статики

---

## 1. Что должно получиться

| Что | Где |
|-----|-----|
| Публичный сайт | `https://pantera-boxing.ru` (Beget, статика) |
| API + админка | `https://<ваш-проект>.strapiapp.com` (Strapi Cloud) |

Важно: во время сборки (`npm run build`) Astro должен иметь доступ к Strapi Cloud API.

---

## 2. Подготовить Strapi Cloud

1. Откройте админку Strapi Cloud.
2. Создайте **API Token** с правами чтения нужных коллекций/single types.
3. Убедитесь, что API отвечает:

```bash
curl -I "https://<ваш-проект>.strapiapp.com/api/hero?populate=*"
```

Ожидаемо получить HTTP-ответ сервера (например `200` или `401/403` без токена).  
Если API не отвечает, сборка Astro не подтянет контент.

---

## 3. Локальная сборка Astro против Strapi Cloud

В `astro-app/.env`:

```env
STRAPI_URL=https://<ваш-проект>.strapiapp.com
STRAPI_TOKEN=<read_token>
```

Сборка:

```bash
cd astro-app
npm ci
npm run build
```

Проверка: после сборки должен появиться каталог `astro-app/dist/`.

---

## 4. Залить сайт на Beget

1. В панели Beget откройте корневую директорию основного сайта (обычно `public_html`).
2. Загрузите **содержимое** папки `astro-app/dist/` в корень сайта.
3. Проверьте страницы:
   - `/`
   - `/gallery`
   - `/sportsmen`
   - `/events/<slug>` (если есть события)

---

## 5. Автообновление после изменений в Strapi (рекомендуется)

Используйте workflow `/.github/workflows/rebuild-static.yml`:

1. В GitHub репозитории задайте Secrets:
   - `STRAPI_URL` = `https://<ваш-проект>.strapiapp.com`
   - `STRAPI_TOKEN` = read token из Strapi Cloud
   - `BEGET_FTP_HOST`
   - `BEGET_FTP_USER`
   - `BEGET_FTP_PASSWORD`
   - `BEGET_FTP_REMOTE_DIR`
2. Задайте Variable:
   - `BEGET_FTP_DEPLOY=true`
3. Запустите workflow вручную (`Run workflow`) и убедитесь, что сайт обновился.

Дальше можно подключить webhook из Strapi (через посредник: PHP/Make/Pipedream) на `repository_dispatch`, чтобы сборка стартовала автоматически после публикации контента.

---

## 6. Частые проблемы и быстрые проверки

- **`fetch failed` при `npm run build`**  
  Проверьте `STRAPI_URL`/`STRAPI_TOKEN` и доступность `https://<cloud>/api/...`.

- **`Strapi 503: Service Unavailable` в логе**  
  У Strapi Cloud бывают кратковременные простои или «прогрев». Код Astro при 502/503/429 делает одну повторную попытку с короткой паузой; если ошибка сохраняется — проверьте админку Cloud и командой  
  `curl -I "https://<ваш-проект>.strapiapp.com/api/hero?populate=*"`  
  убедитесь, что API отвечает, затем снова запустите `npm run build`.

- **Сборка `Complete`, но контент пустой**  
  В проекте ошибки API частично перехватываются, поэтому сборка может не падать, но страницы собираются без данных. Нужно устранить доступ к API и пересобрать.

- **На Beget открывается старый контент**  
  Перезалейте именно содержимое `dist/`, а не папку `dist` целиком как вложенную директорию.

---

## 7. Чеклист

- [x] Strapi Cloud живой, админка доступна.
- [х] Создан read-only API token.
- [x] В `astro-app/.env` указаны `STRAPI_URL` и `STRAPI_TOKEN` от Cloud.
- [x] `npm run build` выполняется без ошибок доступа к API.
- [ ] Содержимое `astro-app/dist/` загружено в корень сайта на Beget.
- [ ] Проверены основные страницы после деплоя.
- [ ] Настроен GitHub Actions деплой (опционально, но желательно).

