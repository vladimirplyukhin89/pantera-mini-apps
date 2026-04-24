# Миграция Strapi: со Strapi Cloud на поддомен Beget

> **Текущая схема:** статика Astro на Beget, CMS и API в Strapi Cloud — коротко описано в [README этого каталога](./README.md) (раздел «Деплой»).

Ниже — **полный перенос**: **Strapi 5** (API и админка) на поддомен Beget (например `admin.pantera-boxing.ru`), сборка Astro против этого API и отключение Strapi Cloud. Речь о размещении **статического фронтенда (Astro SSG)** на основном домене и CMS на **поддомене** одного аккаунта Beget. Актуальные кнопки в панели могут отличаться — ориентируйтесь на [базу знаний Beget](https://beget.com/ru/kb).

**Важно.** Strapi — тяжёлое Node.js‑приложение. На **виртуальном хостинге** возможны лимиты по памяти и времени сборки. Если после шагов ниже админка падает с ошибкой нехватки памяти — рассмотрите **VPS Beget** под CMS. Тариф **«Блог»** подходит для старта, если в описании тарифа на момент покупки есть **SSH, MySQL, Node.js** (на Beget Node обычно запускают в **Docker‑окружении** по SSH — см. [настройку Node.js](https://beget.com/ru/kb/how-to/web-apps/node-js)).

---

## 1. Целевая схема

| Что | Где | Технология |
|-----|-----|------------|
| Публичный сайт | `https://pantera-boxing.ru/` (основной домен) | Статика из `astro-app/dist/` |
| API и админка Strapi | `https://admin.pantera-boxing.ru/` (поддомен) | Node.js + **MySQL** на Beget |

Astro при сборке обращается к API: в `.env` / CI задаётся  
`STRAPI_URL=https://admin.pantera-boxing.ru` (без `/` в конце) и `STRAPI_TOKEN` (read‑токен из Strapi).

### DNS для вашего кейса

На стороне DNS должны быть записи:

- `A @ -> 5.101.153.76`
- `A admin -> 5.101.153.76`
- `CNAME www -> pantera-boxing.ru` (опционально, но обычно полезно)

Если домен делегирован на NS Beget и IP взят из панели Beget для вашего аккаунта, такая схема корректна.

---

## 2. Подготовка на Beget

1. Оформите нужный тариф (например **«Блог»**) и убедитесь, что услуга включает **сайты, MySQL, SSH**.
2. Привяжите **домен** к аккаунту Beget, делегируйте на **NS Beget** (если домен уже у вас).
3. В разделе **«Сайты»** создайте **два сайта** (или сайт + поддомен — как принято в новой панели):
   - **Основной сайт** — корневая директория, куда попадёт статика Astro (`public_html` или аналог).
   - **Поддомен** для CMS: `admin.pantera-boxing.ru` — отдельный каталог (например `admin.pantera-boxing.ru/public_html` или путь, который покажет панель).

   Подробнее: [Домены и поддомены](https://beget.com/ru/kb/manual/domeny-i-poddomeny).

4. Включите **SSL (Let’s Encrypt)** для основного домена и для поддомена CMS.

5. Создайте **базу MySQL** для Strapi:
   - Панель → **MySQL** → создать БД и пользователя, записать **хост** (часто `localhost` или имя из панели), **имя БД**, **логин**, **пароль**.

---

## 3. Часть A — статический сайт (Astro)

Выполняется **на вашем ПК или в CI** (GitHub Actions), на Beget заливается только результат сборки.

### 3.1. Сборка

```bash
cd astro-app
npm ci
STRAPI_URL="https://admin.pantera-boxing.ru" STRAPI_TOKEN="ваш_токен" npm run build
```

Появится каталог `astro-app/dist/`.

#### Если в логе сборки есть `TypeError: fetch failed` / `ECONNREFUSED ...:443`

Это означает, что во время `npm run build` Astro не может достучаться до Strapi по `STRAPI_URL`.
Чаще всего проблема не в токене, а в том, что `https://admin.pantera-boxing.ru` не отвечает как Strapi API.

Мини‑чеклист:

- [ ] Проверить, что поддомен CMS реально доступен по HTTPS:  
      `curl -I "https://admin.pantera-boxing.ru/api/hero?populate=*"`
- [ ] Если видите `Failed to connect` / `ECONNREFUSED`, значит порт `443` не принимает соединение (Strapi/прокси/Passenger не поднят или не привязан).
- [ ] Если по `http://admin.pantera-boxing.ru` приходит `404 nginx`, это не API Strapi: веб‑сервер отвечает, но маршрутизация до Node‑приложения не настроена.
- [ ] Проверить SSL для `admin` в панели Beget (сертификат выпущен и привязан к поддомену).
- [ ] Проверить запуск Strapi в проде (`npm ci`, `npm run build`, далее запуск через Passenger по п. 4.5) и путь к приложению в конфиге Passenger (`AppRoot`/`StartupFile`).
- [ ] После фикса повторить `curl` к `/api/...` и только потом запускать `npm run build`.

Важно про итоговые файлы: сборка может завершиться статусом `Complete`, но страницы соберутся с пустыми/урезанными данными из CMS (а динамические маршруты событий могут не сгенерироваться). Для корректного `dist` Strapi должен быть доступен во время сборки.

### 3.2. Загрузка на хостинг

1. По **FTP/SFTP** или файловому менеджеру откройте **корень основного сайта** (обычно `public_html`).
2. Загрузите **содержимое** `dist/` (файлы `index.html`, папки `gallery`, `_astro`, …), не сам каталог `dist` как одну пустую оболочку без файлов внутри.
3. Проверьте в браузере главную, `/gallery`, `/sportsmen`, страницу события.

### 3.3. Локальная разработка

В `astro-app/.env`:

```env
STRAPI_URL=https://admin.pantera-boxing.ru
STRAPI_TOKEN=...
```

---

## 4. Часть B — Strapi на поддомене

### 4.1. Зависимости проекта под MySQL

В проекте Strapi в зависимостях должен быть драйвер **`mysql2`**. При развёртывании на сервере выполняйте **`npm ci`** в корне проекта.

Переменные окружения для продакшена (см. ниже) задают `DATABASE_CLIENT=mysql`.

### База данных: будет ли всё нормально работать на MySQL (SQL)?

Да. Strapi официально поддерживает **MySQL** — это нормальный продакшен‑вариант. В вашем проекте в `config/database.ts` уже описаны клиенты `sqlite`, `mysql` и `postgres`: достаточно в `.env` на сервере указать **`DATABASE_CLIENT=mysql`** и реквизиты БД из панели Beget — Strapi создаст таблицы и будет хранить контент в MySQL.

- **Локально** удобно оставить **`DATABASE_CLIENT=sqlite`** (как по умолчанию) — быстрый старт без сервера БД.
- **На Beget** — **MySQL**: один контур для админки, API и загруженных файлов (медиа в `public/uploads`).

Ограничение касается не «SQL да/нет», а **переноса с другой СУБД**: содержимое **Strapi Cloud (PostgreSQL)** в **MySQL** не переносится прямым дампом SQL — используйте **официальный перенос (Data Transfer)** между инстансами Strapi или набор контента заново (см. п. 4.2).

### 4.2. Перенос контента со Strapi Cloud

Если облачный инстанс ещё доступен:

1. Поднимите новый Strapi на Beget (шаги 4.3–4.6).
2. Используйте **Transfer Tokens** и встроенный перенос между инстансами Strapi (см. [документацию Strapi: Data Transfer](https://docs.strapi.io)) **или** экспортируйте контент вручную.

Если облако недоступно — контент нужно **восстановить вручную** из резервных копий или заново набрать в админке.

> Перенос **дампа PostgreSQL** с Cloud в **MySQL** на Beget «как есть» невозможен — либо transfer через Strapi, либо миграция данных отдельными средствами.

### 4.3. Загрузка кода Strapi на сервер

1. Подключитесь по **SSH** к аккаунту Beget (логин, `username.beget.tech` — см. панель).
2. Перейдите в **Docker**‑окружение (как в [инструкции Beget по Node.js](https://beget.com/ru/kb/how-to/web-apps/node-js)):

   ```bash
   ssh username@username.beget.tech
   ssh localhost -p 222
   ```

3. Установите актуальный **Node.js** (Strapi в `package.json` требует **Node 20+**). Следуйте разделам той же статьи Beget про установку в `~/.local` и проверьте `node -v`.

4. В каталоге, который соответствует **сайту поддомена CMS** (см. путь в панели к файлам сайта), разверните **корень репозитория Strapi** (git clone, rsync, архив + распаковка), например:

   ```text
   ~/admin.pantera-boxing.ru/   # корень приложения Strapi
   ```

### 4.4. Переменные окружения Strapi (файл `.env`)

Создайте **`.env`** в корне проекта Strapi на сервере (не коммитьте секреты). Пример — подставьте свои значения:

```env
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# из панели MySQL
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=имя_бд
DATABASE_USERNAME=пользователь
DATABASE_PASSWORD=пароль

# сгенерируйте надёжные случайные строки (один раз и сохраните)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
ENCRYPTION_KEY=...

# Публичный URL поддомена CMS (часто используют для server.url в Strapi)
PUBLIC_URL=https://admin.pantera-boxing.ru
```

Убедитесь, что в `config/server.ts` у Strapi задан **`url`** (например `env('PUBLIC_URL')`), иначе админка может строить неверные ссылки на API. Шаблон см. в [документации Strapi — конфигурация сервера](https://docs.strapi.io).

### 4.5. Сборка и первый запуск (в Docker по SSH)

```bash
cd ~/путь/к/корню-Strapi
npm ci
npm run build
```

Проверка в консоли (временно):

```bash
npm run start
```

Если Strapi отвечает, остановите процесс (Ctrl+C) и настройте постоянный запуск через **Phusion Passenger** по образцу [статьи Beget про Node / Nuxt](https://beget.com/ru/kb/how-to/web-apps/node-js):

- В корне **веб‑доступа** поддомена создайте `.htaccess` с директивами `PassengerNodejs`, `PassengerAppRoot`, `PassengerAppType node`, `PassengerStartupFile`.
- **StartupFile** для Strapi обычно отдельный лёгкий `server.js` (или скрипт), который запускает production‑сервер Strapi после `npm run build` — точное имя файла уточните по логам Passenger или в тикете поддержки Beget.
- После изменений создайте/обновите `tmp/restart.txt` в каталоге приложения, как описано у Beget.

Если Passenger конфигурировать не удалось — напишите в **поддержку Beget** с вопросом: «запуск Strapi 5 (Node 20) в Passenger, какой StartupFile».

### 4.6. Права и CORS

1. Убедитесь, что папки `public/uploads` доступны для записи процессом Node (загрузка медиа).
2. В Strapi для запросов с браузера с основного домена при необходимости настройте **CORS** в `config/middlewares.ts` (разрешённый origin: `https://pantera-boxing.ru`). Для **серверного** SSG‑билда Astro важен доступ с машины, где выполняется `npm run build`, до `https://admin.pantera-boxing.ru`.

### 4.7. API‑токен для Astro

1. Откройте `https://admin.pantera-boxing.ru/admin`.
2. **Settings → API Tokens** — создайте токен с правами **только на чтение** нужных типов контента.
3. Пропишите его в `astro-app/.env` и в секретах CI как `STRAPI_TOKEN`.

---

## 5. Отключение старых сервисов

1. **Strapi Cloud** — после успешного переноса данных отмените подписку / удалите проект, чтобы не платить дважды.
2. **Vercel** — отвяжите домен и удалите проект, когда убедитесь, что сайт на Beget работает.
3. **DNS** — основной домен и поддомен `admin` должны указывать на Beget; уберите старые записи на Vercel/Strapi Cloud.

---

## 6. Автообновление статики после публикации в Strapi (webhook → GitHub → Beget)

После правок в админке SSG‑сайт **сам не обновится**, пока не выполнится новая сборка и не зальётся `dist/`.

В репозитории есть workflow [`.github/workflows/rebuild-static.yml`](../.github/workflows/rebuild-static.yml): он **собирает Astro** с секретами `STRAPI_URL` / `STRAPI_TOKEN` и **по желанию** выкладывает каталог на Beget по **FTP**.

### 6.1. Секреты и переменная в GitHub

**Settings → Secrets and variables → Actions**

| Имя | Назначение |
|-----|------------|
| `STRAPI_URL` | Публичный URL Strapi на Beget, например `https://admin.pantera-boxing.ru` |
| `STRAPI_TOKEN` | API‑токен (read) из Strapi для сборки |
| `BEGET_FTP_HOST` | FTP‑хост из панели Beget |
| `BEGET_FTP_USER` | Логин FTP |
| `BEGET_FTP_PASSWORD` | Пароль FTP |
| `BEGET_FTP_REMOTE_DIR` | Каталог на сервере для заливки **содержимого** `dist`, часто `./public_html/` или `./www/pantera-boxing.ru/public_html/` — смотрите путь в панели к корню **основного** сайта |

**Переменная** (не секрет): **Settings → Secrets and variables → Actions → Variables**

| Имя | Значение | Зачем |
|-----|----------|--------|
| `BEGET_FTP_DEPLOY` | `true` | Включает job деплоя по FTP после сборки. Если не задать или не `true`, workflow только соберёт проект и сохранит артефакт `astro-dist` (можно скачать вручную). |

#### Деплой без FTP (файловый менеджер Beget)

Если вы **не** используете FTP и заливаете сайт через **менеджер файлов** в панели — это нормально:

1. **Не** включайте автозаливку: переменную `BEGET_FTP_DEPLOY` не задавайте или оставьте не равной `true`. Секреты `BEGET_FTP_*` не нужны.
2. Настройте **webhook Strapi → GitHub** (п. 6.3–6.4) или запускайте workflow вручную (**Actions → Rebuild static site → Run workflow**).
3. После успешного run откройте job → раздел **Artifacts** → скачайте **`astro-dist`**, распакуйте.
4. В файловом менеджере Beget замените **содержимое** корня основного сайта (часто `public_html`) **содержимым** распакованного каталога (как в п. 3.2: внутри должны лежать `index.html`, `_astro`, папки страниц и т.д.).

Так вы получаете **автосборку** при публикации в CMS и **ручную выкладку** одним архивом — без FTP в CI. Альтернатива на будущее: деплой по **SFTP/SSH** из GitHub Actions, если на тарифе Beget доступен SSH (отдельный action и ключи).

**Webhook и ежедневный cron** дополняют друг друга: webhook пересобирает сайт при правках контента; **расписание** (`schedule` в том же workflow, см. `docs/events-date-sort-and-scheduled-deploy.md`) — чтобы после смены календарного дня обновились блоки вроде «план / прошлое» у событий **без** новой записи в Strapi.

Для вызова GitHub API понадобится **Personal Access Token** (см. п. 6.3): его **не** кладут в репозиторий, а используют в Strapi (заголовок) или в PHP‑скрипте.

Проверка: **Actions → Rebuild static site → Run workflow** — должна пройти сборка; при `BEGET_FTP_DEPLOY=true` и корректных FTP‑секретах обновится хостинг.

### 6.2. Почему нельзя просто указать webhook Strapi на GitHub

**GitHub** для [`repository_dispatch`](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event) ожидает тело запроса вида:

```json
{ "event_type": "strapi_publish", "client_payload": {} }
```

**Strapi** в исходящем webhook отправляет **свой** JSON о событии (создание/обновление записи и т.д.). Поэтому прямой URL вида `https://api.github.com/repos/ВЛАДЕЛЕЦ/РЕПОЗИТОРИЙ/dispatches` в настройках Strapi **без посредника обычно не заработает** — GitHub вернёт ошибку.

Ниже три рабочих схемы.

### 6.3. Вариант A — небольшой PHP‑скрипт на основном сайте Beget (без сторонних сервисов)

Если на **основном** домене на Beget доступен **PHP** (типично для виртуального хостинга):

1. В корне сайта (рядом с `public_html` или внутри, в зависимости от структуры) создайте файл, **недоступный из браузера без секрета**, например `public_html/rebuild-github.php` (имя придумайте неочевидное).
2. В коде: принять **POST** от Strapi, проверить общий секрет в заголовке (например `X-Rebuild-Key`), затем через **`curl`** или `file_get_contents` выполнить POST на GitHub:

   - URL: `https://api.github.com/repos/<ВЛАДЕЛЕЦ>/<РЕПО>/dispatches`
   - Заголовки: `Authorization: Bearer <GITHUB_PAT>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`
   - Тело: `{"event_type":"strapi_publish","client_payload":{"source":"strapi"}}`

3. **PAT (classic)** создайте в GitHub: **Settings → Developer settings → Personal access tokens**. Нужны права **`repo`** (полный доступ к репозиторию) или **fine‑grained** токен с доступом к этому репозиторию и правом **Contents: Read and write** (см. актуальную [документацию GitHub](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)).

4. В **Strapi**: **Settings → Webhooks → Create new webhook**:
   - **URL**: `https://pantera-boxing.ru/rebuild-github.php` (ваш реальный путь к скрипту).
   - **Headers**: например `X-Rebuild-Key: <длинная_случайная_строка>` (ту же строку проверяйте в PHP).
   - **Events**: включите события для нужных действий (**Entry create**, **update**, **delete**, при необходимости **publish** — в зависимости от версии и списка в админке).

**Безопасность:** не коммитьте PAT и ключ в репозиторий; файл PHP должен отклонять запросы без верного заголовка.

Пример каркаса (адаптируйте пути и константы):

```php
<?php
declare(strict_types=1);

$expected = getenv('REBUILD_KEY');
$githubToken = getenv('GITHUB_DISPATCH_TOKEN');
$repo = getenv('GITHUB_REPO'); // формат owner/name

if (($_SERVER['HTTP_X_REBUILD_KEY'] ?? '') !== $expected) {
  http_response_code(403);
  exit('forbidden');
}

$ch = curl_init("https://api.github.com/repos/{$repo}/dispatches");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Accept: application/vnd.github+json',
    'X-GitHub-Api-Version: 2022-11-28',
    "Authorization: Bearer {$githubToken}",
    'Content-Type: application/json',
  ],
  CURLOPT_POSTFIELDS => json_encode([
    'event_type' => 'strapi_publish',
    'client_payload' => ['source' => 'strapi'],
  ]),
  CURLOPT_RETURNTRANSFER => true,
]);
curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
http_response_code($code >= 200 && $code < 300 ? 204 : 502);
```

Переменные `REBUILD_KEY`, `GITHUB_DISPATCH_TOKEN`, `GITHUB_REPO` удобно задать в панели Beget для PHP (если доступно) или заменить на литералы **только** если файл лежит вне веб‑корня.

### 6.4. Вариант B — Make.com / Pipedream / аналог

Создайте сценарий: **входящий HTTP (webhook)** → получает POST от Strapi → второй шаг **HTTP Request** на `https://api.github.com/repos/.../dispatches` с нужными заголовками и телом из п. 6.3. URL первого шага укажите в Strapi как адрес webhook. Лимиты бесплатных тарифов учитывайте отдельно.

### 6.5. Вариант C — только ручной запуск

В любой момент: **GitHub → Actions → Rebuild static site → Run workflow**. Webhook не настраивается.

### 6.6. Замечания

- Публичный Strapi (`STRAPI_URL`) должен отвечать **200** во время сборки на GitHub; иначе job упадёт.
- Для прода используйте именно `https://admin.pantera-boxing.ru`, не `http://`.
- Частые сохранения в админке будут часто дергать GitHub и FTP — при необходимости в Strapi ограничьте типы контента или события webhook только **Publish**, а не каждое автосохранение (если доступно в вашей версии).
- Альтернатива FTP — **SFTP/rsync по SSH** из отдельного job (другой action и секреты).

Подробности по CI и деплою статики: [README.md](./README.md) (разделы «CI/CD» и «Деплой»).

---

## 7. Чеклист

- [ ] Два сайта в панели: основной + поддомен CMS, SSL на обоих.
- [ ] MySQL создана, учётные данные в `.env` Strapi.
- [ ] В `package.json` Strapi в зависимостях есть `mysql2`, в `.env` указано `DATABASE_CLIENT=mysql`.
- [ ] Strapi собран (`npm run build`) и запущен (Passenger или иной способ от Beget).
- [ ] Админка открывается по HTTPS, создан API‑токен для Astro.
- [ ] `astro-app`: `STRAPI_URL`/`STRAPI_TOKEN`, успешный `npm run build`.
- [ ] Содержимое `dist/` залито в корень основного сайта (вручную или через `rebuild-static.yml`).
- [ ] В GitHub заданы секреты для workflow пересборки; при автодеплое — переменная `BEGET_FTP_DEPLOY=true` и секреты `BEGET_FTP_*`.
- [ ] Настроен webhook Strapi → GitHub (PHP‑реле, Make/Pipedream и т.п.) или устраивает ручной запуск workflow.
- [ ] Проверены страницы, медиа, события, формы (если есть).
- [ ] Старые хостинги отключены, DNS обновлены.

---

## 8. Полезные ссылки

- [Node.js на Beget](https://beget.com/ru/kb/how-to/web-apps/node-js)
- [Домены и поддомены](https://beget.com/ru/kb/manual/domeny-i-poddomeny)
- [Strapi: документация](https://docs.strapi.io)
- [GitHub: repository_dispatch](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)
- Внутри репозитория: [`.github/workflows/rebuild-static.yml`](../.github/workflows/rebuild-static.yml), [docs/README.md](./README.md)

---

*Документ отражает типичную схему; параметры тарифа «Блог» и интерфейс панели уточняйте на официальном сайте Beget на момент подключения.*
