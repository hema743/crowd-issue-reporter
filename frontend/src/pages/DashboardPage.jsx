import { useState, useEffect } from 'react';
import { statsAPI } from '../utils/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.get()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading dashboard...</div>;
  if (!stats) return <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Failed to load stats</div>;

  const { overview, byCategory, bySeverity, byStatus, topReporters } = stats;

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>📊 Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>Real-time overview of civic issues</p>

        {/* Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            ['Total Issues', overview.total, '#1a56db', '#e8f0fe', '📋'],
            ['Open Issues', overview.open, '#e02424', '#fde8e8', '🔴'],
            ['In Progress', overview.inProgress, '#c27803', '#fef3c7', '🟡'],
            ['Resolved', overview.resolved, '#057a55', '#def7ec', '✅'],
            ['Resolution Rate', `${overview.resolutionRate}%`, '#1a56db', '#e8f0fe', '📈'],
            ['Total Citizens', overview.totalUsers, '#7c3aed', '#f5f3ff', '👥'],
          ].map(([label, value, color, bg, icon]) => (
            <div key={label} style={{ background: bg, borderRadius: '12px', padding: '18px 22px', borderTop: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '12px', color, fontWeight: '600', marginBottom: '6px' }}>{label}</div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: '#111827' }}>{value}</div>
                </div>
                <div style={{ fontSize: '28px' }}>{icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* By Category */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Issues by Category</h2>
            {byCategory.map(c => (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', minWidth: '90px' }}>{c.category}</div>
                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((c.count / overview.total) * 100)}%`, height: '100%', background: '#1a56db', borderRadius: '20px' }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', minWidth: '20px' }}>{c.count}</div>
              </div>
            ))}
          </div>

          {/* By Status */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Issues by Status</h2>
            {byStatus.map(s => {
              const colors = { open: '#1a56db', acknowledged: '#7c3aed', in_progress: '#c27803', resolved: '#057a55', rejected: '#e02424' };
              const bgs = { open: '#e8f0fe', acknowledged: '#f5f3ff', in_progress: '#fef3c7', resolved: '#def7ec', rejected: '#fde8e8' };
              return (
                <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: bgs[s.status] || '#f3f4f6', color: colors[s.status] || '#6b7280' }}>{s.status}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '80px', background: '#f3f4f6', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((s.count / overview.total) * 100)}%`, height: '100%', background: colors[s.status] || '#6b7280', borderRadius: '20px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{s.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Reporters */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>🏆 Top Reporters</h2>
          {topReporters.map((r, i) => (
            <div key={r.reporter_name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < topReporters.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e8f0fe', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, fontSize: '13px', fontWeight: '600' }}>{r.reporter_name}</div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a56db' }}>📋 {r.count} issues</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}