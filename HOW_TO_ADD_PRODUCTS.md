# Как добавить товары (футболки) в базу данных

## Шаг 1: Подготовьте изображения

Поместите изображения футболок в папку:
```
astro-app/public/images/
```

Например:
- `astro-app/public/images/tshirt-black.jpg`
- `astro-app/public/images/tshirt-white.jpg`
- и т.д.

## Шаг 2: Откройте файл скрипта

Откройте файл:
```
astro-app/src/scripts/add-products.js
```

## Шаг 3: Заполните данные о товарах

Найдите массив `products` в файле (примерно на строке 70) и заполните своими данными:

```javascript
const products = [
  {
    name: 'Футболка Pantera - Черная',        // ← название товара
    description: 'Описание футболки...',       // ← описание
    price: 1500,                               // ← цена в рублях
    image_url: '/images/tshirt-black.jpg',     // ← путь к изображению
    variants: [                                // ← размеры и остатки
      { size: 'S', stock: 10 },                // размер S, 10 штук
      { size: 'M', stock: 15 },                // размер M, 15 штук
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ]
  },
  // Добавьте еще товары здесь...
];
```

### Поля товара:

- **name** (string) - Название товара (обязательно)
- **description** (string) - Описание товара (может быть пустым)
- **price** (number) - Цена в рублях (обязательно)
- **image_url** (string) - Путь к изображению от папки `public/` (например: `/images/tshirt-black.jpg`)
- **variants** (array) - Массив размеров с остатками (обязательно)

### Варианты (размеры):

Каждый элемент массива `variants`:
- **size** (string) - Размер (S, M, L, XL, XXL и т.д.)
- **stock** (number) - Количество на складе

## Шаг 4: Запустите скрипт

Выполните команду:

```bash
cd astro-app
npm run add-products
```

## Пример заполнения

```javascript
const products = [
  {
    name: 'Футболка Pantera - Черная',
    description: 'Классическая черная футболка с логотипом зала бокса Pantera. 100% хлопок.',
    price: 1500,
    image_url: '/images/tshirt-black.jpg',
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ]
  },
  {
    name: 'Футболка Pantera - Белая',
    description: 'Белая футболка с логотипом зала бокса Pantera. Идеальна для тренировок.',
    price: 1500,
    image_url: '/images/tshirt-white.jpg',
    variants: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 10 },
      { size: 'XXL', stock: 5 }
    ]
  }
];
```

## Что делает скрипт?

1. ✅ Инициализирует БД (создает таблицы, если их нет)
2. ✅ Добавляет товар в таблицу `products`
3. ✅ Добавляет все размеры в таблицу `product_variants`
4. ✅ Показывает статистику после добавления

## Вопросы?

Если возникнут вопросы - обращайтесь!

