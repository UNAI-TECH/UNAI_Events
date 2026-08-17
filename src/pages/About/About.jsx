import React from 'react';
import { Award, Compass, HeartHandshake, Mic2, Sparkles, Star, Users, Ticket, CheckCircle } from 'lucide-react';
import styles from './About.module.css';

export default function About() {
  const stats = [
    { number: '50+', label: 'Curated Productions' },
    { number: '120,000+', label: 'Delighted Audiences' },
    { number: '15+', label: 'Premier Auditorium Venues' },
    { number: '4.9 ★', label: 'Audience Satisfaction Rating' },
  ];

  const pillars = [
    {
      icon: <Award size={26} />,
      title: 'Artistic Excellence',
      desc: 'We partner with world-renowned playwrights, celebrated musicians, and top-tier stand-up comedians to deliver unforgettable stage memories.',
    },
    {
      icon: <Sparkles size={26} />,
      title: 'Luxury Stagecraft & Acoustics',
      desc: 'From vintage proscenium arch theaters to open-air coastal amphitheatres, each venue is handpicked for exceptional acoustic clarity and sightlines.',
    },
    {
      icon: <Ticket size={26} />,
      title: 'Seamless BookMyShow Ticketing',
      desc: 'Instant booking, contactless entry, reserved tiered seating, and real-time live updates powered by official BookMyShow integration.',
    },
    {
      icon: <HeartHandshake size={26} />,
      title: 'VIP Concierge & Hospitality',
      desc: 'Dedicated lounge check-in, priority valet, and tailored private box experiences for guests who demand unparalleled luxury.',
    },
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Hero Header */}
      <section className={styles.aboutHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Behind The Curtains</span>
            <h1 className={styles.heroTitle}>Crafting Unforgettable Live Entertainment</h1>
            <p className={styles.heroSub}>
              UNAI Events was established with a singular vision: to create an elevated platform for theater, music, and comedy that bridges the gap between artistic majesty and luxury guest experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          {stats.map((item, idx) => (
            <div key={idx} className={styles.statCard}>
              <span className={styles.statNumber}>{item.number}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section className={styles.storySection}>
        <div className={`container ${styles.storyContainer}`}>
          <div className={styles.storyImageCol}>
            <img
              src="https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80"
              alt="Theatrical stage with dramatic red curtains"
              className={styles.storyImgMain}
            />
            <div className={styles.storyFloatingBadge}>
              <Star size={18} className={styles.badgeStar} />
              <div>
                <strong>Curated Since 2021</strong>
                <p>Leading Luxury Live Events</p>
              </div>
            </div>
          </div>

          <div className={styles.storyTextCol}>
            <span className={styles.sectionPill}>Our Philosophy</span>
            <h2 className={styles.sectionHeading}>Where Every Performance is a Masterpiece</h2>
            <p className={styles.paragraph}>
              At UNAI Events, we believe that live performance is more than just entertainment — it is an emotional journey that connects audiences through the shared power of storytelling, musical harmony, and infectious laughter.
            </p>
            <p className={styles.paragraph}>
              From Shakespearean tragedies staged in historic grand auditoriums to high-energy international comedy world tours and intimate acoustic candlelight sessions, our curation criteria emphasizes emotional depth, artistic virtuosity, and seamless production standards.
            </p>

            <ul className={styles.checkList}>
              <li>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>Verified genuine ticket inventory on BookMyShow</span>
              </li>
              <li>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>State-of-the-art multi-channel sound systems & intelligent lighting</span>
              </li>
              <li>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>Dedicated accessibility support for all patrons</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Pillars Grid */}
      <section className={styles.pillarsSection}>
        <div className="container">
          <div className={styles.pillarsHeader}>
            <span className={styles.sectionPill}>Why UNAI Events</span>
            <h2 className={styles.sectionHeading}>The Four Pillars of Our Stage</h2>
            <p className={styles.pillarsSub}>
              How we consistently deliver world-class cultural experiences across the country.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((pillar, i) => (
              <div key={i} className={styles.pillarCard}>
                <div className={styles.pillarIconWrapper}>{pillar.icon}</div>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDesc}>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className={styles.aboutCta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaHeading}>Ready to Experience the Magic?</h2>
            <p className={styles.ctaText}>
              Browse our current season’s schedule and secure your seats today through BookMyShow.
            </p>
            <div className={styles.ctaActions}>
              <a href="/#events-section" className="btn-primary">
                <Ticket size={16} />
                <span>View Ongoing Shows</span>
              </a>
              <a href="/contact" className="btn-outline">
                Contact Concierge
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
