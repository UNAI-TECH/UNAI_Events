import React from 'react';
import { Ticket, Clock, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import styles from './EventCard.module.css';

export default function EventCard({ event, onSelectEvent }) {
  return (
    <div className={styles.eventCard}>
      {/* 1. Left Date Box (Exact layout from reference image) */}
      <div className={styles.dateColumn}>
        <div className={styles.dateBadge}>
          <span className={styles.dateMonth}>{event.display_date?.month}</span>
          <span className={styles.dateDay}>{event.display_date?.day}</span>
          <span className={styles.dateYear}>{event.display_date?.year}</span>
        </div>
        <div className={styles.timePill}>
          <Clock size={12} />
          <span>{event.display_date?.time || event.time}</span>
        </div>
      </div>

      {/* 2. Middle Event Details */}
      <div className={styles.detailsColumn}>
        <div className={styles.topMeta}>
          <span className={`badge-category badge-${event.category?.toLowerCase()}`}>
            {event.category}
          </span>
          <span className={styles.venueLocation}>
            <MapPin size={13} />
            {event.venue}, {event.city}
          </span>
        </div>

        <h3 className={styles.title} onClick={() => onSelectEvent(event)}>
          {event.title}
        </h3>
        <p className={styles.subtitle}>{event.subtitle}</p>

        <div className={styles.actionRow}>
          <a
            href={event.bookmyshow_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.getTicketsBtn}
          >
            <Ticket size={15} />
            <span>Get Tickets</span>
          </a>

          <button
            className={styles.viewDetailsLink}
            onClick={() => onSelectEvent(event)}
          >
            View Details
          </button>

          <span className={styles.startingPrice}>
            From <strong>{event.price_starting}</strong>
          </span>
        </div>
      </div>

      {/* 3. Right Perforated Ticket Image (Exact layout from reference image) */}
      <div className={styles.imageColumn}>
        {/* Ticket Perforation edge with scalloped notches */}
        <div className={styles.ticketEdge}>
          <div className={styles.scallop}></div>
          <div className={styles.scallop}></div>
          <div className={styles.scallop}></div>
          <div className={styles.scallop}></div>
          <div className={styles.scallop}></div>
        </div>

        <img
          src={event.thumbnail_url || event.image_url}
          alt={event.title}
          className={styles.eventImg}
          loading="lazy"
        />

        <div className={styles.imageHoverOverlay} onClick={() => onSelectEvent(event)}>
          <span>Quick View</span>
        </div>
      </div>
    </div>
  );
}
