import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PhotoGrid.module.css';

interface PhotoItem {
  src: string;
  alt: string;
  variant?: 'tall' | 'wide';
}

interface PhotoGridProps {
  photos: PhotoItem[];
  perPage?: number;
}

const PhotoGrid = ({ photos, perPage = 8 }: PhotoGridProps) => {
  const [visibleCount, setVisibleCount] = useState(perPage);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const allLoaded = visibleCount >= photos.length;

  const loadMore = useCallback(() => {
    if (allLoaded) return;
    setVisibleCount((prev) => Math.min(prev + perPage, photos.length));
  }, [allLoaded, perPage, photos.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || allLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allLoaded, loadMore]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [lightboxIndex, photos.length]);

  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <>
      <div className={styles.grid}>
        {visiblePhotos.map((photo, i) => (
          <div
            key={photo.src}
            className={`${styles.item} ${photo.variant === 'tall' ? styles.tall : ''} ${photo.variant === 'wide' ? styles.wide : ''}`}
            style={{ animationDelay: `${(i % perPage) * 0.05}s` }}
            onClick={() => setLightboxIndex(i)}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </div>
        ))}

        {!allLoaded && (
          <>
            <div ref={sentinelRef} className={styles.sentinel} />
            <div className={styles.loader}>
              <div className={styles.spinner} />
            </div>
          </>
        )}
      </div>

      {allLoaded && visibleCount > perPage && (
        <p className={styles.endMessage}>Все фотографии загружены</p>
      )}

      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Закрыть"
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
          )}

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={photos[lightboxIndex].src} alt={photos[lightboxIndex].alt} />
          </div>

          {lightboxIndex < photos.length - 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              aria-label="Следующее фото"
            >
              ›
            </button>
          )}

          <div className={styles.lightboxCounter}>
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGrid;
