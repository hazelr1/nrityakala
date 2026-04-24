import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', level: 'Beginner' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getUserProfile().then(res => {
      const d = res.data;
      setForm({ name: d.name || '', bio: d.bio || '', level: d.level || 'Beginner' });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await updateUserProfile(form);
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const levelColors = {
    Beginner: 'var(--success)',
    Intermediate: 'var(--saffron)',
    Advanced: 'var(--crimson)'
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="page-header">
          <h1>Your Profile</h1>
          <p>Manage your NrityaKala account</p>
        </div>

        {/* Profile card */}
        <div className="card" style={styles.profileCard}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={styles.profileInfo}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{user?.email}</p>
            <span style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: `${levelColors[form.level]}20`,
              color: levelColors[form.level]
            }}>
              {form.level}
            </span>
          </div>
        </div>

        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px' }}>
            {message.text}
          </div>
        )}

        {/* Edit form */}
        <div className="card">
          <div style={styles.formHeader}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>
              {editMode ? 'Edit Profile' : 'Profile Details'}
            </h3>
            {!editMode && (
              <button className="btn btn-secondary" style={{ padding: '8px 20px' }} onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell us about your dance journey..."
                  maxLength={200}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                  {form.bio.length}/200 characters
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Dance Level</label>
                <select
                  className="form-input"
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setEditMode(false);
                  setMessage({ type: '', text: '' });
                }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.detailsList}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name</span>
                <span style={styles.detailValue}>{form.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email</span>
                <span style={styles.detailValue}>{user?.email}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Level</span>
                <span style={styles.detailValue}>{form.level}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Bio</span>
                <span style={{ ...styles.detailValue, color: form.bio ? 'var(--text-dark)' : 'var(--text-light)', fontStyle: form.bio ? 'normal' : 'italic' }}>
                  {form.bio || 'No bio yet — click Edit to add one'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '20px',
    padding: '32px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--saffron), var(--gold))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Playfair Display, serif',
    fontSize: '2rem',
    color: 'white',
    fontWeight: 700,
    flexShrink: 0,
    boxShadow: '0 4px 20px rgba(232,100,12,0.3)'
  },
  profileInfo: { flex: 1 },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  detailsList: { display: 'flex', flexDirection: 'column', gap: '0' },
  detailRow: {
    display: 'flex',
    gap: '16px',
    padding: '14px 0',
    borderBottom: '1px solid var(--border)'
  },
  detailLabel: {
    width: '80px',
    flexShrink: 0,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-light)',
    fontWeight: 500,
    paddingTop: '2px'
  },
  detailValue: {
    flex: 1,
    color: 'var(--text-dark)',
    fontSize: '0.95rem'
  }
};

export default Profile;
