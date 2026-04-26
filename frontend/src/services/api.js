import axios from 'axios';
import { getTokenFromLocalStorage } from '../utils/tokenUtil'; // Importe ta fonction corrigée

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Doit correspondre au port du serveur
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

// Intercepteur pour les réponses ENTRANTES (Optionnel mais recommandé)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si le serveur dit "Non autorisé" (401), on peut déconnecter l'utilisateur
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
