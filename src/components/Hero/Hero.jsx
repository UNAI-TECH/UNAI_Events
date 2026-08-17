import React from 'react';
import EventCarousel from '../EventCarousel/EventCarousel';
import styles from './Hero.module.css';

export default function Hero({ events, onSelectEvent }) {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackdrop}></div>
      <div className={styles.heroGlow}></div>

      <div className={`container ${styles.heroContainer}`}>
        <EventCarousel events={events} onSelectEvent={onSelectEvent} />
      </div>
    </section>
  );
}
