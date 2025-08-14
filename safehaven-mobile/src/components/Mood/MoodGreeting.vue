<template>
  <div class="greeting-section">
          <h1 class="greeting">How are you feeling today {{ username }}?</h1>
    <div class="date-section">
      <span class="date">{{ currentDate }}</span>
      <button class="log-mood-btn" @click="$emit('openModal')">
        + Log your mood
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Emits
const emit = defineEmits(['openModal'])

// Store
const authStore = useAuthStore()

// Computed
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const username = computed(() => {
  return authStore.user.name
})
</script>

<style scoped>
.greeting-section {
  margin-bottom: 32px;
}

.greeting {
color: var(--Muted-Olive, #7C7E73);
font-family: "Playfair Display";
font-size: 36px;
font-style: normal;
font-weight: 600;
line-height: normal;
margin-bottom: 16px;
}

.date-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 400;
}

.log-mood-btn {
  display: inline-flex;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: var(--Muted-Olive, #7C7E73);
  color: var(--light-ivory, #F6F4F0);
  border: none;
  border-radius: 5px;
  font-family: Nunito, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  cursor: pointer;
  transition: all 0.2s ease;
}



</style>
