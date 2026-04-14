# SSH-ключи для деплоя на Beget (GitHub Actions)

Здесь **локально** хранится пара ключей для `rsync` по SSH. В репозиторий попадают только этот файл и `.gitignore`; сами ключи **игнорируются git** — не коммитьте их.

## 1. Сгенерировать новую пару (один раз)

Из **корня репозитория** (`pantera-mini-apps/`):

```bash
ssh-keygen -t ed25519 -C "github-actions-beget" -f deploy-keys/beget_deploy_ed25519 -N ""
```

Появятся:

- `deploy-keys/beget_deploy_ed25519` — **приватный** (в GitHub Secret `BEGET_SSH_KEY`)
- `deploy-keys/beget_deploy_ed25519.pub` — **публичный** (одна строка на Beget)

## 2. Публичная строка → сервер Beget

Подключитесь по SSH **с паролем** (пока ключ не добавлен):

```bash
ssh ВАШ_ЛОГИН@ВАШ_ЛОГИН.beget.tech
```

На сервере:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

Вставьте **целиком одну строку** из файла `deploy-keys/beget_deploy_ed25519.pub` (можно добавить второй строкой, если там уже есть другие ключи). Сохраните.

```bash
chmod 600 ~/.ssh/authorized_keys
```

Проверка: строка на сервере и строка в локальном `.pub` **должны совпадать** посимвольно (тип `ssh-ed25519`, длинная base64-часть, комментарий).

## 3. Приватный ключ → GitHub

**Settings → Secrets →** создайте/обновите **`BEGET_SSH_KEY`**: вставьте **всё содержимое** файла `deploy-keys/beget_deploy_ed25519` (от `BEGIN OPENSSH PRIVATE KEY` до `END …`).

## 4. Проверка с вашего ПК

```bash
ssh -i deploy-keys/beget_deploy_ed25519 -o BatchMode=yes ВАШ_ЛОГИН@ВАШ_ЛОГИН.beget.tech
```

Должен открыться шелл **без пароля**. После этого тот же приватный ключ в Actions сможет выполнить `rsync`.

## 5. Секреты GitHub (напоминание)

| Secret            | Значение                          |
|-------------------|-----------------------------------|
| `BEGET_SSH_HOST`  | например `vladi93f.beget.tech`    |
| `BEGET_SSH_USER`  | например `vladi93f`               |
| `BEGET_SSH_REMOTE_DIR` | абсолютный путь к `public_html/` с `/` в конце |
| `BEGET_SSH_KEY`   | содержимое `beget_deploy_ed25519` |

Подробнее: [docs/github-actions-beget-autodeploy.md](../docs/github-actions-beget-autodeploy.md).
