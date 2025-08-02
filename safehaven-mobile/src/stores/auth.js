import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../router'
import axios from 'axios'
import { getApiUrl, getAuthHeaders } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  const login = async (name, password) => {
    try {
      isLoading.value = true
      error.value = null
      console.log('Tentative de connexion avec:', { name });
      
      const apiUrl = getApiUrl();
      console.log('URL API utilisée pour connexion:', apiUrl);
      
      // Effectuer la requête de connexion
      const response = await axios.post(`${apiUrl}/api/users/login`, 
        { name, password }, 
        getAuthHeaders()
      );
      
      console.log('Réponse de connexion:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        console.log('Données utilisateur:', userData);
        
        setToken(token)
        setUser({
          id: userData.id_user,
          name: userData.name
        })
        
        router.push('/home')
        return { success: true }
      } else {
        error.value = response.data.message
        return {
          success: false,
          error: response.data.message
        }
      }
    } catch (err) {
      console.error('Erreur de connexion détaillée:', err);
      error.value = err.response?.data?.message || 'Erreur de connexion'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (name, email, password) => {
    try {
      isLoading.value = true
      error.value = null
      console.log('Tentative d\'inscription avec:', { name, email });
      
      const apiUrl = getApiUrl();
      console.log('URL API utilisée pour inscription:', apiUrl);
      
      // Effectuer la requête d'inscription
      const response = await axios.post(`${apiUrl}/api/users/register`, 
        { name, email, password }, 
        getAuthHeaders()
      );
      
      console.log('Réponse d\'inscription:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        console.log('Données utilisateur:', userData);
        
        setToken(token)
        setUser({
          id: userData.id_user,
          name: userData.name
        })
        
        router.push('/home')
        return { success: true }
      } else {
        error.value = response.data.message
        return {
          success: false,
          error: response.data.message
        }
      }
    } catch (err) {
      console.error('Erreur d\'inscription détaillée:', err);
      error.value = err.response?.data?.message || 'Erreur d\'inscription'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      const apiUrl = getApiUrl();
      await axios.post(`${apiUrl}/api/users/logout`, {}, getAuthHeaders())
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      setToken(null)
      setUser(null)
      router.push('/login')
    }
  }

  const fetchUser = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/api/users/profile`, getAuthHeaders())
      setUser({
        id: response.data.id_user,
        name: response.data.name
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  // Initialisation
  if (token.value) {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      fetchUser()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser
  }
}) 