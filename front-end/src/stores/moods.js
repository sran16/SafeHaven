import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'
import { getApiUrl, getAuthHeaders } from '../utils/api'

export const useMoodStore = defineStore('mood', {
  state: () => ({
    moods: [],
    todayMood: null,
    loading: false,
    error: null
  }),

  actions: {
    async createMood(moodData) {
      try {
        this.loading = true
        const authStore = useAuthStore()
        
        if (!authStore.user?.id) {
          throw new Error('Utilisateur non connecté')
        }
        
        console.log('Création d\'une nouvelle humeur:', {
          ...moodData,
          userId: authStore.user.id
        })

        const apiUrl = getApiUrl();
        console.log('URL complète pour createMood:', `${apiUrl}/api/moods`);
        
        const response = await axios.post(`${apiUrl}/api/moods`, {
          ...moodData,
          userId: authStore.user.id
        }, getAuthHeaders())

        console.log('Réponse de création d\'humeur:', response.data)
        
        if (response.data.success) {
          await this.fetchMoods()
          return response.data
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'humeur:', error)
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMoods() {
      try {
        this.loading = true
        const authStore = useAuthStore()
        
        if (!authStore.user?.id) {
          throw new Error('Utilisateur non connecté')
        }
        
        console.log('Récupération des humeurs pour l\'utilisateur:', authStore.user.id)

        const apiUrl = getApiUrl();
        console.log('URL complète pour fetchMoods:', `${apiUrl}/api/moods`);
        
        const response = await axios.get(`${apiUrl}/api/moods`, getAuthHeaders())
        console.log('Humeurs reçues:', response.data)
        
        if (response.data.success) {
          this.moods = response.data.data || []
          this.updateTodayMood()
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des humeurs:', error)
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    updateTodayMood() {
      const today = new Date().toDateString()
      this.todayMood = this.moods.find(mood => {
        const moodDate = new Date(mood.dateRegistration).toDateString()
        return moodDate === today
      })
      console.log('Humeur du jour mise à jour:', this.todayMood)
    }
  }
}) 