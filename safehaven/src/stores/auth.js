import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed } from 'vue'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
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

  // Fonction utilitaire pour obtenir l'URL de l'API sans slash final
  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL.endsWith('/') 
      ? import.meta.env.VITE_API_URL.slice(0, -1) 
      : import.meta.env.VITE_API_URL;
  };

  const login = async (name, password) => {
    try {
      console.log('Tentative de connexion avec:', { name });
      
      const apiUrl = getApiUrl();
      
      const response = await axios.post(`${apiUrl}/api/users/login`, {
        name,
        password
      })
      
      console.log('Réponse de connexion:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        console.log('Données utilisateur:', userData);
        console.log('Token:', token);
        
        setToken(token)
        setUser({
          id: userData.id_user,
          name: userData.name
        })
        
        router.push('/home')
        return { success: true }
      } else {
        return {
          success: false,
          error: response.data.message
        }
      }
    } catch (error) {
      console.error('Erreur de connexion détaillée:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      console.log('Tentative d\'inscription avec:', { name, email });
      
      const apiUrl = getApiUrl();
      
      const response = await axios.post(`${apiUrl}/api/users/register`, {
        name,
        email,
        password
      })
      
      console.log('Réponse d\'inscription:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        console.log('Données utilisateur:', userData);
        console.log('Token:', token);
        
        setToken(token)
        setUser({
          id: userData.id_user,
          name: userData.name
        })
        
        router.push('/home')
        return { success: true }
      }
      
      return {
        success: false,
        error: response.data.message
      }
    } catch (error) {
      console.error('Erreur d\'inscription détaillée:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur d\'inscription'
      }
    }
  }

  const logout = async () => {
    try {
      const apiUrl = getApiUrl();
      await axios.post(`${apiUrl}/api/users/logout`)
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
      const response = await axios.get(`${apiUrl}/api/users/profile`)
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
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
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
    login,
    register,
    logout,
    fetchUser
  }
}) 