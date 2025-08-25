<template>
  <div class="chat-tab">
    <div v-if="loading" class="loading-state">
      <p>Chargement...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="$emit('retry')">Réessayer</button>
    </div>

    <div v-else-if="!messages || messages.length === 0" class="empty-state">
      <p>Aucune conversation</p>
      <button @click="$emit('start')">Commencer à discuter</button>
    </div>

    <div v-else class="chat-sessions">
      <div v-for="group in messages" :key="group.date" class="date-group">
        <div class="date-header">
          {{ formatDate(group.date) }}
        </div>
        
        <div 
          v-for="session in group.sessions" 
          :key="session.id" 
          :class="['session-item', { active: selectedSession?.id === session.id }]" 
          @click="select(session)"
        >
          <div class="session-preview">
            <div class="session-message">
              {{ session.preview }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedSession" class="session-details">
        <div class="session-header">
          <h4>Conversation du {{ formatDate(selectedSession.date) }}</h4>
          <button class="close-session-btn" @click="selectedSession = null">
            ×
          </button>
        </div>
        
        <div class="messages-container">
          <div 
            v-for="message in selectedSession.messages" 
            :key="message.id" 
            :class="[
              'message', 
              message.isUserMessage ? 'user-message' : 'bot-message'
            ]"
          >
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  messages: Array,
  loading: Boolean,
  error: String
})
defineEmits(['retry', 'start'])

const selectedSession = ref(null)

const select = (session) => {
  selectedSession.value = session
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
<style scoped>
.chat-sessions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-group {
  border-bottom: 1px solid #ddd;
  padding-bottom: 16px;
}

.date-header {
  color: #7C7E73;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.session-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.session-item.active {
  background: #7C7E73;
  color: #fff;
}

.session-message {
  font-size: 14px;
}

.session-details {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  margin-top: 16px;
}

.session-header {
  color: #7C7E73;
  padding: 12px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-session-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  color: #7C7E73;
}

.messages-container {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 12px;
  border-radius: 12px;
}

.user-message {
  align-self: flex-end;
  background: #7C7E73;
  color: #fff;
}

.bot-message {
  align-self: flex-start;
  background: #f5f5f5;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 20px;
}

button {
  background: #7C7E73;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
}
</style>