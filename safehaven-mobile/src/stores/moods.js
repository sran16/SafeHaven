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
        const apiUrl = getApiUrl();
        const response = await axios.post(
          `${apiUrl}/api/moods`,
          { ...moodData },
          getAuthHeaders()
        )

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
        const apiUrl = getApiUrl();
        const response = await axios.get(`${apiUrl}/api/moods`, getAuthHeaders())

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
      
    }
  }
}) 