import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

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

// Public content
export const getContent = () => api.get('/content').then((r) => r.data);
export const getProfileBySlug = (slug) => api.get(`/profiles/${slug}`).then((r) => r.data);

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);

// Profile management (protected)
export const listProfiles = () => api.get('/profiles').then((r) => r.data);
export const adminGetProfile = (slug) => api.get(`/admin/profiles/${slug}`).then((r) => r.data);
export const createProfile = (payload) => api.post('/profiles', payload).then((r) => r.data);
export const updateProfileContent = (slug, content) =>
  api.put(`/profiles/${slug}`, { content }).then((r) => r.data);
export const updateProfileMeta = (slug, meta) =>
  api.patch(`/profiles/${slug}`, meta).then((r) => r.data);
export const deleteProfile = (slug) => api.delete(`/profiles/${slug}`).then((r) => r.data);
export const resetProfile = (slug) => api.post(`/profiles/${slug}/reset`).then((r) => r.data);

// Upload
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
