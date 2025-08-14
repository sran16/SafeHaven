<template>
  <div class="history-section">
    <h2>History</h2>
    <div class="history-container">
      <div v-if="moods.length === 0" class="empty-history">
        <p>No history available</p>
      </div>
      <div v-else class="mood-list">
        <!-- Grouper par mois -->
        <div v-for="(monthGroup, monthKey) in groupedMoods" :key="monthKey" class="month-group">
          <div class="month-header">{{ formatMonth(monthKey) }}</div>
          <div v-for="mood in monthGroup" :key="mood.id" class="mood-item">
            <div class="mood-info">
              <span class="mood-emoji">{{ getMoodEmoji(mood.moodType) }}</span>
              <div class="mood-details">
                <p class="mood-label">{{ getMoodLabel(mood.moodType) }}</p>
                <p class="mood-date">{{ formatDate(mood.dateRegistration) }}</p>
              </div>
            </div>
            <p v-if="mood.description" class="mood-description">
              {{ mood.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  moods: {
    type: Array,
    default: () => []
  }
})

// Mood options
const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'angry', emoji: '😠', label: 'Angry' }
]

// Computed - Grouper les humeurs par mois
const groupedMoods = computed(() => {
  const groups = {}
  
  props.moods.forEach(mood => {
    const date = new Date(mood.dateRegistration)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    
    if (!groups[monthKey]) {
      groups[monthKey] = []
    }
    groups[monthKey].push(mood)
  })
  
  // Trier par mois (du plus récent au plus ancien)
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  )
})

// Methods
const getMoodEmoji = (mood) => {
  return moodOptions.find(m => m.value === mood)?.emoji || '❓'
}

const getMoodLabel = (mood) => {
  return moodOptions.find(m => m.value === mood)?.label || 'Inconnu'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatMonth = (monthKey) => {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month), 1)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.history-section {
  border-radius: var(--border-radius-lg);
  padding: 16px;
  border: 1px solid rgba(124, 126, 115, 0.1);
}

.history-section h2 {
  color: var(--Muted-Olive, #7C7E73);
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.history-container {
  max-height: 400px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.mood-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.month-group {
  border-bottom: 1px solid rgba(124, 126, 115, 0.1);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.month-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.month-header {
  color: var(--Muted-Olive, #7C7E73);
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-left: -8px;
}

.mood-item {
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  border: 1px solid rgba(124, 126, 115, 0.1);
  transition: all 0.2s ease;
}

.mood-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.mood-emoji {
  font-size: 24px;
  min-width: 32px;
  text-align: center;
}

.mood-details {
  flex: 1;
}

.mood-label {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.mood-date {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.mood-description {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
  margin: 8px 0 0 0;
  padding-left: 44px;
  font-style: italic;
}

/* Scroll personnalisé pour mobile */
.history-container::-webkit-scrollbar {
  width: 4px;
}

.history-container::-webkit-scrollbar-track {
  background: rgba(124, 126, 115, 0.1);
  border-radius: 2px;
}

.history-container::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 2px;
}

</style>
