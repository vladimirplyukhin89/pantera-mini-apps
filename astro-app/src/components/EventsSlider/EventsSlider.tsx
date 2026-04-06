import useEmblaCarousel from 'embla-carousel-react';
import type { EventsSliderBgStr } from '../../lib/strapi';
import '../../styles/section-backgrounds.css';
import styles from './EventsSlider.module.css';

interface EventMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  teaser: string;
  date: string;
  statusCode: 'planned' | 'past';
  media: EventMedia[];
  accentIndex: number;
}

export type BgVariant = EventsSliderBgStr;

interface EventsSliderProps {
  planned: EventItem[];
  past: EventItem[];
  bgVariant?: BgVariant;
}

const bgClassMap: Record<BgVariant, string> = {
  glow: 'u-bg-glow',
  diagonal: 'u-bg-diagonal',
  mesh: 'u-bg-mesh',
};

const EventCard = ({ event }: { event: EventItem }) => (
  <div className={styles.emblaSlide}>
    <a
      href={`/events/${event.id}`}
      className={`${styles.card} ${styles[`cardAccent${event.accentIndex % 4}`]}`}
      data-astro-prefetch="viewport"
    >
      <div className={styles.cardMedia}>
        {event.media.length > 0 ? (
          <div className={`${styles.cardThumb} ${event.statusCode === 'planned' ? styles.plannedImg : ''}`}>
            <img
              src={event.media[0].src}
              alt={event.media[0].alt ?? ''}
              loading="lazy"
              decoding="async"
              className={event.statusCode === 'planned' ? styles.plannedImg : ''}
            />
          </div>
        ) : (
          <div className={`${styles.cardThumb} ${styles.cardPlaceholder}`} aria-hidden />
        )}
      </div>
      <div className={styles.cardInfo}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        {event.teaser ? <p className={styles.cardTeaser}>{event.teaser}</p> : null}
        <span className={styles.cardDate}>{event.date}</span>
      </div>
    </a>
  </div>
);

function EventCarousel({ events }: { events: EventItem[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  return (
    <div className={styles.embla}>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

const EventsSlider = ({ planned, past, bgVariant = 'glow' }: EventsSliderProps) => (
  <div className={`${styles.section}  ${bgClassMap[bgVariant]}`}>
    {planned.length > 0 && (
      <>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Что впереди</h2>
          <span className={styles.sectionTag}>планы</span>
        </div>
        <EventCarousel events={planned} />
      </>
    )}

    {past.length > 0 && (
      <>
        <div
          className={`${styles.sectionHeader}`}
        >
          <h2 className={styles.sectionTitle}>Прошедшие</h2>
          <span className={`${styles.sectionTag} ${styles.tagPast}`}>архив</span>
        </div>
        <EventCarousel events={past} />
      </>
    )}
  </div>
);

export default EventsSlider;
