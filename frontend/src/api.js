import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '⚠️ VITE_API_URL not set — falling back to ' + baseURL +
    '\n   Add VITE_API_URL to frontend/.env (local) or Vercel env vars (prod).'
  );
}

const API = axios.create({ baseURL });
const PartnerAPI = axios.create({ baseURL });

// Admin token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Partner token
PartnerAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('partnerToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401s
API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

PartnerAPI.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/partner')) {
      localStorage.removeItem('partnerToken');
      window.location.href = '/partner/login';
    }
    return Promise.reject(err);
  }
);

export { API, PartnerAPI };
export default API;