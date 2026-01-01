# Инструкция по настройке GitHub

## Шаг 1: Проверка данных в БД

Перед коммитом проверим что данные заполнены:

```bash
cd astro-app
sqlite3 database/shop.db

# Проверка товаров
.headers on
.mode column
SELECT COUNT(*) as total_products FROM products;
SELECT id, name, collection_name FROM products;

# Проверка размеров
SELECT COUNT(*) as total_variants FROM product_variants;
SELECT p.name, pv.size, pv.price, pv.stock 
FROM products p 
JOIN product_variants pv ON p.id = pv.product_id 
LIMIT 10;

.exit
```

## Шаг 2: Инициализация Git репозитория

```bash
# Перейти в корень проекта
cd ~/projects/pantera-mini-apps

# Инициализировать Git (уже сделано)
git init
```

## Шаг 3: Настройка .gitignore

Файл `.gitignore` уже создан и исключает:
- Базу данных (`database/*.db`)
- `node_modules/`
- `.env` файлы
- Временные файлы

**Важно:** База данных `shop.db` НЕ будет закоммичена (это правильно!).

## Шаг 4: Первый коммит

```bash
# Добавить все файлы (кроме тех что в .gitignore)
git add .

# Проверить что будет добавлено
git status

# Создать первый коммит
git commit -m "Initial commit: Astro project setup, database schema, products added"
```

## Шаг 5: Создание репозитория на GitHub

1. **Зайдите на GitHub.com** и войдите в свой аккаунт

2. **Создайте новый репозиторий:**
   - Нажмите кнопку "New" (или "+" → "New repository")
   - Название: `pantera-mini-apps` (или любое другое)
   - Описание: "Telegram Mini App - магазин футболок зала бокса"
   - Выберите: **Private** (рекомендуется) или Public
   - НЕ создавайте README, .gitignore или лицензию (у нас уже есть)
   - Нажмите "Create repository"

3. **Скопируйте URL репозитория:**
   - Это будет что-то вроде: `https://github.com/yourusername/pantera-mini-apps.git`
   - Или: `git@github.com:yourusername/pantera-mini-apps.git`

## Шаг 6: Подключение к GitHub

```bash
# Добавить remote репозиторий (замените URL на ваш)
git remote add origin https://github.com/yourusername/pantera-mini-apps.git

# Или если используете SSH:
# git remote add origin git@github.com:yourusername/pantera-mini-apps.git

# Проверить что remote добавлен
git remote -v

# Отправить код на GitHub
git branch -M main
git push -u origin main
```

## Шаг 7: Проверка

После `git push` обновите страницу репозитория на GitHub - там должен появиться ваш код!

---

## Полезные команды Git

### Просмотр статуса:
```bash
git status
```

### Добавить изменения:
```bash
git add .              # все файлы
git add file.js        # конкретный файл
```

### Коммит:
```bash
git commit -m "Описание изменений"
```

### Отправить на GitHub:
```bash
git push
```

### Получить изменения с GitHub:
```bash
git pull
```

### Посмотреть историю:
```bash
git log --oneline
```

---

## ⚠️ Важные замечания

1. **База данных НЕ коммитится** - это правильно! Она будет создаваться заново через миграции
2. **`.env` файлы** - не коммитятся (содержат секретные данные)
3. **`node_modules/`** - не коммитятся (устанавливаются через `npm install`)

---

## Что делать если нужно добавить БД в репозиторий?

Обычно базу данных НЕ коммитят, но если нужно (для тестовых данных):

1. Уберите `database/*.db` из `.gitignore`
2. Добавьте файл: `git add database/shop.db`
3. Закоммитьте: `git commit -m "Add database with test data"`

Но для продакшена лучше использовать миграции и seed скрипты!

