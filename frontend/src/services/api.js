import axios from 'axios';
import { getTokenFromLocalStorage } from '../utils/tokenUtil';

const apiBaseUrl ='http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Intercepteur pour les requêtes SORTANTES
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromLocalStorage();
    
    if (token) {
      // On ajoute le token dans les headers 🔐
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses ENTRANTES
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
