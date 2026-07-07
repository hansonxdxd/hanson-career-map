import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return '發生錯誤,請再試一次。';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}

// Public
export const getContent = () => api.get('/content').then((r) => r.data);

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);

// Protected content
export const updateContent = (content) =>
  api.put('/content', { content }).then((r) => r.data);

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export default api;
