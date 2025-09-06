<template>
  <div class="mood-of-day">
    <h2>Mood of the day</h2>
    <div v-if="mood" class="mood-display">
      <span class="mood-emoji">{{ getMoodEmoji(mood.moodType) }}</span>
      <p class="mood-text">{{ getMoodLabel(mood.moodType) }}</p>
    </div>
    <p v-else class="no-mood">Not saved yet</p>
  </div>
</template>

<script setup>
defineProps({
  mood: {
    type: Object,
    default: null
  }
})

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
const getMoodEmoji = (mood) => {
  return moods.find(m => m.value === mood)?.emoji || '❓'
}

const getMoodLabel = (mood) => {
  return moods.find(m => m.value === mood)?.label || 'Unknown'
}
</script>

<style scoped>
.mood-of-day {
  height: 130px;
  flex-shrink: 0;
  border-radius: 15px;
  background: var(--Muted-Olive, #7C7E73);
  margin-bottom: 32px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mood-of-day h2 {
color: var(--light-ivory, #F6F4F0);
font-family: "Playfair Display";
font-size: 24px;
font-style: normal;
font-weight: 600;
line-height: normal;
}

.mood-display {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
}

.mood-emoji {
  font-size: 28px;
}

.mood-text {
  color: var(--light-ivory, #F6F4F0);
  font-family: Nunito;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.no-mood {
  color: var(--light-ivory, #F6F4F0);
  font-family: Nunito;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  padding: 0px 16px;
}
</style>
