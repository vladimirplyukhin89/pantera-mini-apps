# `revealOnView` — анимация появления во viewport

Документ описывает работу функции `initRevealOnView()` из `astro-app/src/lib/revealOnView.ts`.

## Назначение

`initRevealOnView()` включает одноразовый reveal-эффект для элементов, попадающих во viewport:

- наблюдает элементы через `IntersectionObserver`;
- добавляет CSS-класс видимости при первом пересечении;
- поддерживает `prefers-reduced-motion`;
- умеет сохранять факт завершенной анимации в `sessionStorage`;
- позволяет управлять направлением, дистанцией и скоростью через `data-*`.

## Базовое подключение

```ts
import { initRevealOnView } from '../lib/revealOnView';

initRevealOnView({
  selector: '[data-value-card]',
  visibleClass: 'value-card--visible',
});
```

## API

### `initRevealOnView(options)`

`options`:

- `selector: string` — CSS-селектор целевых элементов (обязательно).
- `visibleClass?: string` — класс, добавляемый при reveal.  
  По умолчанию: `is-reveal-visible`.
- `observedAttr?: string` — внутренний маркер "элемент уже взят в наблюдение".  
  По умолчанию: `data-reveal-observed`.
- `completeAttr?: string` — маркер "reveal завершен".  
  По умолчанию: `data-reveal-complete`.
- `persistCompleteInSession?: boolean` — сохранять факт reveal в `sessionStorage`.  
  По умолчанию: `false`.
- `sessionStorageKey?: string` — префикс ключей в `sessionStorage`.  
  По умолчанию: ``reveal:${window.location.pathname}:${selector}``.
- `rootMargin?: string` — `IntersectionObserver.rootMargin`.  
  По умолчанию: `0px 0px -12% 0px`.
- `threshold?: number | number[]` — `IntersectionObserver.threshold`.  
  По умолчанию: `0.12`.
- `once?: boolean` — снимать элемент с наблюдения после reveal.  
  По умолчанию: `true`.
- `defaultDirection?: 'up' | 'down' | 'left' | 'right' | 'none'` — направление по умолчанию.  
  По умолчанию: `up`.
- `defaultDistance?: string` — дистанция смещения до reveal.  
  По умолчанию: `1.5rem`.
- `defaultDurationMs?: number` — длительность анимации в мс.  
  По умолчанию: `750`.

## Управление через `data-*`

Для каждого элемента можно переопределить параметры:

- `data-reveal-direction="up|down|left|right|none"`
- `data-reveal-distance="24px"` (любая валидная CSS длина)
- `data-reveal-speed="600"` (мс)
- `data-reveal-id="stable-id"` (стабильный ID для session persistence)

`data-reveal-id` важен, если включен `persistCompleteInSession`:  
по нему формируется ключ, чтобы элемент не анимировался повторно в пределах сессии.

## CSS-контракт

Helper выставляет CSS-переменные:

- `--reveal-translate-x`
- `--reveal-translate-y`
- `--reveal-duration`
- (если не задано) `--reveal-index`

Минимальный пример стилей:

```css
.card {
  opacity: 0;
  transform: translate3d(var(--reveal-translate-x, 0px), var(--reveal-translate-y, 1.5rem), 0);
  transition:
    opacity var(--reveal-duration, 750ms) cubic-bezier(0.22, 1, 0.36, 1),
    transform var(--reveal-duration, 750ms) cubic-bezier(0.22, 1, 0.36, 1);
}

.card--visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
```

## Поведение в Astro

`initRevealOnView()`:

- запускается сразу при инициализации;
- повторно запускается на `astro:page-load`;
- имеет защиту от повторного бинда одного и того же конфига в рамках страницы.

## Готовые примеры в проекте

- `astro-app/src/components/ClubValues.astro`
- `astro-app/src/components/AthleteCard.astro`

## Рекомендации

- Для `persistCompleteInSession: true` задавайте стабильный `data-reveal-id`.
- Если анимация не должна повторяться вообще, используйте `once: true` (по умолчанию уже так).
- Для accessibility всегда оставляйте корректный статичный вид без анимации (`prefers-reduced-motion` уже учитывается helper-ом).
