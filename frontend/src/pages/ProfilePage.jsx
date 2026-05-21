import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesAPI } from '../utils/api';

const STATUSES = [
  { id: 'open', label: 'Open', color: '#1a56db', bg: '#e8f0fe' },
  { id: 'acknowledged', label: 'Acknowledged', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'in_progress', label: 'In Progress', color: '#c27803', bg: '#fef3c7' },
  { id: 'resolved', label: 'Resolved', color: '#057a55', bg: '#def7ec' },
  { id: 'rejected', label: 'Rejected', color: '#e02424', bg: '#fde8e8' },
];

function getStat(id) { return STATUSES.find(s => s.id === id) || { label: id, color: '#6b7280', bg: '#f3f4f6' }; }

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myIssues, setMyIssues] = useState([]);

 useEffect(() => {
    if (!user) { navigate('/login'); return; }
    issuesAPI.getAll({ reported_by: user.id })
      .then(res => setMyIssues(res.data || []))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#1a56db', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800' }}>
              {user.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{user.name}</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>{user.email}</p>
              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: user.role === 'admin' ? '#fde8e8' : '#e8f0fe', color: user.role === 'admin' ? '#e02424' : '#1a56db', marginTop: '6px' }}>
                {user.role}
              </span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#e02424' }}>
              Sign Out
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[['Issues Reported', user.issues_reported || myIssues.length, '📋'], ['Reputation', user.reputation || 0, '⭐'], ['Member Since', '2025', '📅']].map(([l, v, icon]) => (
              <div key={l} style={{ textAlign: 'center', background: '#f8faff', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '22px' }}>{icon}</div>
                <div style={{ fontWeight: '800', fontSize: '22px' }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Issues */}
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '14px' }}>My Reported Issues</h2>
        {myIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '48px' }}>📋</div>
            <p style={{ fontWeight: '600' }}>No issues reported yet</p>
            <button onClick={() => navigate('/report')}
              style={{ padding: '8px 20px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
              Report First Issue
            </button>
          </div>
        ) : (
          myIssues.map(issue => {
            const stat = getStat(issue.status);
            return (
              <div key={issue.id} onClick={() => navigate(`/issues/${issue.id}`)}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{issue.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>📍 {issue.location}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: stat.bg, color: stat.color, whiteSpace: 'nowrap' }}>
                  {stat.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}