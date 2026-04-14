/**
 * События: календарный день в таймзоне клуба (Тюмень / Екатеринбург).
 * «Прошедшее» = дата события в этой зоне раньше сегодняшнего календарного дня;
 * «Запланировано» = сегодня или позже (см. docs/events-date-sort-and-scheduled-deploy.md §3.2).
 */

export const EVENTS_TIMEZONE = 'Asia/Yekaterinburg';

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: EVENTS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Ключ вида YYYY-MM-DD в {@link EVENTS_TIMEZONE} для мгновения d */
export function eventCalendarDayKey(d: Date): string {
  return dayKeyFormatter.format(d);
}

export function parseEventAtDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** planned / past по `event_at`; если даты нет — берём поля статуса из CMS */
export function deriveSliderStatusFromEvent(
  ev: {
    event_at?: string | null;
    statusCode?: 'planned' | 'past';
    statusPlan?: 'planned' | 'past';
    status?: 'planned' | 'past';
  },
  now: Date
): 'planned' | 'past' {
  const at = parseEventAtDate(ev.event_at);
  if (at) {
    return eventCalendarDayKey(at) < eventCalendarDayKey(now) ? 'past' : 'planned';
  }
  return (ev.statusCode ?? ev.statusPlan ?? ev.status ?? 'past') as 'planned' | 'past';
}

/** Для страницы события: прошедшее по дате или fallback на статус в CMS */
export function isPastEventPage(
  ev: {
    event_at?: string | null;
    statusCode?: 'planned' | 'past';
    statusPlan?: 'planned' | 'past';
    status?: 'planned' | 'past';
  },
  now: Date
): boolean {
  return deriveSliderStatusFromEvent(ev, now) === 'past';
}

type WithSort = { sortAt: number | null; order: number };

export function sortPlannedByEventAt<T extends WithSort>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.sortAt != null && b.sortAt != null) return a.sortAt - b.sortAt;
    if (a.sortAt != null) return -1;
    if (b.sortAt != null) return 1;
    return a.order - b.order;
  });
}

export function sortPastByEventAt<T extends WithSort>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.sortAt != null && b.sortAt != null) return b.sortAt - a.sortAt;
    if (a.sortAt != null) return -1;
    if (b.sortAt != null) return 1;
    return a.order - b.order;
  });
}
