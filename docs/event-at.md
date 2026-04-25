# `eventAt` — правила дат событий и сортировка

Документ описывает функции из `astro-app/src/lib/eventAt.ts`.

## Назначение

Модуль инкапсулирует единые правила:

- как определять, событие "прошедшее" или "запланированное";
- как работать с датой `event_at` из CMS;
- как сортировать planned/past списки.

Ключевой принцип: сравнение выполняется **по календарному дню** в таймзоне клуба, а не по локали клиента.

## Таймзона

- Константа: `EVENTS_TIMEZONE = 'Asia/Yekaterinburg'`.
- Все day-based сравнения привязаны к этой зоне.

## API

### `eventCalendarDayKey(d: Date): string`

Возвращает ключ `YYYY-MM-DD` в `EVENTS_TIMEZONE` для переданного момента времени.

Используется для day-based сравнения без ошибок из-за локальной таймзоны браузера.

### `parseEventAtDate(iso: string | null | undefined): Date | null`

Безопасно парсит `event_at`:

- валидная ISO-строка -> `Date`;
- пустое/невалидное значение -> `null`.

### `deriveSliderStatusFromEvent(ev, now): 'planned' | 'past'`

Определяет статус для карточек/слайдера:

1. Если `event_at` валиден:
   - `past`, если день события раньше дня `now` в `EVENTS_TIMEZONE`;
   - иначе `planned` (сегодня и будущее).
2. Если `event_at` отсутствует/невалиден:
   - fallback к статусу из CMS: `statusCode ?? statusPlan ?? status ?? 'past'`.

### `isPastEventPage(ev, now): boolean`

Удобный boolean-обертка над `deriveSliderStatusFromEvent()` для страницы события.

### `sortPlannedByEventAt(items)`

Сортировка planned-элементов:

- по `sortAt` по возрастанию (ближайшие раньше);
- элементы без `sortAt` идут в конец;
- при равенстве — по `order` по возрастанию.

Ожидаемый shape элемента: `{ sortAt: number | null; order: number }`.

### `sortPastByEventAt(items)`

Сортировка past-элементов:

- по `sortAt` по убыванию (самые новые прошедшие раньше);
- элементы без `sortAt` идут в конец;
- при равенстве — по `order` по возрастанию.

Ожидаемый shape элемента: `{ sortAt: number | null; order: number }`.

## Типовой сценарий использования

```ts
import {
  parseEventAtDate,
  deriveSliderStatusFromEvent,
  sortPlannedByEventAt,
  sortPastByEventAt,
} from '../lib/eventAt';

const now = new Date();

const normalized = events.map((ev, order) => {
  const at = parseEventAtDate(ev.event_at);
  return {
    ...ev,
    order,
    sortAt: at ? at.getTime() : null,
    statusCode: deriveSliderStatusFromEvent(ev, now),
  };
});

const planned = sortPlannedByEventAt(normalized.filter((e) => e.statusCode === 'planned'));
const past = sortPastByEventAt(normalized.filter((e) => e.statusCode === 'past'));
```

## Практические рекомендации

- Передавайте в функции единый `now` на весь расчет (чтобы избежать рассинхрона внутри одного рендера).
- Для day-based логики всегда опирайтесь на функции из модуля, не сравнивайте даты вручную в разных местах.
- Приоритет статуса должен оставаться у `event_at`; CMS-поля статуса — только fallback.
