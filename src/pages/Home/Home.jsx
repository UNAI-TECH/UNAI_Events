import React, { useState } from 'react';
import Hero from '../../components/Hero/Hero';
import FeaturedEvents from '../../components/FeaturedEvents/FeaturedEvents';
import EventCalendar from '../../components/EventCalendar/EventCalendar';
import EventModal from '../../components/EventModal/EventModal';
import { useEvents } from '../../hooks/useEvents';
import { ShieldCheck, Award, Ticket, Sparkles, Star } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  const {
    events,
    filteredEvents,
    heroSpotlightEvents,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useEvents();

  const [activeModalEvent, setActiveModalEvent] = useState(null);

  return (
    <div className={styles.homePage}>
      {/* 1. Hero Stage with Interactive Carousel */}
      <Hero
        events={heroSpotlightEvents}
        onSelectEvent={(evt) => setActiveModalEvent(evt)}
      />

      {/* 2. Trust Badges & Booking Guarantee Bar */}
      <section className={styles.trustBar}>
        <div className={`container ${styles.trustContainer}`}>
          <div className={styles.trustItem}>
            <Award size={22} className={styles.trustIcon} />
            <div>
              <span className={styles.trustTitle}>Curated Luxury Stages</span>
              <p className={styles.trustSub}>Handpicked international & regional artists</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <Ticket size={22} className={styles.trustIcon} />
            <div>
              <span className={styles.trustTitle}>Official BookMyShow Partner</span>
              <p className={styles.trustSub}>Guaranteed 100% genuine tickets</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <ShieldCheck size={22} className={styles.trustIcon} />
            <div>
              <span className={styles.trustTitle}>World-Class Acoustics</span>
              <p className={styles.trustSub}>Premier auditoriums & VIP lounges</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Upcoming Events List (From Reference Image) */}
      <FeaturedEvents
        events={filteredEvents}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectEvent={(evt) => setActiveModalEvent(evt)}
      />

      {/* 4. Interactive Event Calendar Schedule (From Reference Image) */}
      <EventCalendar
        events={events}
        onSelectEvent={(evt) => setActiveModalEvent(evt)}
      />

      {/* 5. Experience Callout Section */}
      <section className={styles.calloutSection}>
        <div className={`container ${styles.calloutContainer}`}>
          <div className={styles.calloutCard}>
            <div className={styles.calloutContent}>
              <div className={styles.calloutTag}>
                <Sparkles size={14} /> VIP Concierge & Private Box
              </div>
              <h2 className={styles.calloutTitle}>
                Experience Live Shows with Unmatched Luxury
              </h2>
              <p className={styles.calloutText}>
                Elevate your evening with priority seating, dedicated lounge access, gourmet dining, and private artist backstage meet-and-greets curated by UNAI Events.
              </p>
              <div className={styles.calloutBtnRow}>
                <a
                  href="https://in.bookmyshow.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Ticket size={16} />
                  <span>Explore on BookMyShow</span>
                </a>
                <a href="/contact" className="btn-outline">
                  Inquire for Private Box
                </a>
              </div>
            </div>

            <div className={styles.calloutImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
                alt="Luxury auditorium audience"
                className={styles.calloutImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {activeModalEvent && (
        <EventModal
          event={activeModalEvent}
          onClose={() => setActiveModalEvent(null)}
        />
      )}
    </div>
  );
}
