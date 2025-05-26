<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-cover"></div>
      <div class="profile-info">
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
          <div v-if="userPosts.length === 0" class="empty-state">
            <p>Vous n'avez pas encore de publications</p>
            <button @click="$router.push('/create-post')" class="create-post-btn">
              Créer une publication
            </button>
          </div>
          <div v-else v-for="post in userPosts" :key="post.id_experience" class="post-card">
            <img v-if="post.image" :src="post.image" :alt="post.content" class="post-image" />
            <div class="post-content">
              <p class="post-text">{{ post.content }}</p>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.publication_date) }}</span>
                <div class="post-stats">
                  <span class="likes">❤️ {{ post.likes }}</span>
                  <span class="comments">💬 {{ post.comments.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mood Tracker -->
        <div v-else-if="currentTab === 'mood'" class="mood-tracker">
          <div v-if="loadingMood" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Chargement des données de mood...</p>
          </div>
          
          <div v-else-if="moodError" class="error-state">
            <p>{{ moodError }}</p>
            <button @click="fetchMoodData" class="retry-btn">Réessayer</button>
          </div>
          
          <div v-else-if="moodData.length === 0" class="empty-state">
            <p>Vous n'avez pas encore enregistré de mood</p>
            <button @click="$router.push('/mood')" class="start-tracking-btn">
              Commencer le suivi
            </button>
          </div>
          
          <div v-else class="mood-chart">
            <MoodChart :mood-data="moodData" />
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
          
          <div v-else class="chat-sessions">
            <div class="sessions-list">
              <div v-for="group in chatMessages" :key="group.date" class="date-group">
                <div class="date-header">{{ formatDate(group.date) }}</div>
                <div v-for="session in group.sessions" :key="session.id" 
                     :class="['session-item', { active: selectedSession?.id === session.id }]"
                     @click="selectSession(session)">
                  <div class="session-preview">
                    <div class="session-message">{{ session.preview }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedSession" class="session-details">
              <div class="session-header">
                <h3>Conversation du {{ formatDate(selectedSession.date) }}</h3>
                <button @click="selectedSession = null" class="close-session-btn">×</button>
              </div>
              <div class="messages-container">
                <template v-if="selectedSession">
                  <div v-for="message in selectedSession.messages" :key="message.id"
                       :class="['message', message.isUserMessage ? 'user-message' : 'bot-message']">
                    <div class="message-content">{{ message.content }}</div>
                    <div class="message-time">{{ formatChatTime(message.timestamp) }}</div>
                  </div>
                </template>
              </div>
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
import { useRouter } from 'vue-router'
import MoodChart from '../components/MoodChart.vue'

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
const groupedChatMessages = ref({})
const moodData = ref([])
const loadingMood = ref(false)
const moodError = ref(null)
const router = useRouter()

const editForm = ref({
  username: '',
  bio: ''
})

const tabs = [
  { id: 'posts', name: 'Publications' },
  { id: 'mood', name: 'Suivi d\'humeur' },
  { id: 'chat', name: 'Historique du chat' },
]

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Date invalide:', dateString);
      return 'Date inconnue';
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date inconnue';
  }
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

const goToChat = (timestamp) => {
  localStorage.setItem('chatTimestamp', timestamp)
  router.push('/chatbot')
}

const fetchChatHistory = async () => {
  try {
    loadingChat.value = true;
    chatError.value = null;
    
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/api/chat/history`, getAuthHeaders());
    
    if (response.data && response.data.success) {
      chatMessages.value = response.data.data;
    } else {
      chatError.value = 'Impossible de récupérer l\'historique du chat';
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique du chat:', error);
    chatError.value = 'Une erreur est survenue lors de la récupération de l\'historique du chat';
  } finally {
    loadingChat.value = false;
  }
};

const fetchUserPosts = async () => {
  try {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/api/experiences/user`, getAuthHeaders());
    
    if (response.data.success) {
      userPosts.value = response.data.data.map(post => ({
        ...post,
        showComments: false,
        newComment: '',
        comments: post.comments || []
      }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des posts:', error);
    if (error.response?.status === 401) {
      router.push('/login');
    }
  }
}

const fetchMoodData = async () => {
  try {
    loadingMood.value = true;
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/api/moods`, getAuthHeaders());
    moodData.value = response.data.data || [];
  } catch (error) {
    console.error('Erreur lors du chargement des données de mood:', error);
    moodError.value = 'Impossible de charger les données de mood';
  } finally {
    loadingMood.value = false;
  }
}

// Charger les données lorsque l'onglet change
const handleTabChange = (tabId) => {
  currentTab.value = tabId;
  if (tabId === 'posts') {
    fetchUserPosts();
  } else if (tabId === 'mood') {
    fetchMoodData();
  } else if (tabId === 'chat') {
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
    user.value = response.data.data;
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

const formatChatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Date invalide:', dateString);
      return '';
    }
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de l\'heure:', error);
    return '';
  }
}

// Générer une URL d'avatar aléatoire basé sur le nom (ex: DiceBear)
const getRandomAvatar = (name) => {
  // Utilisation de DiceBear Avatars (par exemple style 'initials')
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
};

const selectedSession = ref(null);

const selectSession = (session) => {
  selectedSession.value = session;
};

onMounted(async () => {
  try {
    const apiUrl = getApiUrl();
    const [profileResponse] = await Promise.all([
      axios.get(`${apiUrl}/api/users/profile`, getAuthHeaders())
    ]);

    if (profileResponse.data.success) {
      user.value = profileResponse.data.data;
      editForm.value.username = user.value.username;
    }

    await fetchUserPosts();
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    if (error.response?.status === 401) {
      router.push('/login');
    }
  }
});
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


.post-card {
  min-height: 120px;
  background: white;
  border-radius: var(--border-radius-md);
  overflow: visible;
  box-shadow: var(--shadow-soft);
  transition: var(--transition-fast);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  padding: var(--spacing-md);
  font-size: 1rem;
  color: var(--text-primary);
  display: block;
  overflow: visible;
  min-height: 40px;
}

.post-text {
  color: var(--text-primary);
  font-size: 1rem;
  white-space: normal;
  overflow: visible;
  word-break: break-word;
  margin-bottom: var(--spacing-sm);
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

.chat-sessions {
  display: flex;
  gap: var(--spacing-md);
  height: 600px;
}

.sessions-list {
  width: 300px;
  background: white;
  border-radius: var(--border-radius-md);
  overflow-y: auto;
  box-shadow: var(--shadow-soft);
}

.date-group {
  margin-bottom: var(--spacing-md);
}

.date-header {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--background-soft);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  border-bottom: 1px solid var(--secondary-color);
}

.session-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--secondary-color);
  cursor: pointer;
  transition: var(--transition-fast);
}

.session-item:last-child {
  border-bottom: none;
}

.session-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.session-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item.active .session-message {
  color: rgba(255, 255, 255, 0.9);
}

.session-details {
  flex: 1;
  background: white;
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-soft);
}

.session-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--secondary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.close-session-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: var(--transition-fast);
}

.close-session-btn:hover {
  color: var(--text-primary);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message {
  max-width: 80%;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  position: relative;
}

.user-message {
  align-self: flex-end;
  background-color: var(--primary-color);
  color: white;
}

.bot-message {
  align-self: flex-start;
  background-color: var(--background-soft);
  color: var(--text-primary);
}

.message-content {
  margin-bottom: var(--spacing-xs);
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.7;
  text-align: right;
}

@media (max-width: 768px) {
  .chat-sessions {
    flex-direction: column;
    height: auto;
  }

  .sessions-list {
    width: 100%;
    max-height: 300px;
  }

  .session-details {
    height: 400px;
  }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}

.create-post-btn,
.start-tracking-btn {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.create-post-btn:hover,
.start-tracking-btn:hover {
  background-color: var(--primary-color-dark);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.post-stats {
  display: flex;
  gap: var(--spacing-sm);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-lg);
}

.loading-spinner {
  border: 3px solid var(--background-soft);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mood-chart {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-soft);
  height: 400px;
}
</style> 