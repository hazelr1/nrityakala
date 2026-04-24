import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = ({ mode = 'login' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgPattern} />
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>NrityaKala</h1>
          <p style={styles.subtitle}>{isRegister ? 'Begin your journey into classical mudras' : 'Welcome back, dancer'}</p>
        </div>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-ornament">•</span>
          <div className="divider-line" />
        </div>

        <h2 style={styles.formTitle}>{isRegister ? 'Create Account' : 'Sign In'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={styles.switchText}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={isRegister ? '/login' : '/register'} style={{ color: 'var(--saffron)', fontWeight: 500 }}>
            {isRegister ? 'Sign In' : 'Create one'}
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(160deg, var(--brown-dark), var(--brown) 60%, var(--cream-dark))',
    position: 'relative'
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 30% 70%, rgba(200,151,42,0.07) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(232,100,12,0.07) 0%, transparent 50%)`,
    pointerEvents: 'none'
  },
  card: {
    background: 'var(--cream)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 60px rgba(44,26,14,0.3)',
    border: '1px solid var(--border)',
    position: 'relative'
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  logo: { fontSize: '2.5rem', marginBottom: '8px' },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.8rem',
    color: 'var(--brown-dark)',
    marginBottom: '4px'
  },
  subtitle: {
    fontFamily: 'Cormorant Garamond, serif',
    color: 'var(--text-light)',
    fontSize: '1rem',
    fontStyle: 'italic'
  },
  formTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.3rem',
    color: 'var(--brown)',
    marginBottom: '20px',
    textAlign: 'center'
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    color: 'var(--text-light)',
    fontSize: '0.9rem'
  }
};

export default AuthPage;
