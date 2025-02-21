import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useMoodsStore = defineStore('moods', () => {
  const moods = ref([])
  const loading = ref(false)
  const error = ref(null)

  const moodTypes = [
    { value: 'happy', emoji: '😊', label: 'Heureux' },
    { value: 'calm', emoji: '😌', label: 'Calme' },
    { value: 'neutral', emoji: '😐', label: 'Neutre' },
    { value: 'anxious', emoji: '😰', label: 'Anxieux' },
    { value: 'sad', emoji: '😢', label: 'Triste' },
    { value: 'angry', emoji: '😠', label: 'En colère' }
  ]

  const fetchMoods = async (startDate, endDate) => {
    loading.value = true
    error.value = null

    try {
      const params = {}
      if (startDate) params.startDate = startDate.toISOString()
      if (endDate) params.endDate = endDate.toISOString()

      const response = await axios.get('http://localhost:3000/api/moods', { params })
      moods.value = response.data
      return response.data
    } catch (err) {
      console.error('Erreur lors du chargement des humeurs:', err)
      error.value = 'Impossible de charger les données d\'humeur'
      return []
    } finally {
      loading.value = false
    }
  }

  const addMood = async (moodData) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('http://localhost:3000/api/moods', {
        mood: moodData.mood,
        note: moodData.note,
        date: moodData.date || new Date()
      })

      moods.value.unshift(response.data)
      return { success: true, mood: response.data }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'humeur:', err)
      error.value = 'Impossible d\'enregistrer l\'humeur'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateMood = async (moodId, moodData) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`http://localhost:3000/api/moods/${moodId}`, {
        mood: moodData.mood,
        note: moodData.note
      })

      const index = moods.value.findIndex(m => m.id === moodId)
      if (index !== -1) {
        moods.value[index] = response.data
      }

      return { success: true, mood: response.data }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'humeur:', err)
      error.value = 'Impossible de mettre à jour l\'humeur'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteMood = async (moodId) => {
    try {
      await axios.delete(`http://localhost:3000/api/moods/${moodId}`)
      moods.value = moods.value.filter(m => m.id !== moodId)
      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'humeur:', err)
      return { success: false, error: 'Impossible de supprimer l\'humeur' }
    }
  }

  const getMoodStats = async (startDate, endDate) => {
    try {
      const params = {}
      if (startDate) params.startDate = startDate.toISOString()
      if (endDate) params.endDate = endDate.toISOString()

      const response = await axios.get('http://localhost:3000/api/moods/stats', { params })
      return response.data
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      return null
    }
  }

  const getTodayMood = () => {
    const today = new Date()
    return moods.value.find(mood => {
      const moodDate = new Date(mood.date)
      return moodDate.toDateString() === today.toDateString()
    })
  }

  const getMoodByDate = (date) => {
    const targetDate = new Date(date)
    return moods.value.find(mood => {
      const moodDate = new Date(mood.date)
      return moodDate.toDateString() === targetDate.toDateString()
    })
  }

  return {
    moods,
    loading,
    error,
    moodTypes,
    fetchMoods,
    addMood,
    updateMood,
    deleteMood,
    getMoodStats,
    getTodayMood,
    getMoodByDate
  }
}) 