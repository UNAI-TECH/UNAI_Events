import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Ticket } from 'lucide-react';
import styles from './EventCarousel.module.css';

export default function EventCarousel({ events = [], onSelectEvent }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'prev'
  const [isAnimating, setIsAnimating] = useState(false);

  // Swipe / Drag handling
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isDragging = useRef(false);

  // Filter valid events
  const carouselEvents = events && events.length > 0 ? events : [];
  const total = carouselEvents.length;

  // Circular indices
  const getLoopIndex = useCallback(
    (index) => {
      if (total === 0) return 0;
      return (index % total + total) % total;
    },
    [total]
  );

  const prevIndex = getLoopIndex(currentIndex - 1);
  const nextIndex = getLoopIndex(currentIndex + 1);

  // Handle Next with Loop & Animation
  const handleNext = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('next');
    setCurrentIndex((prev) => getLoopIndex(prev + 1));
    setTimeout(() => setIsAnimating(false), 450);
  }, [total, isAnimating, getLoopIndex]);

  // Handle Prev with Loop & Animation
  const handlePrev = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('prev');
    setCurrentIndex((prev) => getLoopIndex(prev - 1));
    setTimeout(() => setIsAnimating(false), 450);
  }, [total, isAnimating, getLoopIndex]);

  // Direct Dot GoTo
  const goToIndex = (targetIdx) => {
    if (targetIdx === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setSlideDirection(targetIdx > currentIndex ? 'next' : 'prev');
    setCurrentIndex(targetIdx);
    setTimeout(() => setIsAnimating(false), 450);
  };

  // Continuous Autoplay Looping
  useEffect(() => {
    if (!isAutoPlay || total <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoPlay, total, handleNext]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext(); // Swiped left -> Next
    } else if (distance < -50) {
      handlePrev(); // Swiped right -> Prev
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse Drag handlers for desktop
  const handleMouseDown = (e) => {
    isDragging.current = true;
    touchStartX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 60) {
      handleNext();
    } else if (distance < -60) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) return null;

  const current = carouselEvents[currentIndex] || carouselEvents[0];
  const prevEvent = carouselEvents[prevIndex];
  const nextEvent = carouselEvents[nextIndex];

  return (
    <div
      className={styles.carouselWrapper}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => {
        setIsAutoPlay(true);
        isDragging.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Premier Season Header */}
      <div className={styles.scheduleBadge}>
        <span className={styles.dot}>•</span>
        <span>The UNAI Premier Season</span>
        <span className={styles.dot}>•</span>
      </div>
      <h2 className={styles.seasonDates}>August 27th — September 15th</h2>

      {/* Main 3D Looping Stage */}
      <div className={styles.stage}>
        {/* Previous Preview Card (Looping) */}
        {total > 1 && (
          <div
            className={`${styles.sideCard} ${styles.sideCardLeft}`}
            onClick={handlePrev}
            role="button"
            tabIndex={0}
            title={`Previous: ${prevEvent?.title}`}
          >
            <img
              src={prevEvent?.thumbnail_url || prevEvent?.image_url}
              alt={prevEvent?.title}
              className={styles.sideCardImg}
            />
            <div className={styles.sideCardOverlay}>
              <span className={styles.sideCardCategory}>
                {prevEvent?.category}
              </span>
              <span className={styles.sideCardTitle}>
                {prevEvent?.title}
              </span>
            </div>
          </div>
        )}

        {/* Prev Arrow Button */}
        {total > 1 && (
          <button
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous event"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Active Center Ticket Card with Smooth Looping Animation */}
        <div
          key={current.id || currentIndex}
          className={`${styles.activeTicketCard} ${
            slideDirection === 'next' ? styles.slideFromRight : styles.slideFromLeft
          }`}
        >
          {/* Ticket Left: Information Section */}
          <div className={styles.ticketInfo}>
            <div className={styles.ticketCategory}>
              <span className={`badge-category badge-${current.category?.toLowerCase()}`}>
                {current.category}
              </span>
              <span className={styles.ticketCity}>{current.city}</span>
            </div>

            <h3 className={styles.ticketTitle}>{current.title}</h3>
            <p className={styles.ticketSubtitle}>{current.subtitle}</p>

            <div className={styles.ticketMeta}>
              <span className={styles.metaItem}>
                <Calendar size={15} />
                {current.display_date?.month || 'AUG'} {current.display_date?.day || '28'}
              </span>
              <span className={styles.metaItem}>
                <Clock size={15} />
                {current.time || '8:00 PM'}
              </span>
            </div>

            <div className={styles.ticketActions}>
              <a
                href={current.bookmyshow_url || 'https://in.bookmyshow.com'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ticketBookBtn}
                onClick={(e) => e.stopPropagation()}
              >
                <Ticket size={16} />
                <span>Get Tickets</span>
              </a>

              <button
                className={styles.ticketDetailsLink}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(current);
                }}
              >
                View Details
              </button>
            </div>
          </div>

          {/* Ticket Perforation / Notch Divider */}
          <div className={styles.ticketPerforation}>
            <div className={styles.notchTop}></div>
            <div className={styles.perforatedLine}></div>
            <div className={styles.notchBottom}></div>
          </div>

          {/* Ticket Right: Image Section */}
          <div className={styles.ticketImageWrapper}>
            <img
              src={current.image_url}
              alt={current.title}
              className={styles.ticketImg}
            />
            <div className={styles.imageOverlayBadge}>
              <span>From {current.price_starting}</span>
            </div>
          </div>
        </div>

        {/* Next Arrow Button */}
        {total > 1 && (
          <button
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next event"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Next Preview Card (Looping) */}
        {total > 1 && (
          <div
            className={`${styles.sideCard} ${styles.sideCardRight}`}
            onClick={handleNext}
            role="button"
            tabIndex={0}
            title={`Next: ${nextEvent?.title}`}
          >
            <img
              src={nextEvent?.thumbnail_url || nextEvent?.image_url}
              alt={nextEvent?.title}
              className={styles.sideCardImg}
            />
            <div className={styles.sideCardOverlay}>
              <span className={styles.sideCardCategory}>
                {nextEvent?.category}
              </span>
              <span className={styles.sideCardTitle}>
                {nextEvent?.title}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Indicators with Looping Dot Controls */}
      <div className={styles.paginationRow}>
        <button className={styles.mobileNavBtn} onClick={handlePrev}>
          <ChevronLeft size={16} /> Prev
        </button>

        <div className={styles.dots}>
          {carouselEvents.map((evt, idx) => (
            <button
              key={evt.id || idx}
              className={`${styles.dotIndicator} ${
                idx === currentIndex ? styles.activeDot : ''
              }`}
              onClick={() => goToIndex(idx)}
              aria-label={`Go to slide ${idx + 1} (${evt.title})`}
              title={evt.title}
            />
          ))}
        </div>

        <button className={styles.mobileNavBtn} onClick={handleNext}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
