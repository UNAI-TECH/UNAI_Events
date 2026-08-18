import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero({ events = [], onSelectEvent }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' | 'prev'

  // Touch / Swipe Handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const heroEvents = events && events.length > 0 ? events : [];
  const total = heroEvents.length;

  const getLoopIndex = useCallback(
    (index) => {
      if (total === 0) return 0;
      return ((index % total) + total) % total;
    },
    [total]
  );

  const handleNext = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setDirection('next');
    setCurrentIndex((prev) => getLoopIndex(prev + 1));
    setTimeout(() => setIsAnimating(false), 400);
  }, [total, isAnimating, getLoopIndex]);

  const handlePrev = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setDirection('prev');
    setCurrentIndex((prev) => getLoopIndex(prev - 1));
    setTimeout(() => setIsAnimating(false), 400);
  }, [total, isAnimating, getLoopIndex]);

  const goToIndex = (targetIdx) => {
    if (targetIdx === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setDirection(targetIdx > currentIndex ? 'next' : 'prev');
    setCurrentIndex(targetIdx);
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Autoplay Timer (5.5s)
  useEffect(() => {
    if (!isAutoPlay || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoPlay, total, handleNext]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) return null;

  const current = heroEvents[currentIndex] || heroEvents[0];

  // Helper to format tags: "UA16+ | Drama, Family +1 more"
  const formatTagline = (item) => {
    const age = item.age_limit
      ? item.age_limit.startsWith('UA')
        ? item.age_limit
        : item.age_limit.includes('+')
        ? `UA${item.age_limit}`
        : item.age_limit
      : 'UA16+';

    const categoryPart = item.category || 'Special';
    const subPart = item.genre || item.language || (item.city ? item.city : null);
    
    if (subPart) {
      return `${age} | ${categoryPart}, ${subPart} +1 more`;
    }
    return `${age} | ${categoryPart} +1 more`;
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    if (current.bookmyshow_url) {
      window.open(current.bookmyshow_url, '_blank', 'noopener,noreferrer');
    } else if (onSelectEvent) {
      onSelectEvent(current);
    }
  };

  return (
    <section
      className={styles.heroSection}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Spotlight Events"
    >
      {/* Blurred Dynamic Atmospheric Background */}
      <div className={styles.backdropContainer}>
        <img
          key={current.id || currentIndex}
          src={current.image_url || current.thumbnail_url}
          alt=""
          aria-hidden="true"
          className={styles.backdropImage}
        />
        <div className={styles.backdropOverlay} />
      </div>

      {/* Main Hero Stage */}
      <div className={styles.heroStage}>
        {/* Left Arrow */}
        {total > 1 && (
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>
        )}

        {/* Center Content: Left Info + Right Poster */}
        <div
          key={current.id || currentIndex}
          className={`${styles.contentGrid} ${
            direction === 'next' ? styles.slideInRight : styles.slideInLeft
          }`}
        >
          {/* Left Column: Title, Metadata, Description, CTA */}
          <div className={styles.infoCol}>
            <h1 className={styles.eventTitle}>{current.title}</h1>
            
            <p className={styles.tagline}>
              {formatTagline(current)}
            </p>

            <p className={styles.description}>
              {current.description ||
                'Experience world-class live performance, captivating stagecraft, and an unforgettable evening.'}
            </p>

            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.bookNowBtn}
                onClick={handleBookNow}
                title={`Book tickets for ${current.title}`}
              >
                Book now
              </button>
            </div>
          </div>

          {/* Right Column: Vertical Poster Card */}
          <div className={styles.posterCol}>
            <div
              className={styles.posterCard}
              onClick={() => onSelectEvent && onSelectEvent(current)}
              role="button"
              tabIndex={0}
              title={`View details for ${current.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectEvent && onSelectEvent(current);
                }
              }}
            >
              <img
                src={current.image_url || current.thumbnail_url}
                alt={current.title}
                className={styles.posterImg}
              />
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        {total > 1 && (
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={handleNext}
            aria-label="Next slide"
          >
            <ChevronRight size={28} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Pagination Dots (Elongated active bar + circular dots) */}
      {total > 1 && (
        <div className={styles.paginationTrack} role="tablist" aria-label="Slide indicators">
          {heroEvents.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to slide ${idx + 1} (${item.title})`}
              className={`${styles.pageDot} ${idx === currentIndex ? styles.activeDot : ''}`}
              onClick={() => goToIndex(idx)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
