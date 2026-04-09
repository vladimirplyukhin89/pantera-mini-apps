import useEmblaCarousel from 'embla-carousel-react';
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
  videoCover?: string;
  accentIndex: number;
}

interface EventsSliderProps {
  planned: EventItem[];
  past: EventItem[];
}

function getCardThumbnail(event: EventItem): { src: string; alt: string } | null {
  if (event.videoCover) {
    return { src: event.videoCover, alt: event.title };
  }
  const firstImage = event.media.find((m) => m.type === 'image');
  if (firstImage) {
    return { src: firstImage.src, alt: firstImage.alt ?? '' };
  }
  if (event.media.length > 0 && event.media[0].type === 'video') {
    return null;
  }
  return event.media.length > 0 ? { src: event.media[0].src, alt: event.media[0].alt ?? '' } : null;
}

const hasVideo = (event: EventItem) => event.media.some((m) => m.type === 'video');

const EventCard = ({ event }: { event: EventItem }) => {
  const thumb = getCardThumbnail(event);

  return (
    <div className={styles.emblaSlide}>
      <a
        href={`/events/${event.id}`}
        className={`${styles.card} ${styles[`cardAccent${event.accentIndex % 4}`]} ${event.statusCode === 'past' ? styles.cardPast : ''}`}
        data-astro-prefetch="viewport"
      >
        <div className={styles.cardMedia}>
          {thumb ? (
            <div
              className={`${styles.cardThumb} ${event.statusCode === 'planned' ? styles.plannedImg : ''} ${event.statusCode === 'past' ? styles.pastThumb : ''}`}
            >
              <img
                src={thumb.src}
                alt={thumb.alt}
                loading="lazy"
                decoding="async"
                className={event.statusCode === 'planned' ? styles.plannedImg : ''}
              />
              {hasVideo(event) && (
                <div className={styles.videoIndicator} aria-label="Содержит видео">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
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
};

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

const EventsSlider = ({ planned, past }: EventsSliderProps) => (
  <div className={`${styles.section}  u-bg-glow`}>
    {past.length > 0 && (
      <>
        <div className={`${styles.sectionHeader}`}>
          <h2 className={styles.sectionTitle}>Прошедшие</h2>
          <span className={`${styles.sectionTag} ${styles.tagPast}`}>архив</span>
        </div>
        <EventCarousel events={past} />
        {past.length > 2 && <div className={styles.cardHint}>← листай →</div>}
      </>
    )}

    {planned.length > 0 && (
      <>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Что впереди</h2>
          <span className={styles.sectionTag}>планы</span>
        </div>
        <EventCarousel events={planned} />
        {planned.length > 2 && <div className={styles.cardHint}>← листай →</div>}
      </>
    )}
  </div>
);

export default EventsSlider;
