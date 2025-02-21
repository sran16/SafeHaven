<template>
  <div class="chatbot-container">
    <header class="header">
      <h1>Assistant IA</h1>
    </header>

    <div class="chat-window" ref="chatWindow">
      <div v-if="messages.length === 0" class="welcome-message">
        <h2>👋 Bonjour !</h2>
        <p>Je suis votre assistant personnel. Je suis là pour vous écouter et vous aider à gérer vos émotions.</p>
        <p>Comment puis-je vous aider aujourd'hui ?</p>
      </div>

      <div v-else class="messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.sender === 'user' ? 'user-message' : 'bot-message']"
        >
          <div class="message-content">
            <p>{{ message.text }}</p>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="message-form">
      <textarea
        v-model="newMessage"
        placeholder="Écrivez votre message..."
        @keydown.enter.prevent="sendMessage"
        :disabled="isProcessing"
        rows="1"
        ref="messageInput"
      ></textarea>
      <button type="submit" :disabled="!newMessage.trim() || isProcessing">
        <span v-if="!isProcessing">Envoyer</span>
        <span v-else>...</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'

const messages = ref([])
const newMessage = ref('')
const isProcessing = ref(false)
const chatWindow = ref(null)
const messageInput = ref(null)

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatWindow.value) {
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight
  }
}

const sendMessage = async () => {
  const messageText = newMessage.value.trim()
  if (!messageText || isProcessing.value) return

  const userMessage = {
    text: messageText,
    sender: 'user',
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  newMessage.value = ''
  await scrollToBottom()

  isProcessing.value = true

  try {
    const userStr = localStorage.getItem('user')
    console.log('Données utilisateur brutes:', userStr)
    
    if (!userStr) {
      throw new Error('Aucune donnée utilisateur trouvée')
    }

    const user = JSON.parse(userStr)
    console.log('Données utilisateur parsées:', user)
    
    const userId = user.id_user
    console.log('ID utilisateur:', userId)
    
    if (!userId) {
      throw new Error('ID utilisateur non trouvé')
    }

    const token = localStorage.getItem('token')
    console.log('Token présent:', !!token)

    const response = await axios.post('http://localhost:3000/api/chat/message', 
      { message: messageText, userId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Réponse du serveur:', response.data)
    
    const botMessage = {
      text: response.data.data?.response || 'Désolé, je n\'ai pas compris votre message.',
      sender: 'bot',
      timestamp: new Date()
    }

    messages.value.push(botMessage)
    await scrollToBottom()
  } catch (error) {
    console.error('Erreur complète:', error)
    messages.value.push({
      text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
      sender: 'bot',
      timestamp: new Date()
    })
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  if (messageInput.value) {
    messageInput.value.focus()
  }
})
</script>

<style scoped>
.chatbot-container {
  max-width: 800px;
  margin: 0 auto;
  height: 89vh;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

.header {
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  background: white;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xs);
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: var(--spacing-xs) 0;
}

.welcome-message {
  text-align: center;
  padding: var(--spacing-sm);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: var(--spacing-xs);
}

.welcome-message h2 {
  margin-bottom: var(--spacing-xs);
  font-size: 1.2rem;
}

.welcome-message p {
  margin-bottom: var(--spacing-xs);
  font-size: 0.95rem;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.message {
  max-width: 80%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  position: relative;
  margin-bottom: var(--spacing-sm);
}

.user-message {
  align-self: flex-end;
  background-color: #4CAF50;
  color: white;
}

.bot-message {
  align-self: flex-start;
  background-color: white;
  color: #333;
}

.message-content {
  position: relative;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  position: absolute;
  bottom: -1.2rem;
  right: 0;
}

.message-form {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
  margin-top: auto;
}

textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  min-height: 40px;
  max-height: 80px;
}

button {
  padding: 0 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 