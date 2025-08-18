/**
 * Utilitaire pour la validation des tokens JWT
 */

/**
 * Vérifie si un token JWT est valide (format + expiration)
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - true si le token est valide
 */
export const isTokenValid = (token) => {
  if (!token) return false
  
  try {
    // Vérifier le format JWT (3 parties séparées par des points)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Décoder et vérifier le payload
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Vérifier l'expiration (si le champ exp existe)
    return !payload.exp || payload.exp > now
  } catch (error) {
    // Token malformé ou erreur de décodage
    return false
  }
}

/**
 * Nettoie les données d'authentification du localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Obtient et valide le token courant
 * @returns {object} - { token, isValid }
 */
export const getCurrentToken = () => {
  const token = localStorage.getItem('token')
  return {
    token,
    isValid: isTokenValid(token)
  }
}
