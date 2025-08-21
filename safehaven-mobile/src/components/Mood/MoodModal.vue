<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>How are you feeling?</h2>
      
      <div class="mood-grid">
        <button
          v-for="mood in moods"
          :key="mood.value"
          class="mood-option"
          :class="{ selected: selectedMood === mood.value }"
          @click="selectMood(mood.value)"
        >
          <span class="mood-emoji">{{ mood.emoji }}</span>
          <span class="mood-label">{{ mood.label }}</span>
        </button>
      </div>

      <div class="notes-section">
        <label>Notes (optional)</label>
                  <textarea
            v-model="moodNote"
            placeholder="What makes you feel this way?"
            rows="3"
          ></textarea>
      </div>

      <div class="modal-actions">
                  <button class="cancel-btn" @click="closeModal">
            Cancel
          </button>
                  <button
            class="save-btn"
            @click="saveMood"
            :disabled="!selectedMood"
          >
            Save
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Reactive
const selectedMood = ref('')
const moodNote = ref('')

// Mood options
const moods = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'angry', emoji: '😠', label: 'Angry' }
]

// Methods
const selectMood = (mood) => {
  selectedMood.value = mood
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const saveMood = () => {
  if (!selectedMood.value) return
  
  emit('save', {
    moodType: selectedMood.value,
    description: moodNote.value || ''
  })
  
  resetForm()
}

const resetForm = () => {
  selectedMood.value = ''
  moodNote.value = ''
}

// Watch for modal close to reset form
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  width: 100%;
  background: white;
  padding: 24px;
  padding-bottom: 120px;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  animation: slideUp 0.3s ease;
}

.modal-content h2 {
  color: var(--text-primary);
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
  margin-bottom: 24px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: var(--background);
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  
  transition: all 0.2s ease;
}



.mood-option.selected {
  background-color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(124, 126, 115, 0.2);
}

.mood-option .mood-emoji {
  font-size: 24px;
}

.mood-option .mood-label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.notes-section {
  margin-bottom: 24px;
}

.notes-section label {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.notes-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(124, 126, 115, 0.2);
  border-radius: var(--border-radius);
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  font-size: 14px;
  background-color: var(--background);
  transition: all 0.2s ease;
}

.notes-section textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(107, 138, 130, 0.2);
  
  border-color: var(--primary);
  background-color: white;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: var(--secondary);
  color: var(--text-primary);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 14px;
  
  transition: all 0.2s ease;
}



.save-btn {
  flex: 1;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 14px;
  
  transition: all 0.2s ease;
}



.save-btn:disabled {
  background-color: var(--text-secondary);

  transform: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@media (max-width: 480px) {
  .mood-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
