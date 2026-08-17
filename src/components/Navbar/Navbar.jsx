import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Ticket, Calendar, Phone, Info, Home as HomeIcon } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        {/* Brand Logo */}
        <Link to="/" className={styles.logo}>
          <img
            src="/logo-icon.png"
            alt="UNAI Events & Theatre"
            className={styles.brandLogoImg}
          />
          <span className={styles.brandSubtitle}>EVENTS & THEATRE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Home
          </NavLink>
          <a href="/#events-section" className={styles.navLink}>
            Upcoming Shows
          </a>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Header Action CTA */}
        <div className={styles.headerActions}>
          <a
            href="https://in.bookmyshow.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bmsHeaderBtn}
            title="Book shows on BookMyShow"
          >
            <Ticket size={16} />
            <span>Book on BookMyShow</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerLogo}>
                <img
                  src="/logo-icon.png"
                  alt="UNAI Events"
                  className={styles.drawerLogoImg}
                />
              </div>
              <button
                className={styles.drawerCloseBtn}
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className={styles.drawerLinks}>
              <NavLink to="/" className={styles.drawerLink}>
                <HomeIcon size={18} />
                <span>Home</span>
              </NavLink>
              <a
                href="/#events-section"
                className={styles.drawerLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar size={18} />
                <span>Upcoming Shows</span>
              </a>
              <NavLink to="/about" className={styles.drawerLink}>
                <Info size={18} />
                <span>About UNAI</span>
              </NavLink>
              <NavLink to="/contact" className={styles.drawerLink}>
                <Phone size={18} />
                <span>Contact & Venue</span>
              </NavLink>
            </div>

            <div className={styles.drawerFooter}>
              <a
                href="https://in.bookmyshow.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.drawerBmsBtn}
              >
                <Ticket size={18} />
                <span>View on BookMyShow</span>
              </a>
              <p className={styles.drawerCopyright}>
                © {new Date().getFullYear()} UNAI Events. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
