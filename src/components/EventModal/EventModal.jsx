import React, { useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Ticket, ShieldCheck, Share2, ExternalLink, Sparkles } from 'lucide-react';
import styles from './EventModal.module.css';

export default function EventModal({ event, onClose }) {
  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!event) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event.title} | UNAI Events`,
        text: `Check out ${event.title} live at ${event.venue}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Hero Banner */}
        <div className={styles.modalHero}>
          <img src={event.image_url} alt={event.title} className={styles.heroImg} />
          <div className={styles.heroOverlay}>
            <span className={`badge-category ${styles.categoryPill}`}>
              {event.category}
            </span>
            <span className={styles.statusPill}>{event.status}</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className={styles.modalBody}>
          <div className={styles.headerInfo}>
            <h2 className={styles.eventTitle}>{event.title}</h2>
            <p className={styles.eventSubtitle}>{event.subtitle}</p>
          </div>

          {/* Key Event Highlights Row */}
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <Calendar size={18} className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Date</span>
                <p className={styles.metaVal}>{event.display_date?.month} {event.display_date?.day}, {event.display_date?.year}</p>
              </div>
            </div>

            <div className={styles.metaItem}>
              <Clock size={18} className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Time & Duration</span>
                <p className={styles.metaVal}>{event.time} ({event.duration})</p>
              </div>
            </div>

            <div className={styles.metaItem}>
              <MapPin size={18} className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Venue</span>
                <p className={styles.metaVal}>{event.venue}, {event.city}</p>
              </div>
            </div>

            <div className={styles.metaItem}>
              <ShieldCheck size={18} className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Age & Language</span>
                <p className={styles.metaVal}>{event.age_limit} • {event.language}</p>
              </div>
            </div>
          </div>

          {/* About Event Description */}
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionHeading}>About the Experience</h3>
            <p className={styles.descriptionText}>{event.description}</p>
          </div>

          {/* Highlights */}
          {event.highlights && event.highlights.length > 0 && (
            <div className={styles.highlightsSection}>
              <h3 className={styles.sectionHeading}>Show Highlights</h3>
              <div className={styles.highlightPills}>
                {event.highlights.map((h, i) => (
                  <span key={i} className={styles.highlightBadge}>
                    <Sparkles size={14} className={styles.sparkleIcon} />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Tiers */}
          {event.ticket_tiers && event.ticket_tiers.length > 0 && (
            <div className={styles.ticketSection}>
              <h3 className={styles.sectionHeading}>Seat Categories & Pricing</h3>
              <div className={styles.tierList}>
                {event.ticket_tiers.map((tier, idx) => (
                  <div key={idx} className={styles.tierItem}>
                    <div className={styles.tierDetails}>
                      <span className={styles.tierName}>{tier.name}</span>
                      <span className={styles.tierStatus}>{tier.status}</span>
                    </div>
                    <span className={styles.tierPrice}>{tier.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionRow}>
            <a
              href={event.bookmyshow_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bmsBookBtn}
            >
              <Ticket size={18} />
              <span>Book Tickets on BookMyShow</span>
              <ExternalLink size={16} />
            </a>

            <button className={styles.shareBtn} onClick={handleShare} title="Share Event">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>

          <p className={styles.bmsDisclaimer}>
            * Official ticketing is processed securely via BookMyShow. You will be redirected to the secure BookMyShow seat booking page.
          </p>
        </div>
      </div>
    </div>
  );
}
