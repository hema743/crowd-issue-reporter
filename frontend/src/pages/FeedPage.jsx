import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../utils/api';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'roads', label: '🛣️ Roads' },
  { id: 'water', label: '💧 Water' },
  { id: 'electricity', label: '⚡ Electricity' },
  { id: 'garbage', label: '🗑️ Garbage' },
  { id: 'sanitation', label: '🚿 Sanitation' },
  { id: 'parks', label: '🌳 Parks' },
  { id: 'lights', label: '💡 Street Lights' },
  { id: 'drainage', label: '🌊 Drainage' },
  { id: 'buildings', label: '🏛️ Buildings' },
  { id: 'other', label: '📌 Other' },
];

const STATUSES = [
  { id: '', label: 'All Statuses' },
  { id: 'open', label: 'Open', color: '#1a56db', bg: '#e8f0fe' },
  { id: 'acknowledged', label: 'Acknowledged', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'in_progress', label: 'In Progress', color: '#c27803', bg: '#fef3c7' },
  { id: 'resolved', label: 'Resolved', color: '#057a55', bg: '#def7ec' },
  { id: 'rejected', label: 'Rejected', color: '#e02424', bg: '#fde8e8' },
];

const SEVERITIES = [
  { id: 'low', label: 'Low', color: '#057a55', bg: '#def7ec' },
  { id: 'medium', label: 'Medium', color: '#c27803', bg: '#fef3c7' },
  { id: 'high', label: 'High', color: '#c2410c', bg: '#fff7ed' },
  { id: 'critical', label: 'Critical', color: '#e02424', bg: '#fde8e8' },
];

function getSev(id) { return SEVERITIES.find(s => s.id === id) || { label: id, color: '#6b7280', bg: '#f3f4f6' }; }
function getStat(id) { return STATUSES.find(s => s.id === id) || { label: id, color: '#6b7280', bg: '#f3f4f6' }; }
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
  return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
}

export default function FeedPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [sort, setSort] = useState('date');

  useEffect(() => {
    fetchIssues();
  }, [filterCat, filterStat, sort]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat) params.category = filterCat;
      if (filterStat) params.status = filterStat;
      if (sort === 'votes') params.sort = 'votes';
      const res = await issuesAPI.getAll(params);
      setIssues(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e, id) => {
    e.stopPropagation();
    try {
      await issuesAPI.vote(id);
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = issues.filter(i =>
    search === '' ||
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>

        {/* Sidebar */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px', height: 'fit-content', position: 'sticky', top: '76px' }}>
          <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '16px' }}>🔍 Filters</div>

          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..."
            style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', boxSizing: 'border-box' }}
          />

          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '8px' }}>CATEGORY</div>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)}
              style={{ display: 'block', width: '100%', padding: '6px 10px', border: 'none', borderRadius: '7px', background: filterCat === c.id ? '#e8f0fe' : 'transparent', color: filterCat === c.id ? '#1a56db' : '#374151', fontWeight: filterCat === c.id ? '700' : '400', fontSize: '13px', cursor: 'pointer', textAlign: 'left', marginBottom: '2px' }}>
              {c.label}
            </button>
          ))}

          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', margin: '12px 0 8px' }}>STATUS</div>
          {STATUSES.map(s => (
            <button key={s.id} onClick={() => setFilterStat(s.id)}
              style={{ display: 'block', width: '100%', padding: '6px 10px', border: 'none', borderRadius: '7px', background: filterStat === s.id ? '#e8f0fe' : 'transparent', color: filterStat === s.id ? '#1a56db' : '#374151', fontWeight: filterStat === s.id ? '700' : '400', fontSize: '13px', cursor: 'pointer', textAlign: 'left', marginBottom: '2px' }}>
              {s.label}
            </button>
          ))}

          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', margin: '12px 0 8px' }}>SORT BY</div>
          {[['date', 'Newest First'], ['votes', 'Most Upvoted']].map(([v, l]) => (
            <button key={v} onClick={() => setSort(v)}
              style={{ display: 'block', width: '100%', padding: '6px 10px', border: 'none', borderRadius: '7px', background: sort === v ? '#e8f0fe' : 'transparent', color: sort === v ? '#1a56db' : '#374151', fontWeight: sort === v ? '700' : '400', fontSize: '13px', cursor: 'pointer', textAlign: 'left', marginBottom: '2px' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Issues List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Community Issues</h1>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>{filtered.length} issues found</p>
            </div>
            <button onClick={() => navigate('/report')}
              style={{ padding: '9px 20px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              + Report Issue
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading issues...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '48px' }}>🔍</div>
              <p style={{ fontSize: '15px', fontWeight: '600' }}>No issues found</p>
            </div>
          ) : (
            filtered.map(issue => {
              const sev = getSev(issue.severity);
              const stat = getStat(issue.status);
              return (
                <div key={issue.id} onClick={() => navigate(`/issues/${issue.id}`)}
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 24px', marginBottom: '14px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: sev.bg, color: sev.color }}>{sev.label}</span>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: stat.bg, color: stat.color }}>{stat.label}</span>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#f3f4f6', color: '#374151' }}>{issue.category}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{timeAgo(issue.createdAt)}</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: '700' }}>{issue.title}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{issue.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>📍 {issue.location}</span>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <button onClick={e => handleVote(e, issue.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e8f0fe', color: '#1a56db', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        👍 {issue.upvote_count}
                      </button>
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>💬 {issue.comment_count}</span>
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>👁 {issue.views}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
                    Reported by <strong>{issue.reporter_name}</strong>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}