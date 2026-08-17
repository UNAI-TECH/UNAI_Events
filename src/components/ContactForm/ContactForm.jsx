import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useInquiries } from '../../hooks/useInquiries';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const { submitInquiry } = useInquiries();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_type: 'Auditorium Booking',
    message: '',
  });

  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ state: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setStatus({ state: 'loading', message: 'Sending your inquiry to UNAI Concierge...' });

    try {
      await submitInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        event_type: formData.event_type,
        message: formData.message.trim(),
      });

      setStatus({
        state: 'success',
        message: 'Thank you! Your message has been received in real-time. Our concierge team will get in touch within 24 hours.',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        event_type: 'Auditorium Booking',
        message: '',
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      setStatus({
        state: 'error',
        message: err.message || 'Failed to submit inquiry. Please try again.',
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Send Us an Inquiry</h3>
      <p className={styles.formSubtitle}>
        For bulk ticket bookings, artist curation, private events, or theater venue hire, fill out the details below.
      </p>

      {status.state === 'success' && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={20} />
          <span>{status.message}</span>
        </div>
      )}

      {status.state === 'error' && (
        <div className={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{status.message}</span>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g. Anand Sharma"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="anand@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.label}>
            Contact Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="event_type" className={styles.label}>
            Inquiry Purpose
          </label>
          <select
            id="event_type"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="Auditorium Booking">Auditorium / Venue Hire</option>
            <option value="Artist Performance Pitch">Artist / Production Pitch</option>
            <option value="Corporate / Bulk Bookings">Corporate & Bulk Bookings</option>
            <option value="Media & Press Inquiry">Media & Press Inquiry</option>
            <option value="Ticketing / BookMyShow Query">Ticketing Query</option>
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="message" className={styles.label}>
          Your Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us more about your inquiry or event requirements..."
          value={formData.message}
          onChange={handleChange}
          required
          className={styles.textarea}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={status.state === 'loading'}
        className={styles.submitBtn}
      >
        <Send size={16} />
        <span>{status.state === 'loading' ? 'Submitting in Realtime...' : 'Send Message'}</span>
      </button>
    </form>
  );
}
