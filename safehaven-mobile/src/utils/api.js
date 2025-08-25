import { Capacitor } from '@capacitor/core';
import { isTokenValid } from './tokenValidator';

/**
 * Détermine si l'application s'exécute dans un environnement iOS
 * @returns {boolean} Vrai si l'environnement est iOS
 */
export const isIOSEnvironment = () => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Fonction utilitaire pour obtenir l'URL de l'API sans slash final
 * @returns {string} L'URL de l'API sans slash final
 */
export const getApiUrl = () => {
  // Priorité à la variable d'environnement, sinon URL Render par défaut
  const apiUrl = import.meta.env.VITE_API_URL || "https://safehaven-hy8s.onrender.com";

  // En dev iOS uniquement, si on pointe sur localhost on remappe vers 127.0.0.1
  if (isIOSEnvironment() && /localhost|127\.0\.0\.1/.test(apiUrl)) {
    return "http://127.0.0.1:3000";
  }

  return apiUrl;
};

/**
 * Configuration par défaut pour axios
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  // Validation complète du token (format + expiration)
  if (token && !isTokenValid(token)) {
    // token invalide/expiré détecté
  }
  
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
}; 