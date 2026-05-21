import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI, commentsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SEVERITIES = [
  { id: 'low',      label: 'Low',      color: '#057a55', bg: '#def7ec' },
  { id: 'medium',   label: 'Medium',   color: '#c27803', bg: '#fef3c7' },
  { id: 'high',     label: 'High',     color: '#c2410c', bg: '#fff7ed' },
  { id: 'critical', label: 'Critical', color: '#e02424', bg: '#fde8e8' },
];

const STATUSES = [
  { id: 'open',         label: 'Open',         color: '#1a56db', bg: '#e8f0fe' },
  { id: 'acknowledged', label: 'Acknowledged', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'in_progress',  label: 'In Progress',  color: '#c27803', bg: '#fef3c7' },
  { id: 'resolved',     label: 'Resolved',     color: '#057a55', bg: '#def7ec' },
  { id: 'rejected',     label: 'Rejected',     color: '#e02424', bg: '#fde8e8' },
];

function getSev(id) {
  return SEVERITIES.find(s => s.id === id) || { label: id, color: '#6b7280', bg: '#f3f4f6' };
}
function getStat(id) {
  return STATUSES.find(s => s.id === id) || { label: id, color: '#6b7280', bg: '#f3f4f6' };
}
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
  return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue]       = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const viewed = sessionStorage.getItem(`viewed_${id}`);
    if (!viewed) {
      sessionStorage.setItem(`viewed_${id}`, 'true');
      fetchIssue();
    } else {
      fetchIssueNoView();
    }
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch issue and increase view count
  const fetchIssue = async () => {
    try {
      const res = await issuesAPI.getById(id);
      setIssue(res.data);
    } catch (err) {
      setError('Issue not found');
    } finally {
      setLoading(false);
    }
  };

  // Fetch issue without increasing view count
  const fetchIssueNoView = async () => {
    try {
      const res = await issuesAPI.getById(id);
      setIssue(res.data);
    } catch (err) {
      setError('Issue not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentsAPI.getByIssue(id);
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Upvote issue
  const handleVote = async () => {
    try {
      await issuesAPI.vote(id);
      fetchIssueNoView();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete issue
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await issuesAPI.delete(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete issue. Try again.');
    }
  };

  // Add comment
  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      await commentsAPI.create({ issue_id: id, content: newComment });
      setNewComment('');
      fetchComments();
      fetchIssueNoView();
    } catch (err) {
      console.error(err);
    }
  };

  // Update status (admin/moderator)
  const handleStatusUpdate = async (newStatus) => {
    try {
      await issuesAPI.update(id, { status: newStatus });
      fetchIssueNoView();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '16px' }}>
      Loading issue...
    </div>
  );

  if (error || !issue) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#e02424', fontSize: '16px' }}>
      {error || 'Issue not found'}
      <br />
      <button onClick={() => navigate('/')}
        style={{ marginTop: '16px', padding: '8px 20px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
        Back to Feed
      </button>
    </div>
  );

  const sev  = getSev(issue.severity);
  const stat = getStat(issue.status);

  // Check if current user can delete
  const canDelete = user && (
    Number(user.id) === Number(issue.reported_by) ||
    user.role === 'admin' ||
    user.role === 'moderator'
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Back Button */}
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#1a56db', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Feed
        </button>

        {/* Issue Card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px', marginBottom: '20px' }}>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: sev.bg, color: sev.color }}>
              {sev.label}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: stat.bg, color: stat.color }}>
              {stat.label}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#f3f4f6', color: '#374151' }}>
              {issue.category}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px', lineHeight: '1.3', color: '#111827' }}>
            {issue.title}
          </h1>

          {/* Description */}
          <p style={{ fontSize: '14.5px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' }}>
            {issue.description}
          </p>

          {/* Image */}
          {issue.image_url && (
            <img
              src={`http://localhost:5000${issue.image_url}`}
              alt="Issue"
              style={{ width: '100%', borderRadius: '10px', marginBottom: '20px', maxHeight: '400px', objectFit: 'cover' }}
            />
          )}

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              ['📍 Location', issue.location],
              ['👤 Reporter', issue.reporter_name],
              ['📅 Date', new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
              ['👁 Views', issue.views],
              ['👍 Upvotes', issue.upvote_count],
              ['💬 Comments', issue.comment_count],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#f8faff', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '3px' }}>{k}</div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Upvote */}
            <button onClick={handleVote}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e8f0fe', color: '#1a56db', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
              👍 Upvote ({issue.upvote_count})
            </button>

            {/* Delete - only for owner or admin */}
            {canDelete && (
              <button onClick={handleDelete}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fde8e8', color: '#e02424', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                🗑️ Delete Issue
              </button>
            )}
          </div>

          {/* Admin Status Update */}
          {user && (user.role === 'admin' || user.role === 'moderator') && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#92400e' }}>
                🛡️ Update Issue Status
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s.id} onClick={() => handleStatusUpdate(s.id)}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: issue.status === s.id ? s.color : '#fff', color: issue.status === s.id ? '#fff' : s.color, fontWeight: '600', fontSize: '12px', cursor: 'pointer', border: `1px solid ${s.color}` }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '16px', color: '#111827' }}>
          💬 Comments ({comments.length})
        </h2>

        {/* Comment List */}
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            No comments yet. Be the first to comment!
          </div>
        )}

        {comments.map(c => (
          <div key={c.id}
            style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '12px', borderLeft: c.is_official ? '4px solid #1a56db' : '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.is_official ? '#1a56db' : '#f3f4f6', color: c.is_official ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                  {c.author_name[0].toUpperCase()}
                </div>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{c.author_name}</span>
                  {c.is_official && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', background: '#1a56db', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>
                      OFFICIAL
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{timeAgo(c.createdAt)}</span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#374151', lineHeight: '1.6' }}>
              {c.content}
            </p>
          </div>
        ))}

        {/* Add Comment */}
        {user ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#111827' }}>
              Add a comment
            </div>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts or updates..."
              rows={3}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', outline: 'none', color: '#111827' }}
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              style={{ marginTop: '10px', padding: '9px 22px', background: newComment.trim() ? '#1a56db' : '#93c5fd', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: newComment.trim() ? 'pointer' : 'not-allowed' }}>
              Post Comment
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ marginBottom: '12px', fontSize: '14px' }}>Login to comment on this issue</p>
            <button onClick={() => navigate('/login')}
              style={{ padding: '8px 20px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}