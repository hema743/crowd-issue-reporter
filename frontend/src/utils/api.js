import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Auto attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

// ─── AUTH ────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  me:       ()     => API.get('/auth/me'),
  update:   (data) => API.put('/auth/profile', data),
};

// ─── ISSUES ──────────────────────────────────
export const issuesAPI = {
  getAll:  (params) => API.get('/issues', { params }),
  getById: (id)     => API.get(`/issues/${id}`),
  create:  (data)   => API.post('/issues', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:  (id, data) => API.put(`/issues/${id}`, data),
  delete:  (id)       => API.delete(`/issues/${id}`),
  vote:    (id)       => API.post(`/issues/${id}/vote`),
};

// ─── COMMENTS ────────────────────────────────
export const commentsAPI = {
  getByIssue: (id)   => API.get(`/comments/issue/${id}`),
  create:     (data) => API.post('/comments', data),
  delete:     (id)   => API.delete(`/comments/${id}`),
};

// ─── STATS ───────────────────────────────────
export const statsAPI = {
  get: () => API.get('/stats'),
};

export default API;