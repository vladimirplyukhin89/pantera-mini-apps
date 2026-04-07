import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './EventMediaGallery.module.css';

export interface MediaItem {
  type?: 'image' | 'video';
  src: string;
  alt: string;
  poster?: string;
}

interface EventMediaGalleryProps {
  media: MediaItem[];
}

function PlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.playOverlay} onClick={onClick} aria-label="Воспроизвести видео">
      <svg className={styles.playIcon} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <path d="M26 20v24l20-12z" fill="currentColor" />
      </svg>
    </button>
  );
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Закрыть">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <video className={styles.modalVideo} src={src} controls autoPlay playsInline />
      </div>
    </div>
  );
}

export default function EventMediaGallery({ media }: EventMediaGalleryProps) {
  const [emblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const closeModal = useCallback(() => setVideoSrc(null), []);

  return (
    <>
      <div className={styles.embla}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
            {media.map((m, i) => (
              <div className={styles.slide} key={`${m.src}-${i}`}>
                <div className={styles.slideInner}>
                  {m.type === 'video' ? (
                    <>
                      {m.poster ? (
                        <img
                          src={m.poster}
                          alt={m.alt}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          draggable={false}
                        />
                      ) : (
                        <div className={styles.videoFallback}>
                          <video
                            src={`${m.src}#t=0.1`}
                            className={styles.videoPoster}
                            muted
                            playsInline
                            preload="metadata"
                            draggable={false}
                          />
                        </div>
                      )}
                      <PlayButton onClick={() => setVideoSrc(m.src)} />
                    </>
                  ) : (
                    <img
                      src={m.src}
                      alt={m.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {videoSrc && <VideoModal src={videoSrc} onClose={closeModal} />}
    </>
  );
}
