import styles from './PlansSlider.module.css';

interface EventMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

interface EventItem {
  id: string;
  emoji: string;
  title: string;
  teaser: string;
  date: string;
  status: 'planned' | 'past';
  media: EventMedia[];
  accentIndex: number;
}

export type BgVariant = 'glow' | 'diagonal' | 'mesh';

interface EventsSliderProps {
  planned: EventItem[];
  past: EventItem[];
  bgVariant?: BgVariant;
}

const bgClassMap: Record<BgVariant, string> = {
  glow: styles.bgGlow,
  diagonal: styles.bgDiagonal,
  mesh: styles.bgMesh,
};

const EventCard = ({ event }: { event: EventItem }) => (
  <a
    href={`/events/${event.id}`}
    className={`${styles.card} ${styles[`cardAccent${event.accentIndex % 4}`]}`}
  >
    {event.media.length > 0 && (
      <div className={styles.cardThumb}>
        <img src={event.media[0].src} alt="" loading="lazy" />
      </div>
    )}
    <div className={styles.cardEmoji}>{event.emoji}</div>
    <h3 className={styles.cardTitle}>{event.title}</h3>
    <p className={styles.cardTeaser}>{event.teaser}</p>
    <div className={styles.cardFooter}>
      <span className={styles.cardDate}>{event.date}</span>
      <span className={styles.cardArrow}>→</span>
    </div>
  </a>
);

const EventsSlider = ({ planned, past, bgVariant = 'mesh' }: EventsSliderProps) => (
  <div className={`${styles.section} ${bgClassMap[bgVariant]}`}>
    {planned.length > 0 && (
      <>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Что впереди</h2>
          <span className={styles.sectionTag}>планы</span>
        </div>
        <div className={styles.slider}>
          {planned.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </>
    )}

    {past.length > 0 && (
      <>
        <div className={`${styles.sectionHeader} ${planned.length > 0 ? styles.sectionHeaderSpaced : ''}`}>
          <h2 className={styles.sectionTitle}>Прошедшие</h2>
          <span className={`${styles.sectionTag} ${styles.tagPast}`}>архив</span>
        </div>
        <div className={styles.slider}>
          {past.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </>
    )}
  </div>
);

export default EventsSlider;
