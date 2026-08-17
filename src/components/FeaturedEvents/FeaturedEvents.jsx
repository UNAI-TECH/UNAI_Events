import React, { useState } from 'react';
import { Search, Filter, Sparkles, CalendarDays } from 'lucide-react';
import EventCard from '../EventCard/EventCard';
import styles from './FeaturedEvents.module.css';

export default function FeaturedEvents({
  events,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectEvent,
}) {
  const [visibleCount, setVisibleCount] = useState(4);

  const displayedEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  return (
    <section id="events-section" className={styles.section}>
      <div className="container">
        {/* Section Header (Matching Reference Design) */}
        <div className={styles.header}>
          <div className={styles.titleBadge}>
            <Sparkles size={14} className={styles.badgeIcon} />
            <span>Curated Performances</span>
          </div>
          <h2 className={styles.heading}>Featured Upcoming Events</h2>
          <p className={styles.subheading}>
            Keep coming back to our website to stay informed about the activities in our theater and reserve your preferred seats in advance.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className={styles.toolbar}>
          {/* Category Tabs */}
          <div className={styles.categoryPills}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${
                  selectedCategory === cat ? styles.activeCategoryTab : ''
                }`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat === 'All' ? 'All Events' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by artist, venue or title..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => onSearchChange('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Events Cards List */}
        {displayedEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelectEvent={onSelectEvent}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <CalendarDays size={48} className={styles.emptyIcon} />
            <h3>No events found</h3>
            <p>Try selecting a different category or clearing your search term.</p>
            <button
              className="btn-outline"
              onClick={() => {
                onSelectCategory('All');
                onSearchChange('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View All / Load More Button (Matching Reference Design) */}
        {hasMore && (
          <div className={styles.loadMoreWrapper}>
            <button
              className={styles.viewAllBtn}
              onClick={() => setVisibleCount(events.length)}
            >
              <span>View All Events ({events.length})</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
