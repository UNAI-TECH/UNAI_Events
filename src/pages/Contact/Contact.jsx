import React from 'react';
import ContactForm from '../../components/ContactForm/ContactForm';
import { MapPin, Phone, Mail, Clock, Ticket, MessageSquare, ShieldCheck } from 'lucide-react';
import styles from './Contact.module.css';

export default function Contact() {
  const contactInfo = [
    {
      icon: <MapPin size={22} />,
      title: 'Headquarters & Box Office',
      details: ['UNAI Arts Complex, 42 Heritage Promenade', 'City Center, Mumbai, MH 400001'],
    },
    {
      icon: <Phone size={22} />,
      title: 'Concierge & VIP Bookings',
      details: ['+91 (022) 4890 1200', '+91 98765 43210 (Mon–Sun 9am–9pm)'],
    },
    {
      icon: <Mail size={22} />,
      title: 'Inquiries & Press',
      details: ['concierge@unaievents.com', 'press@unaievents.com'],
    },
    {
      icon: <Clock size={22} />,
      title: 'Box Office Timings',
      details: ['Tuesday – Sunday: 10:00 AM – 8:00 PM', 'Show Days: Open until intermission'],
    },
  ];

  return (
    <div className={styles.contactPage}>
      {/* Hero Header */}
      <section className={styles.contactHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Connect With Us</span>
            <h1 className={styles.heroTitle}>Contact UNAI Events</h1>
            <p className={styles.heroSub}>
              Have questions regarding show tickets, private auditorium hire, corporate bookings, or artist performances? Our team is here to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Split Grid */}
      <section className={styles.contentSection}>
        <div className={`container ${styles.gridContainer}`}>
          {/* Left Column: Form */}
          <div className={styles.formCol}>
            <ContactForm />
          </div>

          {/* Right Column: Info Cards & BMS Help */}
          <div className={styles.infoCol}>
            <div className={styles.infoCardsList}>
              {contactInfo.map((info, idx) => (
                <div key={idx} className={styles.infoCard}>
                  <div className={styles.iconCircle}>{info.icon}</div>
                  <div className={styles.infoDetails}>
                    <h4 className={styles.infoTitle}>{info.title}</h4>
                    {info.details.map((line, i) => (
                      <p key={i} className={styles.infoLine}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* BookMyShow Help Card */}
            <div className={styles.bmsCard}>
              <div className={styles.bmsCardHeader}>
                <Ticket size={24} className={styles.bmsCardIcon} />
                <div>
                  <h4 className={styles.bmsCardTitle}>Ticket Booking & Refunds</h4>
                  <p className={styles.bmsCardSub}>Managed by BookMyShow</p>
                </div>
              </div>
              <p className={styles.bmsCardText}>
                For immediate assistance regarding ticket cancellations, seat reassignments, or M-ticket confirmation SMS, please visit the BookMyShow support center.
              </p>
              <a
                href="https://in.bookmyshow.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.bmsHelpBtn}
              >
                <span>Visit BookMyShow Support</span>
                <span className={styles.arrow}>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
