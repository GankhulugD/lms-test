import axios from 'axios';

// Dev дээр Vite proxy '/api'-г localhost backend руу дамжуулдаг тул харьцангуй
// зам хангалттай. Production дээр frontend (Cloudflare Pages) болон backend
// (тусдаа hosting) өөр domain дээр байрлах тул build хийх үед VITE_API_URL
// environment variable-аар бодит backend URL-ыг зааж өгнө (жиш нь:
// https://lms-backend.onrender.com/api/v1).
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

const TOKEN_KEY = 'lms_access_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // JWT 15 минутын дараа дуусдаг тул 401 үед автоматаар login хуудас руу буцаана
    if (error?.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
