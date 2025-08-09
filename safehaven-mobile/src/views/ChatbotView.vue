<template>
<div class="chatbot-bg">
    <div class="chat-header">
      <h1 class="welcome-title">Hello user</h1>
      <p class="welcome-message">Take a breath. I'm here with you.</p>
    </div>

    <!-- Zone de chat -->
    <div class="chat-messages" ref="chatWindow">
      <!-- Messages dynamiques -->
      <template v-for="(message, index) in messages" :key="index">
        <Ia v-if="message.sender === 'bot'" :message="message.text" />
        <User v-else :message="message.text" :username="getUserName()" />
      </template>
    </div>

    <!-- Zone de saisie -->
    <div class="input-container">
      <input 
        v-model="newMessage" 
        type="text" 
        placeholder="Express your feelings..."
        class="message-input"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage" class="send-button">
        <img :src="sendIcon" alt="Send" class="send-icon" />
      </button>
    </div>
</div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import Ia from '../components/Chat/Ia.vue'
import User from '../components/Chat/User.vue'
import sendIcon from '../assets/Icons/chat/btn send.svg'

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
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Vous devez être connecté pour utiliser le chat')
    }

    const userStr = localStorage.getItem('user')
    console.log('Données utilisateur brutes:', userStr)
    
    if (!userStr) {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }

    let user
    try {
      user = JSON.parse(userStr)
      console.log('Données utilisateur parsées:', user)
    } catch (e) {
      throw new Error('Erreur de session, veuillez vous reconnecter')
    }
    
    if (!user || !user.id) {
      throw new Error('Session invalide, veuillez vous reconnecter')
    }

    const apiUrl = getApiUrl();
    
    // Envoyer le message directement
    // Le middleware d'authentification sur le backend extraira l'identifiant utilisateur du token
    console.log('URL complète pour chat message:', `${apiUrl}/api/chat/message`);
    
    // Envoyer le message
    const response = await axios.post(`${apiUrl}/api/chat/message`, 
      { message: messageText },
      getAuthHeaders()
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
      text: error.message || 'Désolé, une erreur est survenue. Veuillez réessayer.',
      sender: 'bot',
      timestamp: new Date()
    })
  } finally {
    isProcessing.value = false
  }
}

const getUserName = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.name || user.username || 'Utilisateur'
    } catch (e) {
      console.error('Erreur lors de la récupération du nom d\'utilisateur:', e)
      return 'Utilisateur'
    }
  }
  return 'Utilisateur'
}

onMounted(async () => {
  if (messageInput.value) {
    messageInput.value.focus()
  }

  // Vérifier s'il y a un timestamp stocké pour une redirection
  const chatTimestamp = localStorage.getItem('chatTimestamp')
  if (chatTimestamp) {
    try {
      const apiUrl = getApiUrl()
      const response = await axios.get(`${apiUrl}/api/chat/history`, getAuthHeaders())
      
      if (response.data && response.data.success) {
        const historyText = response.data.data || ''
        if (historyText) {
          const conversations = historyText.split('---\n').filter(conv => conv.trim() !== '')
          
          // Trouver la conversation correspondant au timestamp
          const targetDate = new Date(chatTimestamp)
          const targetConversation = conversations.find(conv => {
            const lines = conv.trim().split('\n')
            const dateLine = lines.find(line => line.startsWith('Date:'))
            if (dateLine) {
              const convDate = new Date(dateLine.replace('Date:', '').trim())
              return Math.abs(convDate.getTime() - targetDate.getTime()) < 1000 // 1 seconde de tolérance
            }
            return false
          })

          if (targetConversation) {
            const lines = targetConversation.trim().split('\n')
            const userLine = lines.find(line => line.startsWith('User:'))
            const botLine = lines.find(line => line.startsWith('Bot:'))
            
            if (userLine && botLine) {
              messages.value = [
                {
                  text: userLine.replace('User:', '').trim(),
                  sender: 'user',
                  timestamp: targetDate
                },
                {
                  text: botLine.replace('Bot:', '').trim(),
                  sender: 'bot',
                  timestamp: new Date(targetDate.getTime() + 1000)
                }
              ]
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error)
    } finally {
      // Nettoyer le timestamp stocké
      localStorage.removeItem('chatTimestamp')
    }
  }
})
// Annuler le padding global quand le composant est monté
onMounted(() => {
  document.body.style.padding = '0'
  document.getElementById('app').style.padding = '0'
})

// Remettre le padding global quand le composant est démonté
onUnmounted(() => {
  document.body.style.padding = '50px 24px'
  document.getElementById('app').style.padding = ''
})
</script>

<style scoped>
.chatbot-bg {
  min-height: 100vh;
  width: 100vw;
  background: url('../assets/Bgs/ChatbotBg.svg') no-repeat center center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 40px;
}

/* Header */
.chat-header {
  padding: 24px 24px 16px 24px;
  border-radius: 0 0 20px 20px;
  margin-bottom: 16px;
}

.welcome-title {
  color: var(--Muted-Olive, #7C7E73);
  font-family: "Playfair Display";
  font-size: 40px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin: 0 0 8px 0;
}

.welcome-message {
  color: var(--Muted-Olive, #7C7E73);
  font-family: Nunito;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
}

/* Zone de messages */
.chat-messages {
  flex: 1;
  padding: 0 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

/* Zone de saisie */
.input-container {
  width: 100%;
  max-width: 90%;
  margin: 0 auto 80px auto;
  background-color: transparent;
  z-index: 1;
  display: flex;
  align-items: center;
  background: var(--light-ivory, #F6F4F0);
  border-radius: 30px;
  padding: 4px;
  border: 1px solid #E0E0E0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  font-size: 16px;
  background: transparent;
  color: var(--text-primary);
  font-family: Nunito;
}

.message-input::placeholder {
  color: rgba(124, 126, 115, 0.35);
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.send-button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
}


/* Scrollbar personnalisée */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #D0D0D0;
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #B0B0B0;
}
</style>