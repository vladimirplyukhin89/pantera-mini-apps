# Устранение проблем с Cart API

## Ошибка: "Could not import `../../../lib/cart.js`"

Эта ошибка возникает, когда Astro не может найти или импортировать файл `cart.ts`.

### Решение 1: Перезапустите dev сервер

После создания нового файла `cart.ts` нужно **перезапустить dev сервер**:

1. Остановите текущий dev сервер (Ctrl+C)
2. Запустите снова:
   ```bash
   npm run dev
   ```

Astro должен автоматически подхватить новый файл.

### Решение 2: Проверьте структуру файлов

Убедитесь, что файл существует:
```bash
ls -la src/lib/cart.ts
```

Должен быть файл `cart.ts` в папке `src/lib/`.

### Решение 3: Проверьте экспорты

Убедитесь, что все функции экспортируются:

```typescript
// src/lib/cart.ts
export function getCart(...) { ... }
export function clearCart(...) { ... }
export function addCartItem(...) { ... }
export function updateCartItem(...) { ... }
export function deleteCartItem(...) { ... }
export function getOrCreateCart(...) { ... }
```

### Решение 4: Проверьте импорты в API endpoints

В файлах API endpoints должны быть импорты с расширением `.js`:

```javascript
// src/pages/api/cart.js
import { getCart, clearCart } from '../../../lib/cart.js';
```

**Важно:** Используйте расширение `.js` даже для TypeScript файлов (это стандартная практика в TypeScript/ES modules).

### Решение 5: Очистите кэш Astro

Если проблема сохраняется, попробуйте очистить кэш:

```bash
# Остановите dev сервер
# Удалите папку .astro (если есть)
rm -rf .astro

# Запустите снова
npm run dev
```

## Ошибка: "Не удалось подключиться к серверу" в тесте

Эта ошибка возникает, когда тестовый скрипт не может подключиться к dev серверу.

### Решение:

1. **Убедитесь, что dev сервер запущен:**
   ```bash
   npm run dev
   ```

2. **Проверьте, что сервер работает на правильном порту:**
   - По умолчанию: `http://localhost:4321`
   - Проверьте в браузере: `http://localhost:4321/api/products`

3. **Убедитесь, что нет ошибок импорта:**
   - Если в консоли dev сервера есть ошибки импорта, исправьте их сначала
   - Перезапустите dev сервер после исправления

## Проверка работоспособности

После исправления ошибок проверьте:

1. **Dev сервер запущен без ошибок:**
   ```bash
   npm run dev
   # Должно быть: "astro v5.16.6 ready"
   ```

2. **API endpoint доступен:**
   ```bash
   curl http://localhost:4321/api/products
   # Должен вернуть JSON с товарами
   ```

3. **Cart API работает:**
   ```bash
   curl "http://localhost:4321/api/cart?telegram_user_id=test"
   # Должен вернуть JSON с корзиной (пустой или с товарами)
   ```

4. **Запустите тест:**
   ```bash
   npm run test:cart-api
   ```

## Если проблема сохраняется

1. Проверьте версию Node.js (должна быть 18+):
   ```bash
   node --version
   ```

2. Переустановите зависимости:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Проверьте конфигурацию Astro:
   - `astro.config.mjs` должен быть настроен правильно
   - `tsconfig.json` должен быть настроен правильно

