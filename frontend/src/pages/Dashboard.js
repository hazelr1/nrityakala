import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPracticeStats } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const StatCard = ({ label, value, sub, color }) => (
  <div className="card" style={styles.statCard}>
    <div style={{ ...styles.statValue, color: color || 'var(--saffron)' }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
    {sub && <div style={styles.statSub}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPracticeStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const trendData = stats?.trend?.map(d => ({
    date: d._id.slice(5), // MM-DD
    accuracy: Math.round(d.avgAccuracy),
    sessions: d.count
  })) || [];

  const mudraData = stats?.mudraBreakdown?.map(d => ({
    name: d._id,
    accuracy: Math.round(d.avgAccuracy),
    sessions: d.count
  })) || [];

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name} - keep dancing!</p>
        </div>

        {/* Stats row */}
        <div style={styles.statsGrid}>
          <StatCard label="Total Sessions" value={stats?.totalSessions || 0} sub="practice sessions" />
          <StatCard label="Avg. Accuracy" value={`${stats?.avgAccuracy || 0}%`} sub="across all sessions" color="var(--gold)" />
          <StatCard label="Correct Frames" value={stats?.totalCorrect || 0} sub="total detections" color="var(--crimson)" />
          <StatCard label="Mudras Practiced" value={stats?.mudraBreakdown?.length || 0} sub="unique mudras" color="var(--brown-mid)" />
        </div>

        {/* Quick actions */}
        <div style={styles.actions}>
          <button className="btn btn-primary" onClick={() => navigate('/practice')}>
            Start Practice Session
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/mudras')}>
            Browse Mudras
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>
            View History
          </button>
        </div>

        {stats?.totalSessions === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', marginTop: '24px' }}>
            <div style={{ fontSize: '1rem', marginBottom: '16px' }}>NRITYAKALA</div>
            <h3 style={{ marginBottom: '8px' }}>No sessions yet</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
              Start your first practice session to see your progress here.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/practice')}>
              Begin Practice
            </button>
          </div>
        ) : (
          <div style={styles.chartsGrid}>
            {/* Accuracy Trend */}
            {trendData.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>7-Day Accuracy Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-light)' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-light)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      formatter={(v) => [`${v}%`, 'Accuracy']}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="var(--saffron)" strokeWidth={2} dot={{ fill: 'var(--saffron)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Per-mudra breakdown */}
            {mudraData.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Mudra Performance</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mudraData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-light)' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-mid)' }} width={90} />
                    <Tooltip
                      contentStyle={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      formatter={(v, name) => [name === 'accuracy' ? `${v}%` : v, name === 'accuracy' ? 'Avg Accuracy' : 'Sessions']}
                    />
                    <Bar dataKey="accuracy" fill="var(--gold)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    textAlign: 'center',
    padding: '28px 20px'
  },
  statValue: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '2.2rem',
    fontWeight: 700,
    marginBottom: '4px'
  },
  statLabel: {
    fontWeight: 500,
    color: 'var(--text-dark)',
    fontSize: '0.9rem',
    marginBottom: '2px'
  },
  statSub: {
    fontSize: '0.78rem',
    color: 'var(--text-light)'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '32px'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    paddingBottom: '60px'
  }
};

export default Dashboard;
