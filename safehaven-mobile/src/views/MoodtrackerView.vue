<template>
  <div class="mood-tracker">

    <!-- Section principale -->
    <div class="main-content">
      <!-- Salutation et bouton -->
      <MoodGreeting 
        @openModal="showMoodModal = true"
      />

      <!-- Sélecteur de date -->
      <DateSelector 
        :selectedDate="selectedDay"
        @dateSelected="handleDateSelected"
      />

      <!-- Humeur du jour -->
      <MoodOfDay :mood="selectedDateMood" />

      <!-- Séparation -->
      <div class="separator"></div>

      <!-- Historique -->
      <HistorySection :moods="moodHistory" />
    </div>

    <!-- Modal pour enregistrer l'humeur -->
    <MoodModal 
      :isOpen="showMoodModal"
      @close="showMoodModal = false"
      @save="handleSaveMood"
    />


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMoodStore } from '../stores/moods'

import {
  MoodGreeting,
  DateSelector,
  MoodOfDay,
  HistorySection,
  MoodModal
} from '../components/Mood'

// Store
const moodStore = useMoodStore()

// Reactive
const showMoodModal = ref(false)
const selectedDay = ref(new Date().getDate().toString().padStart(2, '0'))

// Computed
const moodHistory = computed(() => moodStore.moods)

// Computed pour l'humeur de la date sélectionnée
const selectedDateMood = computed(() => {
  const selectedDate = new Date()
  selectedDate.setDate(selectedDate.getDate() + (parseInt(selectedDay.value) - selectedDate.getDate()))
  
  return moodStore.moods.find(mood => {
    const moodDate = new Date(mood.dateRegistration)
    return moodDate.toDateString() === selectedDate.toDateString()
  }) || null
})

// Methods
const handleDateSelected = (date) => {
  selectedDay.value = date
}



const handleSaveMood = async (moodData) => {
  try {
    await moodStore.createMood(moodData)
    showMoodModal.value = false
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'humeur:', error)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await moodStore.fetchMoods()
  } catch (error) {
    console.error('Erreur lors du chargement des humeurs:', error)
  }
})
</script>

<style scoped>
.mood-tracker {
  min-height: 100vh;
  background-color: var(--background);
  padding-bottom: 100px; 
}

.main-content {
  padding: 50px 24px 0 24px;
}

.separator {
  width: 278px;
  height: 0.5px;
  background: #7C7E73;
  margin: 32px auto;
}

</style>