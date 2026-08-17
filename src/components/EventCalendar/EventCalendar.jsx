import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Ticket } from 'lucide-react';
import styles from './EventCalendar.module.css';

export default function EventCalendar({ events, onSelectEvent }) {
  // Calendar days around the event dates
  const calendarDays = [
    { dayName: 'THU', dayNum: '27', month: 'AUG', dateStr: '2026-08-27', hasEvent: true },
    { dayName: 'FRI', dayNum: '28', month: 'AUG', dateStr: '2026-08-28', hasEvent: true },
    { dayName: 'SAT', dayNum: '29', month: 'AUG', dateStr: '2026-08-29', hasEvent: true },
    { dayName: 'SUN', dayNum: '30', month: 'AUG', dateStr: '2026-08-30', hasEvent: true },
    { dayName: 'MON', dayNum: '31', month: 'AUG', dateStr: '2026-08-31', hasEvent: false },
    { dayName: 'TUE', dayNum: '01', month: 'SEP', dateStr: '2026-09-01', hasEvent: true },
    { dayName: 'WED', dayNum: '02', month: 'SEP', dateStr: '2026-09-02', hasEvent: false },
    { dayName: 'THU', dayNum: '03', month: 'SEP', dateStr: '2026-09-03', hasEvent: false },
    { dayName: 'FRI', dayNum: '04', month: 'SEP', dateStr: '2026-09-04', hasEvent: false },
    { dayName: 'SAT', dayNum: '05', month: 'SEP', dateStr: '2026-09-05', hasEvent: true },
  ];

  const [selectedDate, setSelectedDate] = useState('2026-08-27');

  const selectedDayEvents = events.filter((e) => e.date === selectedDate);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading}>Event Calendar</h2>
          <p className={styles.subheading}>
            View a complete calendar of all the theater and concert events for the entire season. Reserve your preferred dates and seats on BookMyShow.
          </p>
        </div>

        {/* Date Selector Strip */}
        <div className={styles.calendarStripWrapper}>
          <div className={styles.calendarStrip}>
            {calendarDays.map((item, idx) => (
              <button
                key={idx}
                className={`${styles.dayBtn} ${
                  selectedDate === item.dateStr ? styles.selectedDay : ''
                } ${item.hasEvent ? styles.hasEventDay : ''}`}
                onClick={() => setSelectedDate(item.dateStr)}
              >
                <span className={styles.dayName}>{item.dayName}</span>
                <span className={styles.dayNum}>{item.dayNum}</span>
                <span className={styles.monthName}>{item.month}</span>
                {item.hasEvent && <span className={styles.eventIndicator}></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Date Event Cards */}
        <div className={styles.scheduleResults}>
          {selectedDayEvents.length > 0 ? (
            <div className={styles.dayEventsGrid}>
              {selectedDayEvents.map((event) => (
                <div key={event.id} className={styles.calendarCard}>
                  <div className={styles.cardImgWrapper}>
                    <img src={event.thumbnail_url || event.image_url} alt={event.title} />
                    <span className={`badge-category ${styles.cardBadge}`}>
                      {event.category}
                    </span>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardTimeRow}>
                      <span className={styles.cardTime}>
                        <Clock size={14} /> {event.time}
                      </span>
                      <span className={styles.cardPrice}>From {event.price_starting}</span>
                    </div>

                    <h4 className={styles.cardTitle}>{event.title}</h4>
                    <p className={styles.cardVenue}>
                      <MapPin size={14} /> {event.venue}, {event.city}
                    </p>

                    <div className={styles.cardBtnRow}>
                      <a
                        href={event.bookmyshow_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.bmsBtnSmall}
                      >
                        <Ticket size={14} />
                        <span>Book on BMS</span>
                      </a>
                      <button
                        className={styles.detailsBtnSmall}
                        onClick={() => onSelectEvent(event)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noShowNotice}>
              <Calendar size={32} className={styles.noticeIcon} />
              <h4>No public shows scheduled on this date</h4>
              <p>Special private auditorium bookings or rehearsals may be ongoing. Please choose another date or explore our full lineup.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
