import React, { useState, useEffect } from 'react';
import { getPracticeHistory } from '../utils/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (p) => {
    setLoading(true);
    try {
      const res = await getPracticeHistory(p);
      setHistory(res.data.logs);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Practice History</h1>
          <p>Your journey through the mudras</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '1rem', marginBottom: '12px' }}>HISTORY</div>
            <h3>No practice history yet</h3>
            <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
              Complete a practice session to see your results here.
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Mudra</th>
                    <th style={styles.th}>Detected As</th>
                    <th style={styles.th}>Accuracy</th>
                    <th style={styles.th}>Result</th>
                    <th style={styles.th}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log, i) => (
                    <tr key={log._id} style={{ ...styles.row, background: i % 2 === 0 ? 'white' : 'var(--cream)' }}>
                      <td style={styles.td}>{formatDate(log.timestamp)}</td>
                      <td style={{ ...styles.td, fontFamily: 'Playfair Display, serif', color: 'var(--brown-dark)', fontWeight: 600 }}>
                        {log.mudraName}
                      </td>
                      <td style={{ ...styles.td, color: 'var(--text-mid)' }}>{log.detectedMudra}</td>
                      <td style={styles.td}>
                        <div style={styles.accuracyCell}>
                          <div style={styles.accuracyBar}>
                            <div style={{
                              ...styles.accuracyFill,
                              width: `${log.accuracyScore}%`,
                              background: log.accuracyScore >= 70 ? '#2E7D32' : log.accuracyScore >= 40 ? 'var(--saffron)' : '#C62828'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.accuracyScore}%</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span className={`badge ${log.isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                          {log.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: 'var(--text-light)' }}>
                        {log.duration > 0 ? `${log.duration}s` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button className="btn btn-secondary" style={{ padding: '8px 20px' }}
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  Prev
                </button>
                <span style={{ color: 'var(--text-mid)', fontSize: '0.9rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button className="btn btn-secondary" style={{ padding: '8px 20px' }}
                  onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 24px var(--shadow)',
    marginBottom: '24px'
  },
  headerRow: {
    background: 'var(--brown-dark)'
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--gold-light)',
    whiteSpace: 'nowrap'
  },
  row: { transition: 'background 0.1s' },
  td: {
    padding: '14px 16px',
    fontSize: '0.875rem',
    color: 'var(--text-dark)',
    borderBottom: '1px solid var(--border)'
  },
  accuracyCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  accuracyBar: {
    width: '60px',
    height: '6px',
    background: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  accuracyFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '60px'
  }
};

export default History;
