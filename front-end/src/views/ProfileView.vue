<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-cover"></div>
      <div class="profile-info">
        <div class="profile-avatar-container">
          <img :src="user.avatar || '/default-avatar.png'" alt="Avatar" class="profile-avatar" />
          <button class="edit-avatar-btn" @click="triggerFileInput">
            <span>📷</span>
          </button>
          <input
            type="file"
            ref="fileInput"
            @change="handleAvatarChange"
            accept="image/*"
            style="display: none"
          />
        </div>
        <div class="profile-details">
          <h1>{{ user.username }}</h1>
          <p class="member-since">Membre depuis {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ user.posts }}</span>
          <span class="stat-label">Posts</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ user.followers }}</span>
          <span class="stat-label">Abonnés</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ user.following }}</span>
          <span class="stat-label">Abonnements</span>
        </div>
      </div>
    </div>

    <div class="profile-actions">
      <button class="action-btn edit-btn" @click="showEditProfile = true">
        <span class="icon">✏️</span>
        Modifier le profil
      </button>
      <button class="action-btn settings-btn" @click="showSettings = true">
        <span class="icon">⚙️</span>
        Paramètres
      </button>
    </div>

    <div class="profile-content">
      <div class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="handleTabChange(tab.id)"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Posts -->
        <div v-if="currentTab === 'posts'" class="posts-grid">
          <div v-for="post in userPosts" :key="post.id" class="post-card">
            <img v-if="post.image" :src="post.image" :alt="post.content" class="post-image" />
            <div v-else class="post-content">{{ post.content }}</div>
          </div>
        </div>

        <!-- Mood Tracker -->
        <div v-else-if="currentTab === 'mood'" class="mood-tracker">
          <div class="mood-chart">
            <p class="placeholder-text">Graphique de suivi d'humeur à venir</p>
          </div>
        </div>

        <!-- Chat -->
        <div v-else-if="currentTab === 'chat'" class="chat-history">
          <div v-if="loadingChat" class="loading-chat">
            <div class="loading-spinner"></div>
            <p>Chargement de l'historique...</p>
          </div>
          
          <div v-else-if="chatError" class="chat-error">
            <p>{{ chatError }}</p>
            <button @click="fetchChatHistory" class="retry-btn">Réessayer</button>
          </div>
          
          <div v-else-if="chatMessages.length === 0" class="empty-chat">
            <p>Vous n'avez pas encore de conversation avec Haven.</p>
            <button @click="$router.push('/chatbot')" class="start-chat-btn">
              Commencer une conversation
            </button>
          </div>
          
          <div v-else class="chat-messages">
            <div class="chat-date-header">Historique de vos conversations</div>
            <div v-for="message in chatMessages" :key="message.id" 
              :class="['chat-message', message.isUser ? 'user-message' : 'bot-message']">
              <div class="message-header">
                <span class="message-sender">{{ message.sender }}</span>
                <span class="message-time">{{ formatChatTime(message.timestamp) }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Édition Profil -->
    <div v-if="showEditProfile" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Modifier le profil</h2>
          <button class="close-btn" @click="showEditProfile = false">×</button>
        </div>

        <form @submit.prevent="updateProfile" class="edit-form">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input 
              id="username"
              v-model="editForm.username" 
              type="text" 
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea 
              id="bio"
              v-model="editForm.bio" 
              rows="3"
              placeholder="Parlez-nous de vous"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showEditProfile = false">
              Annuler
            </button>
            <button type="submit" class="save-btn">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getApiUrl, getAuthHeaders } from '../utils/api'

const user = ref({
  username: '',
  avatar: null,
  createdAt: new Date(),
  posts: 0,
  followers: 0,
  following: 0
})

const currentTab = ref('posts')
const showEditProfile = ref(false)
const fileInput = ref(null)
const userPosts = ref([])
const savedPosts = ref([])
const chatMessages = ref([])
const loadingChat = ref(false)
const chatError = ref(null)

const editForm = ref({
  username: '',
  bio: ''
})

const tabs = [
  { id: 'posts', name: 'Publications' },
  { id: 'mood', name: 'Suivi d\'humeur' },
  { id: 'chat', name: 'Historique du chat' },
]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const apiUrl = getApiUrl();
    const headers = getAuthHeaders().headers;
    headers['Content-Type'] = 'multipart/form-data';
    
    const response = await axios.post(`${apiUrl}/api/users/avatar`, formData, {
      headers: headers
    })
    
    user.value.avatar = response.data.avatarUrl
  } catch (error) {
    console.error('Erreur lors du changement d\'avatar:', error)
  }
}

const updateProfile = async () => {
  try {
    const apiUrl = getApiUrl();
    await axios.put(`${apiUrl}/api/users/profile`, editForm.value, getAuthHeaders())
    
    user.value.username = editForm.value.username
    showEditProfile.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
  }
}

const fetchChatHistory = async () => {
  try {
    loadingChat.value = true;
    chatError.value = null;
    
    const apiUrl = getApiUrl();
    console.log('Tentative de récupération de l\'historique du chat:', `${apiUrl}/api/chat/history`);
    const response = await axios.get(`${apiUrl}/api/chat/history`, getAuthHeaders());
    
    if (response.data && response.data.success) {
      // Traitement de l'historique du chat qui est une chaîne de texte
      const historyText = response.data.data || '';
      console.log('Historique brut reçu:', historyText);
      
      if (!historyText || historyText.trim() === '') {
        console.log('Aucun historique trouvé');
        chatMessages.value = [];
        loadingChat.value = false;
        return;
      }
      
      // Diviser l'historique en messages individuels
      const conversations = historyText.split('---\n').filter(conv => conv.trim() !== '');
      console.log('Nombre de conversations trouvées:', conversations.length);
      
      // Transformer chaque conversation en objets de message
      chatMessages.value = conversations.map((conv, index) => {
        const lines = conv.trim().split('\n');
        const userLine = lines.find(line => line.startsWith('User:'));
        const botLine = lines.find(line => line.startsWith('Bot:'));
        
        const userMessage = userLine ? userLine.replace('User:', '').trim() : '';
        const botMessage = botLine ? botLine.replace('Bot:', '').trim() : '';
        
        // Créer un timestamp artificiel décrémenté pour chaque conversation
        // pour qu'elles apparaissent dans l'ordre chronologique
        const baseTime = new Date();
        baseTime.setMinutes(baseTime.getMinutes() - (conversations.length - index));
        
        return [
          {
            id: `user-${index}`,
            sender: 'Vous',
            content: userMessage,
            timestamp: new Date(baseTime),
            isUser: true
          },
          {
            id: `bot-${index}`,
            sender: 'Haven',
            content: botMessage,
            timestamp: new Date(baseTime.getTime() + 1000), // 1 seconde plus tard
            isUser: false
          }
        ];
      }).flat();
      
      console.log('Messages formatés:', chatMessages.value.length);
    } else {
      console.error('Erreur dans la réponse:', response.data);
      chatError.value = 'Impossible de récupérer l\'historique du chat';
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique du chat:', error);
    chatError.value = 'Une erreur est survenue lors de la récupération de l\'historique du chat';
  } finally {
    loadingChat.value = false;
  }
};

// Charger l'historique du chat lorsque l'onglet est sélectionné
const handleTabChange = (tabId) => {
  currentTab.value = tabId;
  if (tabId === 'chat') {
    fetchChatHistory();
  }
};

const fetchUserData = async () => {
  try {
    const apiUrl = getApiUrl();
    console.log('Tentative de récupération du profil utilisateur:', `${apiUrl}/api/users/profile`);
    
    const authHeaders = getAuthHeaders();
    console.log('En-têtes d\'authentification pour le profil:', JSON.stringify(authHeaders));
    
    const response = await axios.get(`${apiUrl}/api/users/profile`, authHeaders);
    
    console.log('Réponse du profil utilisateur:', response.data);
    user.value = response.data;
    editForm.value.username = response.data.username || response.data.name;
    editForm.value.bio = response.data.bio || '';
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    if (error.response) {
      console.error('Détails de l\'erreur:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
  }
}

const formatChatTime = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchUserData()
  // Charger l'historique du chat si c'est l'onglet actif au chargement
  if (currentTab.value === 'chat') {
    fetchChatHistory();
  }
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: var(--background-soft);
}

.profile-header {
  position: relative;
  background: white;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-soft);
}

.profile-cover {
  height: 150px;
  background-color: var(--primary-color);
  opacity: 0.8;
}

.profile-info {
  padding: var(--spacing-md);
  margin-top: -50px;
  text-align: center;
}

.profile-avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  background-color: var(--background-soft);
  box-shadow: var(--shadow-medium);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: var(--transition-fast);
}

.edit-avatar-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-medium);
}

.profile-details {
  margin-top: var(--spacing-md);
}

.profile-details h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.member-since {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md);
  border-top: 1px solid var(--secondary-color);
  background-color: white;
}

.stat-item {
  text-align: center;
  padding: var(--spacing-sm);
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.profile-actions {
  padding: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  background-color: white;
  box-shadow: var(--shadow-soft);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: 0.95rem;
  font-weight: 500;
  transition: var(--transition-fast);
}

.edit-btn {
  background-color: var(--primary-color);
  color: white;
}

.edit-btn:hover {
  background-color: #6b8a83;
}

.settings-btn {
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

.settings-btn:hover {
  background-color: #e8d9db;
}

.profile-tabs {
  display: flex;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
  background-color: white;
  box-shadow: var(--shadow-soft);
}

.tab-btn {
  flex: 1;
  padding: var(--spacing-sm);
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: var(--transition-fast);
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  padding: var(--spacing-md);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.post-card {
  aspect-ratio: 1;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-soft);
  transition: var(--transition-fast);
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: var(--spacing-sm);
  font-size: 0.9rem;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.saved-posts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.saved-post {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-soft);
  transition: var(--transition-fast);
}

.saved-post:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-medium);
}

.post-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.saved-post-content {
  flex: 1;
  font-size: 0.9rem;
}

.saved-date {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

.modal-content {
  width: 100%;
  background: white;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  padding: var(--spacing-lg);
  animation: slideUp var(--transition-normal);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.modal-header h2 {
  font-size: 1.3rem;
  color: var(--text-primary);
}

.close-btn {
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: var(--spacing-xs);
  transition: var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.cancel-btn {
  flex: 1;
  padding: var(--spacing-sm);
  background-color: var(--secondary-color);
  color: var(--text-primary);
  border-radius: var(--border-radius-md);
  transition: var(--transition-fast);
}

.cancel-btn:hover {
  background-color: #e8d9db;
}

.save-btn {
  flex: 1;
  padding: var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md);
  transition: var(--transition-fast);
}

.save-btn:hover {
  background-color: #6b8a83;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Ajustements pour les très petits écrans */
@media (max-width: 320px) {
  .profile-avatar-container {
    width: 80px;
    height: 80px;
  }

  .profile-details h1 {
    font-size: 1.3rem;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

/* Styles pour l'historique du chat */
.chat-history {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-soft);
  min-height: 400px;
}

.loading-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.chat-error {
  text-align: center;
  padding: var(--spacing-lg);
  color: #e57373;
}

.retry-btn {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.empty-chat {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}

.start-chat-btn {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.chat-date-header {
  text-align: center;
  padding: var(--spacing-sm);
  margin: var(--spacing-md) 0;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--secondary-color);
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.chat-message {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  background-color: #e3f2fd;
  border-top-right-radius: 0;
}

.bot-message {
  align-self: flex-start;
  background-color: #f5f5f5;
  border-top-left-radius: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
  font-size: 0.8rem;
}

.message-sender {
  font-weight: 600;
  color: var(--text-primary);
}

.message-time {
  color: var(--text-secondary);
}

.message-content {
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--text-primary);
  white-space: pre-wrap;
}
</style> 