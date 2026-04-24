import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '', title: 'Learn Mudras', desc: 'Explore the ancient vocabulary of hand gestures from Indian classical dance traditions.' },
  { icon: '', title: 'AI Detection', desc: 'Practice in real-time with webcam-based hand tracking powered by MediaPipe.' },
  { icon: '', title: 'Track Progress', desc: 'Monitor your accuracy and session history to improve your mudra mastery.' },
  { icon: '', title: 'Classical Traditions', desc: 'Study mudras from Bharatanatyam, Kathak, Odissi and other classical dance forms.' }
];

const mudraShowcase = [
  { name: 'Pataka', meaning: 'The Flag' },
  { name: 'Alapadma', meaning: 'Bloomed Lotus' },
  { name: 'Mushti', meaning: 'The Fist' },
  { name: 'Shikara', meaning: 'The Peak' },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroPattern} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={styles.heroContent}>
            <div style={styles.heroTag}>
              <span style={styles.tagOm}>ॐ</span>
              <span style={styles.tagText}>Indian Classical Dance</span>
            </div>
            <h1 style={styles.heroTitle}>
              नृत्यकला
              <br />
              <span style={styles.heroSubtitle}>Master the Sacred Art of</span>
              <br />
              <span style={styles.heroHighlight}>Hand Mudras</span>
            </h1>
            <p style={styles.heroDesc}>
              Discover the ancient language of hand gestures. Practice with AI-powered detection and
              deepen your connection to India's rich classical dance heritage.
            </p>
            <div style={styles.heroActions}>
              {user ? (
                <button className="btn btn-primary" onClick={() => navigate('/practice')} style={{ fontSize: '1rem', padding: '14px 36px' }}>
                  Start Practicing
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '1rem', padding: '14px 36px' }}>
                    Begin Your Journey
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/mudras')}>
                    Explore Mudras
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Floating mudra cards */}
          <div style={styles.mudraCards}>
            {mudraShowcase.map((m, i) => (
              <div key={m.name} style={{ ...styles.mudraCard, animationDelay: `${i * 0.1}s` }}>
                <div style={styles.mudraCardName}>{m.name}</div>
                <div style={styles.mudraCardMeaning}>{m.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div className="container">
          <div className="page-header">
            <h2>The NrityaKala Experience</h2>
            <p>Where ancient wisdom meets modern technology</p>
          </div>
          <div style={styles.featureGrid}>
            {features.map(f => (
              <div className="card" key={f.title} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={styles.cta}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--gold-light)', marginBottom: '12px' }}>
              Begin Your Dance Journey
            </h2>
            <p style={{ color: 'rgba(253,246,236,0.75)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', marginBottom: '28px' }}>
              Join thousands of students learning the sacred art of mudras
            </p>
            <button className="btn btn-gold" onClick={() => navigate('/register')} style={{ fontSize: '1rem', padding: '14px 40px' }}>
              Create Free Account
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
          NrityaKala — Preserving the Sacred Language of Hands
        </p>
      </footer>
    </div>
  );
};

const styles = {
  hero: {
    position: 'relative',
    background: 'linear-gradient(160deg, var(--brown-dark) 0%, var(--brown) 60%, var(--saffron-dark) 100%)',
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px 0 60px',
    overflow: 'hidden'
  },
  heroPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(200,151,42,0.08) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(232,100,12,0.08) 0%, transparent 50%)`,
    pointerEvents: 'none'
  },
  heroContent: {
    maxWidth: '600px',
    padding: '0 24px'
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(200,151,42,0.15)',
    border: '1px solid rgba(200,151,42,0.3)',
    borderRadius: '20px',
    padding: '6px 16px',
    marginBottom: '24px'
  },
  tagOm: { fontSize: '0.9rem' },
  tagText: {
    fontFamily: 'Cormorant Garamond, serif',
    color: 'var(--gold-light)',
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  heroTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '3.5rem',
    fontWeight: 700,
    lineHeight: 1.15,
    color: 'var(--cream)',
    marginBottom: '20px'
  },
  heroSubtitle: {
    fontSize: '1.8rem',
    fontWeight: 400,
    color: 'rgba(253,246,236,0.7)'
  },
  heroHighlight: {
    color: 'var(--gold-light)',
    fontStyle: 'italic'
  },
  heroDesc: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.15rem',
    color: 'rgba(253,246,236,0.75)',
    marginBottom: '36px',
    lineHeight: 1.7
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  mudraCards: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '40px 24px 0',
    maxWidth: '500px'
  },
  mudraCard: {
    background: 'rgba(253,246,236,0.1)',
    border: '1px solid rgba(200,151,42,0.25)',
    borderRadius: '12px',
    padding: '16px 20px',
    backdropFilter: 'blur(8px)',
    animation: 'fadeUp 0.5s ease forwards',
    opacity: 0
  },
  mudraEmoji: { fontSize: '1.5rem', marginBottom: '6px' },
  mudraCardName: {
    fontFamily: 'Playfair Display, serif',
    color: 'var(--gold-light)',
    fontSize: '0.95rem',
    fontWeight: 600
  },
  mudraCardMeaning: {
    fontFamily: 'Cormorant Garamond, serif',
    color: 'rgba(253,246,236,0.6)',
    fontSize: '0.8rem',
    fontStyle: 'italic'
  },
  features: {
    padding: '60px 0'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px'
  },
  featureCard: {
    textAlign: 'center',
    padding: '32px 24px'
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '16px'
  },
  cta: {
    background: 'linear-gradient(135deg, var(--brown-dark), var(--brown))',
    padding: '80px 0',
    borderTop: '1px solid rgba(200,151,42,0.2)',
    borderBottom: '1px solid rgba(200,151,42,0.2)'
  },
  footer: {
    textAlign: 'center',
    padding: '32px',
    borderTop: '1px solid var(--border)'
  }
};

export default Home;
