import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMudras } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const difficultyColor = {
  Beginner: 'badge-beginner',
  Intermediate: 'badge-intermediate',
  Advanced: 'badge-advanced'
};

const MudraCard = ({ mudra, onPractice }) => (
  <div className="card" style={styles.card}>
    <div style={styles.cardTop}>
      <div>
        <div style={styles.category}>{mudra.category} Hasta</div>
        <h3 style={styles.mudraName}>{mudra.name}</h3>
        <div style={styles.sanskritName}>{mudra.sanskritName}</div>
      </div>
      <span className={`badge ${difficultyColor[mudra.difficulty]}`}>{mudra.difficulty}</span>
    </div>

    <p style={styles.description}>{mudra.description}</p>

    <div style={styles.howTo}>
      <div style={styles.howToLabel}>How to Form</div>
      <p style={styles.howToText}>{mudra.howToForm}</p>
    </div>

    {mudra.meaning && (
      <div style={styles.meanings}>
        <span style={styles.meaningLabel}>Symbolises: </span>
        <span style={styles.meaningText}>{mudra.meaning}</span>
      </div>
    )}

    <div style={styles.cardActions}>
      <button className="btn btn-primary" style={{ flex: 1, padding: '10px' }} onClick={() => onPractice(mudra._id)}>
        Practice This
      </button>
    </div>
  </div>
);

const MudraList = () => {
  const [mudras, setMudras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getMudras()
      .then(res => setMudras(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePractice = (mudraId) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/practice?mudra=${mudraId}`);
  };

  const filtered = mudras.filter(m => {
    const matchesFilter = filter === 'All' || m.difficulty === filter;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Sacred Mudras</h1>
          <p>Explore the vocabulary of classical Indian dance</p>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <input
            className="form-input"
            style={{ maxWidth: '300px', marginBottom: 0 }}
            placeholder="Search mudras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={styles.filterButtons}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                style={{
                  ...styles.filterBtn,
                  background: filter === level ? 'var(--saffron)' : 'transparent',
                  color: filter === level ? 'white' : 'var(--text-mid)',
                  borderColor: filter === level ? 'var(--saffron)' : 'var(--border)'
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
              Showing {filtered.length} of {mudras.length} mudras
            </p>
            <div style={styles.grid}>
              {filtered.map(m => (
                <MudraCard key={m._id} mudra={m} onPractice={handlePractice} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  filterBar: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '32px'
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '8px 18px',
    borderRadius: '20px',
    border: '1.5px solid',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    paddingBottom: '60px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  category: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--saffron)',
    fontWeight: 500,
    marginBottom: '4px'
  },
  mudraName: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.4rem',
    color: 'var(--brown-dark)'
  },
  sanskritName: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.1rem',
    color: 'var(--gold)',
    fontStyle: 'italic'
  },
  description: {
    color: 'var(--text-mid)',
    fontSize: '0.875rem',
    lineHeight: 1.6
  },
  howTo: {
    background: 'rgba(232,100,12,0.05)',
    border: '1px solid rgba(232,100,12,0.15)',
    borderRadius: '8px',
    padding: '12px'
  },
  howToLabel: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--saffron-dark)',
    fontWeight: 600,
    marginBottom: '4px'
  },
  howToText: {
    fontSize: '0.85rem',
    color: 'var(--text-mid)',
    lineHeight: 1.6
  },
  meanings: {
    fontSize: '0.85rem'
  },
  meaningLabel: {
    color: 'var(--text-light)',
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic'
  },
  meaningText: {
    color: 'var(--brown)',
    fontFamily: 'Cormorant Garamond, serif'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  }
};

export default MudraList;
