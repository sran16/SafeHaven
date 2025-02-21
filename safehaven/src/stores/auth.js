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

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      })
      
      if (response.data.success) {
        setToken(response.data.token)
        setUser({
          id: response.data.user.id_user,
          name: response.data.user.name,
          email: response.data.user.email
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
      console.error('Erreur de connexion:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password
      })
      
      if (response.data.success) {
        // Optionnel : connecter automatiquement l'utilisateur après l'inscription
        return login(email, password)
      } else {
        return {
          success: false,
          error: response.data.message
        }
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur d\'inscription'
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/me')
      setUser({
        id: response.data.id_user,
        name: response.data.name,
        email: response.data.email
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