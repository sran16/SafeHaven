/**
 * Fonction utilitaire pour obtenir l'URL de l'API sans slash final
 * @returns {string} L'URL de l'API sans slash final
 */
export const getApiUrl = () => {
  // Utiliser l'URL de l'environnement ou localhost par défaut
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  console.log('API URL utilisée:', apiUrl);
  return apiUrl;
};

/**
 * Configuration par défaut pour axios
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token récupéré:', token ? 'Token présent' : 'Token absent');
  
  const headers = {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
  
  console.log('En-têtes utilisés:', headers);
  return headers;
}; 