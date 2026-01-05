# Path Aliases - Алиасы для импортов

## Что это?

Path aliases позволяют использовать короткие пути для импортов вместо длинных относительных путей.

## До и После

### ❌ Было (относительные пути):
```javascript
// src/pages/api/cart/items/[id].js
import { updateCartItem } from '../../../../lib/cart.js';
```

### ✅ Стало (aliases):
```javascript
// src/pages/api/cart/items/[id].js
import { updateCartItem } from '@/lib/cart.js';
```

## Настройка

### 1. tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. astro.config.mjs
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
```

## Использование

### Импорт из `/src/lib/`:
```javascript
import { getCart } from '@/lib/cart.js';
import { getAllProducts } from '@/lib/products.js';
import type { Product } from '@/lib/types.js';
```

### Импорт из `/src/components/`:
```javascript
import ProductCard from '@/components/ProductCard.astro';
import Layout from '@/components/Layout.astro';
```

### Импорт из `/src/pages/`:
```javascript
import { someFunction } from '@/pages/some-page.js';
```

### Импорт из `/src/styles/`:
```javascript
import '@/styles/variables.css';
import '@/styles/fonts.css';
```

## Преимущества

1. ✅ **Короткие пути** - не нужно считать `../../../`
2. ✅ **Легко рефакторить** - при перемещении файлов пути не ломаются
3. ✅ **Читаемость** - сразу видно, откуда импорт (`@/lib/` = из библиотеки)
4. ✅ **Единообразие** - все импорты выглядят одинаково

## Примеры использования

### API Endpoints:
```javascript
// src/pages/api/cart.js
import { getCart, clearCart } from '@/lib/cart.js';
```

### Astro компоненты:
```astro
---
// src/pages/catalog.astro
import { getAllProducts } from '@/lib/products.js';
import type { Product } from '@/lib/types.js';
---
```

### React компоненты:
```tsx
// src/components/Cart.tsx
import { getCart } from '@/lib/cart.js';
import type { Cart } from '@/lib/types.js';
```

### Скрипты:
```javascript
// src/scripts/seed.js
import { initDatabase } from '@/lib/init-db.js';
import db from '@/lib/db.js';
```

## Важно

- ✅ Всегда используйте расширение файла (`.js`, `.ts`, `.astro`)
- ✅ `@/` указывает на папку `src/`
- ✅ Работает в TypeScript, JavaScript и Astro файлах
- ✅ Нужно перезапустить dev сервер после изменения конфигурации

## Обновленные файлы

Все импорты в проекте обновлены на использование `@/`:
- ✅ `src/pages/api/**/*.js`
- ✅ `src/pages/**/*.astro`
- ✅ `src/components/**/*.astro`
- ✅ `src/scripts/**/*.js`

