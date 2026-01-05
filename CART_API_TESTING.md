# Тестирование Cart API

Этот документ содержит инструкции по тестированию Cart API endpoints.

## Предварительные требования

1. **Запустите dev сервер:**
   ```bash
   npm run dev
   ```
   Сервер будет доступен на `http://localhost:4321`

2. **Убедитесь, что в базе данных есть товары:**
   
   **⚠️ ВАЖНО:** Тест использует **существующие товары** из базы данных и **НЕ требует** запуска seed скрипта!
   
   Тест автоматически:
   - ✅ Использует существующие товары из базы
   - ✅ Работает только с тестовой корзиной (не изменяет товары)
   - ✅ Автоматически очищает тестовые данные после завершения
   
   Если товаров нет в базе, добавьте их через SQLite CLI или админ-панель.

## Способ 1: Автоматический тест (рекомендуется)

Запустите тестовый скрипт:

```bash
node src/scripts/test-cart-api.js
```

Скрипт автоматически проверит все endpoints и выведет результаты.

## Способ 2: Ручное тестирование через curl

### 1. Получить корзину пользователя (GET)

```bash
# Получить пустую корзину
curl "http://localhost:4321/api/cart?telegram_user_id=test_user_123"

# Ожидаемый ответ (если корзина пуста):
# {
#   "id": null,
#   "telegram_user_id": "test_user_123",
#   "created_at": null,
#   "updated_at": null,
#   "items": []
# }
```

### 2. Добавить товар в корзину (POST)

**Сначала получите ID товара и варианта:**

```bash
# Получить список товаров
curl "http://localhost:4321/api/products"

# Найдите product_id и variant_id из ответа
```

**Затем добавьте товар в корзину:**

```bash
curl -X POST "http://localhost:4321/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "test_user_123",
    "product_id": 1,
    "variant_id": 1,
    "quantity": 2
  }'

# Ожидаемый ответ:
# {
#   "id": 1,
#   "cart_id": 1,
#   "product_id": 1,
#   "variant_id": 1,
#   "size": "M",
#   "quantity": 2,
#   "created_at": "2024-01-01T12:00:00.000Z",
#   "product_name": "Название товара",
#   "product_image_url": "/images/product.jpg",
#   "price": 1500,
#   "stock": 10
# }
```

### 3. Получить корзину с товарами (GET)

```bash
curl "http://localhost:4321/api/cart?telegram_user_id=test_user_123"

# Ожидаемый ответ:
# {
#   "id": 1,
#   "telegram_user_id": "test_user_123",
#   "created_at": "2024-01-01T12:00:00.000Z",
#   "updated_at": "2024-01-01T12:00:00.000Z",
#   "items": [
#     {
#       "id": 1,
#       "cart_id": 1,
#       "product_id": 1,
#       "variant_id": 1,
#       "size": "M",
#       "quantity": 2,
#       ...
#     }
#   ]
# }
```

### 4. Обновить количество товара (PUT)

**Используйте ID элемента корзины из предыдущего ответа:**

```bash
curl -X PUT "http://localhost:4321/api/cart/items/1" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'

# Ожидаемый ответ:
# {
#   "id": 1,
#   "cart_id": 1,
#   "product_id": 1,
#   "variant_id": 1,
#   "size": "M",
#   "quantity": 3,
#   ...
# }
```

### 5. Удалить товар из корзины (DELETE)

```bash
curl -X DELETE "http://localhost:4321/api/cart/items/1"

# Ожидаемый ответ:
# {
#   "success": true,
#   "message": "Товар успешно удален из корзины"
# }
```

### 6. Очистить корзину (DELETE)

```bash
curl -X DELETE "http://localhost:4321/api/cart?telegram_user_id=test_user_123"

# Ожидаемый ответ:
# {
#   "success": true,
#   "message": "Корзина успешно очищена"
# }
```

## Способ 3: Тестирование через браузер

### GET запросы

Откройте в браузере:

```
http://localhost:4321/api/cart?telegram_user_id=test_user_123
```

Вы увидите JSON ответ с данными корзины.

### POST/PUT/DELETE запросы

Для этих запросов используйте:
- **Postman** (https://www.postman.com/)
- **Insomnia** (https://insomnia.rest/)
- **Thunder Client** (расширение для VS Code)
- Или curl команды (см. выше)

## Тестирование валидации

### Тест 1: GET без telegram_user_id

```bash
curl "http://localhost:4321/api/cart"

# Ожидаемый ответ (400):
# {
#   "error": "Не указан параметр telegram_user_id",
#   "message": "Параметр telegram_user_id обязателен"
# }
```

### Тест 2: POST без обязательных полей

```bash
curl -X POST "http://localhost:4321/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "test_user_123"
  }'

# Ожидаемый ответ (400):
# {
#   "error": "Не указан product_id",
#   "message": "Поле product_id обязательно и должно быть числом"
# }
```

### Тест 3: PUT с несуществующим ID

```bash
curl -X PUT "http://localhost:4321/api/cart/items/99999" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1
  }'

# Ожидаемый ответ (404):
# {
#   "error": "Элемент корзины не найден",
#   "message": "Элемент корзины с ID 99999 не существует"
# }
```

### Тест 4: POST с несуществующим товаром

```bash
curl -X POST "http://localhost:4321/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "test_user_123",
    "product_id": 99999,
    "variant_id": 99999,
    "quantity": 1
  }'

# Ожидаемый ответ (400):
# {
#   "error": "Не удалось добавить товар в корзину",
#   "message": "Вариант товара не найден"
# }
```

## Проверка работы SQL JOIN

После добавления товара в корзину, проверьте, что в ответе есть полная информация о товаре:

```bash
curl "http://localhost:4321/api/cart?telegram_user_id=test_user_123"
```

В ответе должны быть поля:
- `product_name` - название товара
- `product_image_url` - URL изображения
- `price` - цена товара
- `stock` - остаток на складе

Эти данные получаются через SQL JOIN из таблиц `products` и `product_variants`.

## Проверка уникальности товаров

Попробуйте добавить один и тот же товар дважды:

```bash
# Первый раз
curl -X POST "http://localhost:4321/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "test_user_123",
    "product_id": 1,
    "variant_id": 1,
    "quantity": 1
  }'

# Второй раз (тот же товар)
curl -X POST "http://localhost:4321/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "test_user_123",
    "product_id": 1,
    "variant_id": 1,
    "quantity": 2
  }'
```

Во второй раз количество должно увеличиться, а не создаться новый элемент корзины.

## Проверка остатков на складе

Попробуйте добавить товар в количестве, превышающем остаток:

```bash
curl -X POST "http://localhost:4321/api/cart/items" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": "test_user_123",
    "product_id": 1,
    "variant_id": 1,
    "quantity": 999
  }'

# Ожидаемый ответ (400):
# {
#   "error": "Не удалось добавить товар в корзину",
#   "message": "Недостаточно товара на складе. Доступно: X"
# }
```

## Устранение проблем

### Ошибка: "Cannot connect to server"

- Убедитесь, что dev сервер запущен: `npm run dev`
- Проверьте, что сервер работает на порту 4321

### Ошибка: "Вариант товара не найден"

- Убедитесь, что в базе данных есть товары (проверьте через SQLite CLI)
- Проверьте, что используете правильные `product_id` и `variant_id`
- **⚠️ НЕ запускайте seed скрипт** - он может перезаписать реальные данные!

### Ошибка: "Корзина не найдена"

- Это нормально для DELETE запроса, если корзина уже пуста
- Для GET запроса возвращается пустая корзина, а не ошибка

## Следующие шаги

После успешного тестирования Cart API можно переходить к:
- **Этап 6: Корзина** - создание страницы корзины с UI

