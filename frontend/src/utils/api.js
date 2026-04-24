import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({ baseURL: API_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nrityakala_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMudras = () => api.get('/api/mudras');
export const getMudra = (id) => api.get(`/api/mudras/${id}`);

export const savePracticeLog = (data) => api.post('/api/practice', data);
export const getPracticeHistory = (page = 1) => api.get(`/api/practice/history?page=${page}`);
export const getPracticeStats = () => api.get('/api/practice/stats');

export const getUserProfile = () => api.get('/api/user/profile');
export const updateUserProfile = (data) => api.put('/api/user/profile', data);
