export const isTokenValid = (token) => {
  if (!token) return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Vérification expiration avec marge mobile-friendly (5 min)
    const MOBILE_BUFFER = 5 * 60; // 5 minutes
    return !payload.exp || payload.exp > (now + MOBILE_BUFFER)
  } catch {
    return false
  }
}

// Vérifie si le token expire bientôt (dans les 2h)
export const tokenWillExpireSoon = (token) => {
  if (!token) return true
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    const twoHours = 2 * 60 * 60
    
    return payload.exp && payload.exp < (now + twoHours)
  } catch {
    return true
  }
}

export const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentToken = () => {
  const token = localStorage.getItem('token')
  return {
    token,
    isValid: isTokenValid(token)
  }
}
