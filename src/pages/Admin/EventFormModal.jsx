import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Ticket,
  Check,
  UploadCloud,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { uploadEventImage } from '../../utils/supabaseClient';
import styles from './Admin.module.css';

export default function EventFormModal({ event, onClose, onSave }) {
  const isEditing = Boolean(event && event.id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    if (event) {
      return {
        ...event,
        highlights: Array.isArray(event.highlights) ? event.highlights : [],
        ticket_tiers: Array.isArray(event.ticket_tiers) ? event.ticket_tiers : [],
      };
    }
    return {
      title: '',
      subtitle: '',
      category: 'Concert',
      date: new Date().toISOString().split('T')[0],
      time: '8:00 PM',
      duration: '120 Mins',
      language: 'English',
      age_limit: 'All Ages',
      venue: 'Royal Opera Auditorium',
      city: 'Mumbai',
      price_starting: '₹499',
      image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      bookmyshow_url: 'https://in.bookmyshow.com',
      featured: true,
      hero_spotlight: false,
      status: 'Booking Open',
      description: '',
      highlights: ['Live Performance', 'VIP Seating Available'],
      ticket_tiers: [
        { name: 'Silver Tier', price: '₹499', status: 'Available' },
        { name: 'Gold Tier', price: '₹999', status: 'Available' },
        { name: 'VIP Platinum', price: '₹1,999', status: 'Limited' },
      ],
    };
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [newTier, setNewTier] = useState({ name: '', price: '', status: 'Available' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' | 'url'
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Image Upload to Supabase Storage Bucket Handler
  const handleImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WebP, GIF).');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      // Upload file directly to Supabase 'event-images' bucket
      const publicUrl = await uploadEventImage(file);

      setFormData((prev) => ({
        ...prev,
        image_url: publicUrl,
        thumbnail_url: publicUrl,
      }));
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload image to Supabase Storage.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  // Date parsing helper
  const generateDisplayDate = (dateString, timeString) => {
    try {
      const d = new Date(dateString);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[d.getUTCMonth()] || 'AUG';
      const day = String(d.getUTCDate()).padStart(2, '0');
      const year = String(d.getUTCFullYear());
      return { month, day, time: timeString || '8:00 PM', year };
    } catch {
      return { month: 'AUG', day: '28', time: timeString || '8:00 PM', year: '2026' };
    }
  };

  // Highlights management
  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()],
    }));
    setNewHighlight('');
  };

  const removeHighlight = (idx) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  };

  // Ticket Tiers management
  const addTier = () => {
    if (!newTier.name.trim() || !newTier.price.trim()) return;
    setFormData((prev) => ({
      ...prev,
      ticket_tiers: [...prev.ticket_tiers, { ...newTier }],
    }));
    setNewTier({ name: '', price: '', status: 'Available' });
  };

  const removeTier = (idx) => {
    setFormData((prev) => ({
      ...prev,
      ticket_tiers: prev.ticket_tiers.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue || !formData.city || !formData.date) {
      setError('Please fill in all mandatory fields (Title, Venue, City, Date).');
      return;
    }

    if (!formData.image_url) {
      setError('Please upload a cover image or provide an image URL for the event poster.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const display_date = generateDisplayDate(formData.date, formData.time);
      const finalEvent = {
        ...formData,
        display_date,
        thumbnail_url: formData.thumbnail_url || formData.image_url,
      };

      await onSave(finalEvent);
      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {isEditing ? `Edit Show: ${formData.title}` : 'Add New UNAI Event'}
            </h3>
            <p className={styles.modalSubtitle}>
              {isEditing
                ? 'Update show details, upload new cover poster, or adjust ticket tiers'
                : 'Create and publish a new event with cover poster stored in Supabase Storage'}
            </p>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.eventForm}>
          {/* Section 1: Basic Overview */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionHeading}>1. Event Overview</h4>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ flex: 2 }}>
                <label className={styles.label}>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Shannon Weigel Acoustic Night"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Concert">Concert</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Theatre">Theatre</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Dance">Dance</option>
                  <option value="Festival">Festival</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ flex: 2 }}>
                <label className={styles.label}>Subtitle / Tour Name</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="e.g. Tour: Love Me As I Love You"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Booking Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Booking Open">Booking Open</option>
                  <option value="Filling Fast">Filling Fast</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Announcing Soon">Announcing Soon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Date, Time & Venue */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionHeading}>2. Schedule & Venue</h4>

            <div className={styles.formGrid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Show Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. 8:00 PM"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 150 Mins"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.label}>Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. The Grand Symphony Hall, MG Road"
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Starting Price</label>
                <input
                  type="text"
                  name="price_starting"
                  value={formData.price_starting}
                  onChange={handleChange}
                  placeholder="e.g. ₹799"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Language</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="e.g. English"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Age Limit</label>
                <input
                  type="text"
                  name="age_limit"
                  value={formData.age_limit}
                  onChange={handleChange}
                  placeholder="e.g. 12+"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cover Image Upload to Supabase Storage Bucket & Links */}
          <div className={styles.formSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 className={styles.sectionHeading} style={{ margin: 0 }}>
                3. Cover Image & Poster (Supabase Storage Bucket)
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    background: uploadMethod === 'upload' ? 'var(--color-gold)' : 'rgba(255,255,255,0.08)',
                    color: uploadMethod === 'upload' ? '#051024' : '#CBD5E1',
                    fontWeight: 700,
                  }}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    background: uploadMethod === 'url' ? 'var(--color-gold)' : 'rgba(255,255,255,0.08)',
                    color: uploadMethod === 'url' ? '#051024' : '#CBD5E1',
                    fontWeight: 700,
                  }}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {uploadMethod === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileInputChange}
                  className={styles.hiddenFileInput}
                />

                {/* Upload Placeholder / Dropzone */}
                <div
                  className={`${styles.uploadDropzone} ${isDragOver ? styles.uploadDropzoneDragOver : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <div className={styles.dropzoneIcon}>
                    {uploadingImage ? (
                      <RefreshCw size={22} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <UploadCloud size={24} />
                    )}
                  </div>
                  <div>
                    <span className={styles.dropzoneTitle}>
                      {uploadingImage ? 'Uploading image to Supabase Bucket...' : 'Click to Upload or Drag & Drop Cover Poster'}
                    </span>
                    <p className={styles.dropzoneSub}>
                      PNG, JPG, WebP (Stores in 'event-images' storage bucket with public CDN URL)
                    </p>
                  </div>
                </div>

                {/* Live Image Preview Card */}
                {formData.image_url && (
                  <div className={styles.imagePreviewBox}>
                    <img
                      src={formData.image_url}
                      alt="Cover Preview"
                      className={styles.previewThumb}
                    />
                    <div className={styles.previewDetails}>
                      <div className={styles.previewStorageBadge}>
                        <CheckCircle2 size={12} />
                        <span>Ready in Database</span>
                      </div>
                      <span className={styles.previewUrlText}>{formData.image_url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image_url: '', thumbnail_url: '' }))}
                      className={styles.removeImageBtn}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label className={styles.label}>Cover Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/... or Supabase storage URL"
                  required
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
              <label className={styles.label}>Official BookMyShow Event Link</label>
              <input
                type="url"
                name="bookmyshow_url"
                value={formData.bookmyshow_url}
                onChange={handleChange}
                placeholder="https://in.bookmyshow.com/events/..."
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Event Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed storyline, synopsis, or performance description..."
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Section 4: Display Flags */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionHeading}>4. Carousel & Homepage Visibility</h4>
            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="hero_spotlight"
                  checked={formData.hero_spotlight}
                  onChange={handleChange}
                />
                <span>
                  <strong>Hero Spotlight Carousel</strong> — Include in the top looping 3D hero carousel
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span>
                  <strong>Featured Event</strong> — Highlight prominently in the Upcoming Shows grid
                </span>
              </label>
            </div>
          </div>

          {/* Section 5: Highlights List */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionHeading}>5. Event Highlights</h4>
            <div className={styles.dynamicRow}>
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add highlight (e.g. VIP Concierge Lounge)"
                className={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
              />
              <button type="button" onClick={addHighlight} className={styles.addItemBtn}>
                <Plus size={16} /> Add
              </button>
            </div>

            <div className={styles.pillList}>
              {formData.highlights.map((h, i) => (
                <span key={i} className={styles.highlightPill}>
                  <Sparkles size={13} />
                  <span>{h}</span>
                  <button type="button" onClick={() => removeHighlight(i)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 6: Ticket Tiers */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionHeading}>6. Ticket Pricing Tiers</h4>
            <div className={styles.tierInputRow}>
              <input
                type="text"
                placeholder="Tier Name (e.g. Gold Balcony)"
                value={newTier.name}
                onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Price (e.g. ₹1,499)"
                value={newTier.price}
                onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
                className={styles.input}
              />
              <select
                value={newTier.status}
                onChange={(e) => setNewTier({ ...newTier, status: e.target.value })}
                className={styles.select}
              >
                <option value="Available">Available</option>
                <option value="Filling Fast">Filling Fast</option>
                <option value="Selling Fast">Selling Fast</option>
                <option value="Limited">Limited</option>
                <option value="Sold Out">Sold Out</option>
              </select>
              <button type="button" onClick={addTier} className={styles.addItemBtn}>
                <Plus size={16} /> Add Tier
              </button>
            </div>

            <div className={styles.tierList}>
              {formData.ticket_tiers.map((t, idx) => (
                <div key={idx} className={styles.tierItem}>
                  <div>
                    <strong>{t.name}</strong> — <span className={styles.tierPrice}>{t.price}</span> ({t.status})
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(idx)}
                    className={styles.deleteTierBtn}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving || uploadingImage} className={styles.saveBtn}>
              <Check size={16} />
              <span>{saving ? 'Saving to Supabase...' : isEditing ? 'Save Changes' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
