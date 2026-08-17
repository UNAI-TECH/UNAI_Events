import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Ticket,
  Users,
  Search,
  Database,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  Eye,
  MessageSquare,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { useInquiries } from '../../hooks/useInquiries';
import EventFormModal from './EventFormModal';
import styles from './Admin.module.css';

export default function Admin() {
  const {
    user,
    role,
    isAdmin,
    loading: authLoading,
    authError,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    isSupabaseConfigured,
  } = useAuth();

  const {
    events,
    realtimeStatus,
    isLiveFromSupabase,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleHeroSpotlight,
    toggleFeatured,
    seedInitialEvents,
    refreshEvents,
  } = useEvents();

  const {
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    refreshInquiries,
  } = useInquiries();

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'inquiries' | 'database'
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Handle Login / Signup
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthMessage('');

    if (authMode === 'login') {
      const res = await signInWithPassword(email, password);
      if (!res.success) {
        setAuthMessage(res.error || 'Invalid credentials.');
      }
    } else {
      const res = await signUpWithPassword(email, password, fullName, true);
      if (res.success) {
        setAuthMessage('Account created! Please check your email for confirmation or sign in.');
        setAuthMode('login');
      } else {
        setAuthMessage(res.error || 'Sign up failed.');
      }
    }
    setAuthSubmitting(false);
  };

  // Handle Event Save (Create or Edit)
  const handleSaveEvent = async (eventData) => {
    if (editingEvent && editingEvent.id) {
      await updateEvent(editingEvent.id, eventData);
      showBanner('Event updated successfully with real-time sync!');
    } else {
      await createEvent(eventData);
      showBanner('New event created and broadcast to all clients in real-time!');
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteEvent(id);
        showBanner(`Event "${title}" deleted successfully.`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Handle Seed Sample Events
  const handleSeed = async () => {
    if (window.confirm('Populate Supabase with the UNAI Premier sample events dataset?')) {
      try {
        setSeedingLoading(true);
        const res = await seedInitialEvents();
        showBanner(`Successfully seeded ${res.count} events to database.`);
      } catch (err) {
        alert(err.message);
      } finally {
        setSeedingLoading(false);
      }
    }
  };

  const showBanner = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className={styles.adminWrapper}>
        <div className={styles.authContainer}>
          <div style={{ textAlign: 'center', color: '#94A3B8' }}>
            <RefreshCw size={32} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem' }}>Verifying UNAI Administrator Credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Login / Signup Screen)
  if (!user) {
    return (
      <div className={styles.adminWrapper}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <div className={styles.authBrandIcon}>
                <Lock size={26} />
              </div>
              <h2 className={styles.authTitle}>UNAI Admin Portal</h2>
              <p className={styles.authSubtitle}>
                Role-Protected Direct URL Dashboard for UNAI Events & Theatre
              </p>
            </div>

            {authMessage && (
              <div className={styles.errorMessage} style={{ margin: '0 0 1.25rem 0' }}>
                {authMessage}
              </div>
            )}
            {authError && (
              <div className={styles.errorMessage} style={{ margin: '0 0 1.25rem 0' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className={styles.authForm}>
              {authMode === 'signup' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Administrator"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.input}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Admin Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@unai-events.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className={styles.authBtn}
              >
                <Key size={16} />
                <span>
                  {authSubmitting
                    ? 'Authenticating...'
                    : authMode === 'login'
                    ? 'Authenticate & Access Dashboard'
                    : 'Create Admin Account'}
                </span>
              </button>
            </form>

            <div className={styles.authToggleRow}>
              <span>
                {authMode === 'login' ? "Need a new admin account?" : "Already have credentials?"}
              </span>
              <button
                type="button"
                className={styles.toggleLink}
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthMessage('');
                }}
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>

            {/* Quick Demo Helper */}
            <div className={styles.demoBox}>
              <strong>⚡ Supabase RBAC Info:</strong>
              <p style={{ marginTop: '0.3rem' }}>
                {isSupabaseConfigured
                  ? 'Supabase backend is configured. Log in with your registered admin credentials.'
                  : 'Demo Mode Active: Enter any email with "admin" or password "admin123" for instant local testing.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but NOT an Admin (Role-Based Access Control Rejection)
  if (!isAdmin) {
    return (
      <div className={styles.adminWrapper}>
        <div className={styles.authContainer}>
          <div className={`${styles.authCard} ${styles.deniedCard}`}>
            <div className={styles.authHeader}>
              <div className={`${styles.authBrandIcon} ${styles.deniedIcon}`}>
                <ShieldAlert size={30} />
              </div>
              <h2 className={styles.authTitle}>Access Denied (403)</h2>
              <p className={styles.authSubtitle}>
                Your account (<strong>{user.email}</strong>) is authenticated, but has the role of <strong>'{role || 'user'}'</strong>. Administrator privileges are required to access this dashboard.
              </p>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
              <p>
                To grant this user <strong>admin</strong> access in your Supabase backend:
              </p>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>Open your <strong>Supabase Dashboard &rarr; SQL Editor</strong>.</li>
                <li>Execute the following SQL command:</li>
              </ol>

              <div className={styles.sqlHelpBox}>
                UPDATE public.profiles<br />
                SET role = 'admin'<br />
                WHERE email = '{user.email}';
              </div>

              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Once executed, click "Refresh Status" below or re-login.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className={styles.authBtn}
                style={{ flex: 1 }}
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} /> Refresh Status
              </button>
              <button
                className={styles.logoutBtn}
                style={{ padding: '0.85rem 1.25rem' }}
                onClick={signOut}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated with 'admin' Role: Full Admin Dashboard
  const heroCount = events.filter((e) => e.hero_spotlight).length;
  const featuredCount = events.filter((e) => e.featured).length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length;

  const filteredEventsList = events.filter((evt) => {
    const matchesCat =
      categoryFilter === 'All' ||
      evt.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      evt.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      evt.venue?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      evt.city?.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className={styles.adminWrapper}>
      {/* Top Navigation Bar */}
      <header className={styles.adminHeader}>
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.adminBrand}>
            <img
              src="/logo-icon.png"
              alt="UNAI Admin"
              className={styles.adminLogoImg}
            />
            <div>
              <h1 className={styles.adminBrandTitle}>Admin Command Center</h1>
              <span className={styles.adminBrandSub}>Realtime Direct-URL Control</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.realtimeBadge}>
              <span className={styles.pulseDot}></span>
              <span>
                {isLiveFromSupabase ? 'Supabase Realtime Live' : 'Local Sandbox Connected'}
              </span>
            </div>

            <div className={styles.userBadge}>
              <Users size={14} />
              <span>{user.email}</span>
              <span className={styles.roleTag}>{role || 'ADMIN'}</span>
            </div>

            <Link to="/" className={styles.websiteBtn} title="View Live Website">
              <Eye size={14} />
              <span>View Website</span>
            </Link>

            <button onClick={signOut} className={styles.logoutBtn} title="Sign Out">
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ marginTop: '1.5rem' }}>
        {/* Success Action Notification */}
        {actionSuccessMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={18} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Realtime Metrics Summary Row */}
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <Calendar size={24} />
            </div>
            <div>
              <div className={styles.metricVal}>{events.length}</div>
              <div className={styles.metricLabel}>Total Events</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper} style={{ color: '#F59E0B' }}>
              <Flame size={24} />
            </div>
            <div>
              <div className={styles.metricVal}>{heroCount}</div>
              <div className={styles.metricLabel}>Hero Spotlight (Looping)</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper} style={{ color: '#A855F7' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div className={styles.metricVal}>{featuredCount}</div>
              <div className={styles.metricLabel}>Featured Shows</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper} style={{ color: '#38BDF8' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div className={styles.metricVal}>{newInquiriesCount}</div>
              <div className={styles.metricLabel}>New Customer Inquiries</div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'events' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={16} />
            <span>Events Management ({events.length})</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'inquiries' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <MessageSquare size={16} />
            <span>Inquiries & Concierge ({inquiries.length})</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'database' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={16} />
            <span>Supabase Setup & SQL Schema</span>
          </button>
        </div>

        {/* ===================================================================
            TAB 1: EVENTS MANAGEMENT
            =================================================================== */}
        {activeTab === 'events' && (
          <div>
            {/* Controls Bar */}
            <div className={styles.controlsBar}>
              <div className={styles.searchFilterGroup}>
                <div className={styles.searchInputWrapper}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search shows by title, city, or venue..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={styles.select}
                  style={{ width: 'auto', minWidth: '130px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Concert">Concerts</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Theatre">Theatre</option>
                  <option value="Workshop">Workshops</option>
                </select>
              </div>

              <div className={styles.actionBtns}>
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={seedingLoading}
                  className={styles.seedBtn}
                  title="Populate Supabase with default sample events"
                >
                  <RefreshCw size={15} />
                  <span>{seedingLoading ? 'Seeding...' : 'Seed Sample Events'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(null);
                    setIsModalOpen(true);
                  }}
                  className={styles.addEventBtn}
                >
                  <Plus size={16} />
                  <span>Add New Event</span>
                </button>
              </div>
            </div>

            {/* Events Table */}
            <div className={styles.tableCard}>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.eventsTable}>
                  <thead>
                    <tr>
                      <th>Event & Production</th>
                      <th>Category</th>
                      <th>Date & Schedule</th>
                      <th>Venue / City</th>
                      <th>Starting Price</th>
                      <th title="Include in the looping top hero carousel">Hero Spotlight</th>
                      <th title="Display prominently in featured upcoming grid">Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventsList.map((evt) => (
                      <tr key={evt.id}>
                        <td>
                          <div className={styles.eventCell}>
                            <img
                              src={evt.thumbnail_url || evt.image_url}
                              alt={evt.title}
                              className={styles.eventThumb}
                            />
                            <div>
                              <div className={styles.eventCellTitle}>{evt.title}</div>
                              <div className={styles.eventCellSub}>{evt.subtitle || 'UNAI Production'}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`badge-category badge-${evt.category?.toLowerCase()}`}>
                            {evt.category}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                            {evt.display_date?.month || 'AUG'} {evt.display_date?.day || '28'}, {evt.display_date?.year || '2026'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{evt.time || '8:00 PM'}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{evt.city}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{evt.venue}</div>
                        </td>

                        <td>
                          <strong style={{ color: 'var(--color-gold)' }}>{evt.price_starting}</strong>
                        </td>

                        {/* Real-time Hero Spotlight Switch */}
                        <td>
                          <label className={styles.switch} title="Toggle Hero Carousel Looping Spotlight">
                            <input
                              type="checkbox"
                              checked={Boolean(evt.hero_spotlight)}
                              onChange={() => toggleHeroSpotlight(evt.id)}
                            />
                            <span className={styles.slider}></span>
                          </label>
                        </td>

                        {/* Real-time Featured Switch */}
                        <td>
                          <label className={styles.switch} title="Toggle Featured Upcoming Status">
                            <input
                              type="checkbox"
                              checked={Boolean(evt.featured)}
                              onChange={() => toggleFeatured(evt.id)}
                            />
                            <span className={styles.slider}></span>
                          </label>
                        </td>

                        {/* Edit & Delete Action Buttons */}
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => {
                                setEditingEvent(evt);
                                setIsModalOpen(true);
                              }}
                              title="Edit Event"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteEvent(evt.id, evt.title)}
                              title="Delete Event"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredEventsList.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                          No events match the selected criteria. Click <strong>"Add New Event"</strong> or <strong>"Seed Sample Events"</strong>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: CUSTOMER INQUIRIES & LEADS
            =================================================================== */}
        {activeTab === 'inquiries' && (
          <div className={styles.inquiryList}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
                Customer Booking Inquiries & Leads
              </h3>
              <button
                type="button"
                onClick={refreshInquiries}
                className={styles.seedBtn}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {inquiries.map((inq) => (
              <div key={inq.id} className={styles.inquiryCard}>
                <div className={styles.inquiryTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={styles.inquiryName}>{inq.name}</span>
                    <span className={styles.inquiryTypeBadge}>{inq.event_type}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <select
                      value={inq.status}
                      onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                      className={styles.select}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                    >
                      <option value="New">Status: New</option>
                      <option value="In Review">Status: In Review</option>
                      <option value="Replied">Status: Replied</option>
                      <option value="Archived">Status: Archived</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => deleteInquiry(inq.id)}
                      className={styles.deleteBtn}
                      title="Delete Inquiry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.inquiryContactRow}>
                  <span><strong>Email:</strong> {inq.email}</span>
                  {inq.phone && <span><strong>Phone:</strong> {inq.phone}</span>}
                  <span>
                    <strong>Received:</strong>{' '}
                    {new Date(inq.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className={styles.inquiryMsg}>{inq.message}</div>
              </div>
            ))}

            {inquiries.length === 0 && (
              <div className={styles.guideCard} style={{ textAlign: 'center', padding: '3rem' }}>
                <MessageSquare size={36} style={{ color: '#64748B', marginBottom: '1rem' }} />
                <h4 style={{ color: '#FFFFFF' }}>No Inquiries Yet</h4>
                <p style={{ color: '#94A3B8' }}>Customer inquiries submitted via the Contact page will appear here instantly in real-time.</p>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: DATABASE SETUP & SQL SCHEMA GUIDE
            =================================================================== */}
        {activeTab === 'database' && (
          <div className={styles.guideCard}>
            <h3 className={styles.guideTitle}>Supabase Realtime Backend Integration</h3>
            <p className={styles.guideText}>
              UNAI Events connects seamlessly with your Supabase PostgreSQL database with Row Level Security (RLS) and Realtime change broadcasts.
            </p>

            <div className={styles.guideSteps}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h5>Configure Environment Variables</h5>
                  <p>
                    Add your Supabase credentials in your local <code>.env</code> file:
                  </p>
                  <div className={styles.sqlHelpBox}>
                    VITE_SUPABASE_URL=https://your-project-id.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </div>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h5>Execute the Database Migration SQL</h5>
                  <p>
                    Open your Supabase project dashboard &rarr; <strong>SQL Editor</strong> &rarr; Run the provided <code>supabase_schema.sql</code> script to create the <code>events</code>, <code>inquiries</code>, and <code>profiles</code> tables with Realtime enabled.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h5>Grant Admin Role (RBAC)</h5>
                  <p>
                    To assign the <strong>admin</strong> role to any signed-up user:
                  </p>
                  <div className={styles.sqlHelpBox}>
                    UPDATE public.profiles<br />
                    SET role = 'admin'<br />
                    WHERE email = 'your-email@example.com';
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Event Create / Edit Modal Dialog */}
      {isModalOpen && (
        <EventFormModal
          event={editingEvent}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}
