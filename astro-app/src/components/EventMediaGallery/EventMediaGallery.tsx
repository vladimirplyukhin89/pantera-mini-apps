import useEmblaCarousel from 'embla-carousel-react';
import styles from './EventMediaGallery.module.css';

export interface MediaItem {
  src: string;
  alt: string;
}

interface EventMediaGalleryProps {
  media: MediaItem[];
}

export default function EventMediaGallery({ media }: EventMediaGalleryProps) {
  const [emblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  return (
    <div className={styles.embla}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {media.map((m, i) => (
            <div className={styles.slide} key={`${m.src}-${i}`}>
              <div className={styles.slideInner}>
                <img
                  src={m.src}
                  alt={m.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
