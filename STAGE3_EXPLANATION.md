# Этап 3: Базовая структура страниц - Объяснение

## Что было создано

### 1. Компоненты

#### `src/components/Layout.astro` - Базовый Layout

**Назначение:** Обертка для всех страниц, содержит общую структуру HTML

**Особенности:**
- Секция `---` (frontmatter) - JavaScript/TypeScript код
- Props: `title` (необязательный, по умолчанию "Pantera Shop")
- `<slot />` - место, куда вставляется содержимое страницы
- Telegram WebApp SDK подключен в `<head>`
- Глобальные стили (reset, базовые стили)

**Синтаксис Astro:**
```astro
---
// JavaScript секция
interface Props {
  title?: string;
}
const { title = 'Pantera Shop' } = Astro.props;
---

<!-- HTML разметка -->
<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>

<style>
  /* CSS стили (scoped - применяются только к этому компоненту) */
</style>
```

#### `src/components/Header.astro` - Шапка сайта

**Назначение:** Шапка с логотипом и иконкой корзины

**Props:**
- `cartItemsCount` - количество товаров в корзине (для бейджа)

**Особенности:**
- Sticky header (прилипает к верху при прокрутке)
- Иконка корзины (SVG)
- Бейдж с количеством товаров (отображается только если > 0)
- Использует CSS переменные Telegram WebApp для темизации

#### `src/components/BottomBar.astro` - Нижняя навигация

**Назначение:** Фиксированная нижняя панель навигации

**Props:**
- `currentPath` - текущий путь (для подсветки активной страницы)

**Особенности:**
- 4 кнопки навигации: Главная, Каталог, Корзина, Контакты
- Активная страница подсвечивается
- Фиксированная позиция (position: fixed)
- Поддержка safe-area для iOS (padding-bottom: env(safe-area-inset-bottom))

**Навигация:**
- `/` - Главная
- `/catalog` - Каталог
- `/cart` - Корзина
- `/contacts` - Контакты

---

### 2. Страницы

#### `src/pages/index.astro` - Главная страница

**Структура:**
- Использует Layout, Header, BottomBar
- Hero секция с приветствием
- CTA кнопка "Перейти в каталог"

#### `src/pages/catalog.astro` - Каталог

**Структура:**
- Заголовок "Каталог"
- Пока заглушка (данные будут добавлены на следующем этапе)

#### `src/pages/cart.astro` - Корзина

**Структура:**
- Заголовок "Корзина"
- Условный рендеринг: если корзина пуста - показываем сообщение
- Пока заглушка (данные будут добавлены на этапе 6)

#### `src/pages/contacts.astro` - Контакты

**Структура:**
- Заголовок "Контакты"
- Секция с контактной информацией (адрес, телефон, email)
- Можно заполнить реальными данными

---

## Важные концепции Astro

### 1. Синтаксис .astro файлов

Astro файлы состоят из 3 частей:

```astro
---
// 1. Frontmatter (---) - JavaScript/TypeScript
// Здесь можно импортировать, определять props, писать логику
import Layout from '../components/Layout.astro';
const title = 'Моя страница';
---

<!-- 2. HTML разметка -->
<Layout>
  <h1>{title}</h1>
</Layout>

<style>
  /* 3. CSS стили (scoped по умолчанию) */
  h1 {
    color: blue;
  }
</style>
```

### 2. Props (свойства компонентов)

**Определение Props:**
```astro
---
interface Props {
  title?: string;
  count: number;
}

const { title = 'Default', count } = Astro.props;
---
```

**Использование:**
```astro
<Header cartItemsCount={5} />
```

### 3. Slot - место для вставки содержимого

**В Layout.astro:**
```astro
<div class="container">
  <slot />
</div>
```

**На странице:**
```astro
<Layout>
  <h1>Мой контент</h1>  <!-- Это вставится в <slot /> -->
</Layout>
```

### 4. Условный рендеринг

```astro
{cartItemsCount > 0 ? (
  <span class="badge">{cartItemsCount}</span>
) : null}
```

Или:
```astro
{cartItems.length === 0 ? (
  <p>Корзина пуста</p>
) : (
  <div>Товары в корзине</div>
)}
```

### 5. Файловый роутинг

В Astro файлы в `src/pages/` автоматически становятся маршрутами:

- `src/pages/index.astro` → `/`
- `src/pages/catalog.astro` → `/catalog`
- `src/pages/cart.astro` → `/cart`
- `src/pages/product/[id].astro` → `/product/1`, `/product/2` (динамический маршрут)

### 6. CSS в Astro

**Scoped стили (по умолчанию):**
```astro
<style>
  h1 { color: blue; }  /* Применится только к этому компоненту */
</style>
```

**Глобальные стили:**
```astro
<style is:global>
  body { margin: 0; }  /* Применится ко всему сайту */
</style>
```

---

## Telegram WebApp SDK

**Подключение:**
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

**Использование CSS переменных:**
```css
background-color: var(--tg-theme-bg-color, #ffffff);
color: var(--tg-theme-text-color, #000000);
```

Telegram автоматически устанавливает CSS переменные для темизации приложения под тему Telegram.

**Основные переменные:**
- `--tg-theme-bg-color` - цвет фона
- `--tg-theme-text-color` - цвет текста
- `--tg-theme-hint-color` - цвет подсказок
- `--tg-theme-button-color` - цвет кнопок
- `--tg-theme-button-text-color` - цвет текста на кнопках
- `--tg-theme-link-color` - цвет ссылок

---

## Структура страницы

Каждая страница следует такой структуре:

```astro
---
import Layout from '../components/Layout.astro';
import Header from '../components/Header.astro';
import BottomBar from '../components/BottomBar.astro';
---

<Layout title="Название страницы">
  <Header cartItemsCount={0} />
  
  <main class="main-content">
    <!-- Контент страницы -->
  </main>

  <BottomBar currentPath="/current-path" />
</Layout>

<style>
  /* Стили страницы */
</style>
```

---

## Что дальше?

1. **Протестировать навигацию** - запустить dev сервер и проверить переходы между страницами
2. **Заполнить контакты** - добавить реальные данные в contacts.astro
3. **Настроить стили** - при необходимости скорректировать CSS

---

## Вопросы для проверки понимания

1. **Что такое frontmatter в Astro?**
   - Секция `---` в начале файла для JavaScript/TypeScript кода

2. **Как передать данные в компонент?**
   - Через props: `<Header cartItemsCount={5} />`

3. **Что такое `<slot />`?**
   - Место, куда вставляется содержимое компонента

4. **Как работает файловый роутинг в Astro?**
   - Файлы в `src/pages/` автоматически становятся маршрутами

5. **Что такое scoped стили?**
   - Стили, которые применяются только к текущему компоненту

