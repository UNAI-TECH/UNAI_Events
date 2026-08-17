import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Mail, MapPin, Phone, ArrowRight, Instagram, Twitter, Facebook, Youtube, Check } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        {/* Top Grid */}
        <div className={styles.grid}>
          {/* Column 1: Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.footerLogo}>
              <img
                src="/logo-icon.png"
                alt="UNAI Events & Theatre"
                className={styles.footerLogoImg}
              />
              <span className={styles.footerBrandSub}>EVENTS & THEATRE</span>
            </div>
            <p className={styles.brandBio}>
              Curating world-class theatrical spectacles, concerts, comedy tours, and luxury cultural gatherings. Discover premier live entertainment with easy BookMyShow ticketing.
            </p>

            <div className={styles.socialLinks}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className={styles.socialBtn}>
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className={styles.socialBtn}>
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className={styles.socialBtn}>
                <Facebook size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className={styles.socialBtn}>
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colHeading}>Explore</h4>
            <ul className={styles.linkList}>
              <li><Link to="/">Home</Link></li>
              <li><a href="/#events-section">Upcoming Shows</a></li>
              <li><Link to="/about">About UNAI Events</Link></li>
              <li><Link to="/contact">Venue & Contact</Link></li>
              <li>
                <a href="https://in.bookmyshow.com" target="_blank" rel="noreferrer" className={styles.bmsHighlightLink}>
                  Book on BookMyShow ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Event Categories */}
          <div className={styles.linksCol}>
            <h4 className={styles.colHeading}>Performances</h4>
            <ul className={styles.linkList}>
              <li><a href="/#events-section">Theatrical Drama</a></li>
              <li><a href="/#events-section">Live Music Concerts</a></li>
              <li><a href="/#events-section">Standup Comedy Specials</a></li>
              <li><a href="/#events-section">Classical Symphonies</a></li>
              <li><a href="/#events-section">Private Auditoriums</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Ticketing Partner */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.colHeading}>Stay Informed</h4>
            <p className={styles.newsletterText}>
              Subscribe to early-bird seat releases, artist meet-and-greets, and exclusive season passes.
            </p>

            <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.emailInput}
                />
                <button type="submit" className={styles.submitBtn} aria-label="Subscribe">
                  {subscribed ? <Check size={18} /> : <ArrowRight size={18} />}
                </button>
              </div>
              {subscribed && (
                <span className={styles.successNotice}>
                  ✓ Subscribed! You will receive our next show announcement.
                </span>
              )}
            </form>

            <div className={styles.partnerBadge}>
              <Ticket size={16} className={styles.partnerIcon} />
              <div>
                <span className={styles.partnerLabel}>Official Ticketing Partner</span>
                <p className={styles.partnerName}>BookMyShow India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} UNAI Events. All rights reserved. Designed for luxury theater and premier live stages.
          </p>
          <div className={styles.legalLinks}>
            <a href="/contact">Terms & Conditions</a>
            <span>•</span>
            <a href="/contact">Privacy Policy</a>
            <span>•</span>
            <a href="/contact">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
