import { Capacitor } from '@capacitor/core'
import { isTokenValid, tokenWillExpireSoon } from './tokenValidator'

export const isIOSEnvironment = () => {
  return Capacitor.getPlatform() === 'ios'
}

export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://safehaven-hy8s.onrender.com"

  // iOS simulator fix pour localhost
  if (isIOSEnvironment() && /localhost|127\.0\.0\.1/.test(apiUrl)) {
    return "http://127.0.0.1:3000"
  }

  return apiUrl
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  
  // Validation mobile-friendly avec nettoyage auto
  if (token && !isTokenValid(token)) {
    // Nettoyage silencieux sans redirection
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('Token expiré - nettoyage automatique mobile')
  }
  
  // Warning si expiration proche (pour UX mobile)
  if (token && tokenWillExpireSoon(token)) {
    console.warn('Token expire bientôt - session mobile longue recommandée')
  }
  
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }
}