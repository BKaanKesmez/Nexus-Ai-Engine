import axios from 'axios';

// Backend adresi (Java portu)
const API_BASE_URL = "http://localhost:9090";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// İSTEK GİDERKEN: Token varsa ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// CEVAP GELİRKEN: Token geçersizse (403) çıkış yap
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/"; // Login ekranına at
    }
    return Promise.reject(error);
  }
);

export default api;