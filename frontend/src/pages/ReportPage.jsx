import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issuesAPI } from '../utils/api';

export default function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    severity: 'medium', location: '', city: '', is_anonymous: false,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '64px' }}>🔐</div>
        <h2 style={{ fontWeight: '800' }}>Login Required</h2>
        <p style={{ color: '#6b7280' }}>Please login to report an issue</p>
        <button onClick={() => navigate('/login')}
          style={{ padding: '10px 24px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Login Now
        </button>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '64px' }}>✅</div>
        <h2 style={{ fontWeight: '800', color: '#057a55' }}>Issue Reported!</h2>
        <p style={{ color: '#6b7280' }}>Your issue has been submitted successfully!</p>
        <button onClick={() => navigate('/')}
          style={{ padding: '10px 24px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Back to Feed
        </button>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);
      await issuesAPI.create(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', padding: '24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>📝 Report an Issue</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Help improve your community by reporting civic problems</p>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#fde8e8', color: '#e02424', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Title <span style={{ color: 'red' }}>*</span></label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief description of the issue" required style={inp} />
              </div>

              <div>
                <label style={lbl}>Category <span style={{ color: 'red' }}>*</span></label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={inp}>
                  <option value="">Select category</option>
                  {[['roads','🛣️ Roads'],['water','💧 Water'],['electricity','⚡ Electricity'],['garbage','🗑️ Garbage'],['sanitation','🚿 Sanitation'],['parks','🌳 Parks'],['lights','💡 Street Lights'],['drainage','🌊 Drainage'],['buildings','🏛️ Buildings'],['other','📌 Other']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Severity <span style={{ color: 'red' }}>*</span></label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={inp}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Description <span style={{ color: 'red' }}>*</span></label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue in detail..." required rows={5} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div>
                <label style={lbl}>Address / Landmark <span style={{ color: 'red' }}>*</span></label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Near bus stand, MG Road" required style={inp} />
              </div>

              <div>
                <label style={lbl}>City</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="City name" style={inp} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Photo (optional)</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={inp} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="anon" checked={form.is_anonymous}
                  onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} />
                <label htmlFor="anon" style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
                  Report anonymously
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => navigate('/')}
                  style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  style={{ padding: '10px 24px', background: loading ? '#93c5fd' : '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Submitting...' : '🚀 Submit Issue'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#374151' };
const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };