<template>
  <div class="date-selector">
    <div 
      v-for="(day, index) in weekDays" 
      :key="index"
      class="day-item"
      :class="{ active: selectedDay === day.date }"
      @click="selectDay(day.date)"
    >
      <span class="day-letter">{{ day.letter }}</span>
      <span class="day-number">{{ day.date }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  selectedDate: {
    type: String,
    default: () => new Date().getDate().toString().padStart(2, '0')
  }
})

// Emits
const emit = defineEmits(['dateSelected'])

// Reactive
const selectedDay = ref(props.selectedDate)

// Computed
const weekDays = computed(() => {
  const today = new Date()
  const days = []
  
  for (let i = -3; i <= 3; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    days.push({
      letter: date.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase(),
      date: date.getDate().toString().padStart(2, '0')
    })
  }
  
  return days
})

// Methods
const selectDay = (date) => {
  selectedDay.value = date
  emit('dateSelected', date)
}
</script>

<style scoped>
.date-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 8px;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  
  transition: all 0.2s ease;
  min-width: 40px;
}

.day-item.active {
  background: var(--test-post, linear-gradient(0deg, #9C9D93 -23.87%, rgba(201, 200, 194, 0.62) 41.39%, #F6F4F0 106.65%));
  border-radius: 5px;
}

.day-letter {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.day-number {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.day-item.active .day-letter,
.day-item.active .day-number {
  color: var(--primary);
}
</style>
