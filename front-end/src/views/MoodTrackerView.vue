<template>
  <div class="mood-tracker-container">
    <header class="header">
      <h1>Suivi d'humeur</h1>
      <button class="add-mood-btn" @click="showAddMoodModal = true">
        + Ajouter une humeur
      </button>
    </header>

    <div class="mood-stats">
      <div class="mood-stat-card">
        <h3>Humeur du jour</h3>
        <div class="current-mood" v-if="todayMood">
          <span class="mood-emoji">{{ getMoodEmoji(todayMood.moodType) }}</span>
          <p>{{ getMoodLabel(todayMood.moodType) }}</p>
        </div>
        <p v-else>Pas encore enregistrée</p>
      </div>
    </div>

    <div class="mood-history">
      <h2>Historique</h2>
      <div class="mood-calendar">
        <div v-for="month in last3Months" :key="month" class="month-section">
          <h3>{{ formatMonth(month) }}</h3>
          <div class="days-grid">
            <div
              v-for="day in getDaysInMonth(month)"
              :key="day"
              class="day-cell"
              :class="{ 'has-mood': hasMood(month, day) }"
            >
              <span class="day-number">{{ day }}</span>
              <span v-if="hasMood(month, day)" class="mood-indicator">
                {{ getMoodEmoji(getMood(month, day).moodType) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout d'humeur -->
    <div v-if="showAddMoodModal" class="modal">
      <div class="modal-content">
        <h2>Comment vous sentez-vous ?</h2>
        <div class="mood-selector">
          <button
            v-for="mood in moods"
            :key="mood.value"
            class="mood-button"
            :class="{ active: selectedMood === mood.value }"
            @click="selectedMood = mood.value"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-label">{{ mood.label }}</span>
          </button>
        </div>

        <div class="form-group">
          <label>Notes (optionnel)</label>
          <textarea
            v-model="moodNote"
            placeholder="Qu'est-ce qui vous fait ressentir cela ?"
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button class="cancel-btn" @click="showAddMoodModal = false">
            Annuler
          </button>
          <button
            class="save-btn"
            @click="saveMood"
            :disabled="!selectedMood"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useMoodStore } from '../stores/moods'

const showAddMoodModal = ref(false)
const selectedMood = ref('')
const moodNote = ref('')
const moodStore = useMoodStore()

const moods = [
  { value: 'happy', emoji: '😊', label: 'Heureux' },
  { value: 'calm', emoji: '😌', label: 'Calme' },
  { value: 'neutral', emoji: '😐', label: 'Neutre' },
  { value: 'anxious', emoji: '😰', label: 'Anxieux' },
  { value: 'sad', emoji: '😢', label: 'Triste' },
  { value: 'angry', emoji: '😠', label: 'En colère' }
]

const getMoodEmoji = (mood) => {
  return moods.find(m => m.value === mood)?.emoji || '❓'
}

const getMoodLabel = (mood) => {
  return moods.find(m => m.value === mood)?.label || 'Inconnu'
}

const formatMonth = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

const last3Months = (() => {
  const months = []
  const now = new Date()
  for (let i = 0; i < 3; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(month)
  }
  return months
})()

const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const hasMood = (month, day) => {
  const date = new Date(month.getFullYear(), month.getMonth(), day)
  return moodStore.moods.some(mood => {
    const moodDate = new Date(mood.dateRegistration)
    return moodDate.toDateString() === date.toDateString()
  })
}

const getMood = (month, day) => {
  const date = new Date(month.getFullYear(), month.getMonth(), day)
  return moodStore.moods.find(mood => {
    const moodDate = new Date(mood.dateRegistration)
    return moodDate.toDateString() === date.toDateString()
  })
}

const saveMood = async () => {
  try {
    if (!selectedMood.value) {
      console.error('Aucune humeur sélectionnée')
      return
    }

    // Vérifier si le type d'humeur est valide
    const validMoodTypes = ['happy', 'calm', 'neutral', 'anxious', 'sad', 'angry']
    if (!validMoodTypes.includes(selectedMood.value)) {
      console.error('Type d\'humeur invalide:', selectedMood.value)
      return
    }

    const moodData = {
      moodType: selectedMood.value,
      description: moodNote.value || ''
    }

    console.log('Données de l\'humeur à envoyer:', JSON.stringify(moodData, null, 2))

    await moodStore.createMood(moodData)
    showAddMoodModal.value = false
    selectedMood.value = ''
    moodNote.value = ''
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'humeur:', error)
  }
}

onMounted(async () => {
  try {
    await moodStore.fetchMoods()
  } catch (error) {
    console.error('Erreur lors du chargement des humeurs:', error)
  }
})

const moodHistory = computed(() => moodStore.moods)
const todayMood = computed(() => moodStore.todayMood)
</script>

<style scoped>
.mood-tracker-container {
  padding: var(--spacing-md);
  min-height: calc(100vh - 60px); /* Ajustement pour la barre de navigation */
  background-color: var(--background-soft);
  max-width: 100%;
  overflow-x: hidden;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-soft);
}

.header h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.add-mood-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: var(--transition-fast);
}

.add-mood-btn:hover {
  background-color: #6b8a83;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.mood-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.mood-stat-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-soft);
}

.mood-stat-card h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: 1.1rem;
}

.current-mood {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--background-soft);
  border-radius: var(--border-radius-md);
}

.mood-emoji {
  font-size: 2rem;
}

.mood-history {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-soft);
  margin-bottom: 70px; /* Espace pour la navigation */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mood-history h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: 1.3rem;
}

.month-section {
  margin-bottom: var(--spacing-xl);
}

.month-section h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: 1.1rem;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--secondary-color);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(40px, 1fr));
  gap: 4px;
  min-width: 280px;
}

.day-cell {
  aspect-ratio: 1;
  background: var(--background-soft);
  border-radius: var(--border-radius-sm);
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  min-width: 36px;
  min-height: 36px;
}

.day-cell.has-mood {
  background-color: white;
  box-shadow: var(--shadow-soft);
}

.day-cell.has-mood:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.day-number {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.mood-indicator {
  font-size: 1.2rem;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

.modal-content {
  width: 100%;
  background: white;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  animation: slideUp var(--transition-normal);
}

.modal-content h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  text-align: center;
  font-size: 1.2rem;
}

.mood-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.mood-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--background-soft);
  border: 2px solid transparent;
  border-radius: var(--border-radius-md);
  transition: var(--transition-fast);
}

.mood-button:hover {
  background-color: white;
  border-color: var(--secondary-color);
}

.mood-button.active {
  background-color: white;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-soft);
}

.mood-button .mood-emoji {
  font-size: 1.8rem;
}

.mood-button .mood-label {
  color: var(--text-primary);
  font-size: 0.8rem;
}

.form-group {
  margin-bottom: var(--spacing-sm);
}

.form-group label {
  display: block;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  font-size: 0.9rem;
}

textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: var(--transition-fast);
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(124, 154, 146, 0.1);
}

.form-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.cancel-btn {
  flex: 1;
  padding: var(--spacing-md);
  background: var(--secondary-color);
  color: var(--text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: var(--transition-fast);
}

.cancel-btn:hover {
  background-color: var(--accent-color);
}

.save-btn {
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: var(--transition-fast);
}

.save-btn:hover:not(:disabled) {
  background-color: #6b8a83;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.save-btn:disabled {
  background-color: var(--text-secondary);
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@media (max-width: 768px) {
  .mood-tracker-container {
    padding: var(--spacing-sm);
  }

  .mood-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .mood-history {
    padding: var(--spacing-sm);
  }

  .days-grid {
    grid-template-columns: repeat(7, minmax(36px, 1fr));
    gap: 2px;
  }

  .day-cell {
    padding: 2px;
    min-width: 32px;
    min-height: 32px;
  }

  .month-section {
    margin-bottom: var(--spacing-md);
  }

  .month-section h3 {
    font-size: 1rem;
    margin-bottom: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .mood-tracker-container {
    padding: var(--spacing-xs);
  }

  .header {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .header h1 {
    font-size: 1.2rem;
  }

  .mood-history {
    padding: var(--spacing-xs);
  }

  .days-grid {
    grid-template-columns: repeat(7, minmax(32px, 1fr));
    gap: 1px;
  }

  .day-cell {
    min-width: 28px;
    min-height: 28px;
  }

  .day-number {
    font-size: 0.7rem;
  }

  .mood-indicator {
    font-size: 0.9rem;
  }
}
</style> 