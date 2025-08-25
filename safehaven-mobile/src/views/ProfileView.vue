<template>
  <div class="chatbot-bg">
    <div class="profile-container">
      <div class="profile-header">
        <div class="user-info">
          <h1 class="username">{{ displayName }}</h1>
          <p class="member-since">Membre depuis {{ displayDate }}</p>
        </div>
      </div>

      <!-- Statistiques -->
      <StatsCard @editProfile="showEditProfile = true" @logout="handleLogout">
        <template #value>{{ userPosts.length }}</template>
        <template #label>Posts</template>
      </StatsCard>

      <!-- Contenu principal avec tabs -->
      <div class="main-content">
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-btn', { active: currentTab === tab.id }]"
            @click="handleTabChange(tab.id)"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- Contenu des tabs -->
        <div class="tab-content">
          <!-- Posts -->
          <div v-if="currentTab === 'posts'" class="posts-tab">
            <PostsList :posts="userPosts" :loading="loadingPosts">
              <template #loading>
                <div class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>Chargement des posts...</p>
                </div>
              </template>
              <template #empty>
                <div class="empty-state">
                  <p>You don't have any posts yet</p>
                  <button @click="$router.push('/home')" class="create-post-btn">Create an experience</button>
                </div>
              </template>
            </PostsList>
          </div>

          <!-- Mood Tracker -->
          <div v-else-if="currentTab === 'mood'" class="mood-tab">
            <div v-if="loadingMood" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading mood data...</p>
            </div>
            
            <div v-else-if="moodError" class="error-state">
              <p>{{ moodError }}</p>
              <button @click="fetchMoodData" class="retry-btn">Retry</button>
            </div>
            
            <div v-else-if="moodData.length === 0" class="empty-state">
              <p>You haven't recorded any mood yet</p>
              <button @click="$router.push('/mood')" class="start-tracking-btn">
                Start tracking
              </button>
            </div>
            
          <div v-else class="mood-chart">
            <MoodChart :mood-data="moodData" />
          </div>
          </div>

          <!-- Chat History -->
          <div v-else-if="currentTab === 'chat'" class="chat-tab">
            <ChatHistory 
              :messages="chatMessages" 
              :loading="loadingChat" 
              :error="chatError" 
              @retry="fetchChatHistory" 
              @start="$router.push('/chatbot')" />
          </div>

          <!-- Emotional Overview -->
          <div v-else-if="currentTab === 'overview'" class="overview-tab">
            <EmotionalOverview 
              :reports="sessionReports" 
              :loading="loadingOverview" 
              :error="overviewError" 
              @retry="fetchOverview" 
              @startChat="$router.push('/chatbot')" />
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
              <input id="username" v-model="editForm.username" type="text" placeholder="Votre nom d'utilisateur" />
            </div>

            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea id="bio" v-model="editForm.bio" rows="3" placeholder="Parlez-nous de vous"></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showEditProfile = false">Annuler</button>
              <button type="submit" class="save-btn">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { getApiUrl, getAuthHeaders } from '../utils/api'
import MoodChart from '../components/Profile/MoodChart.vue'

import StatsCard from '../components/Profile/StatsCard.vue'
import PostsList from '../components/Profile/PostsList.vue'
import ChatHistory from '../components/Profile/ChatHistory.vue'
import EmotionalOverview from '../components/Profile/EmotionalOverview.vue'

const router = useRouter()

// User data
const user = ref({ name: '', email: '', registration_Date: new Date(), avatar: null })

// UI state
const currentTab = ref('posts')
const showEditProfile = ref(false)

// Data
const userPosts = ref([])
const chatMessages = ref([])
const moodData = ref([])

// Loading states
const loadingPosts = ref(false)
const loadingChat = ref(false)
const loadingMood = ref(false)

// Error states
const chatError = ref(null)
const moodError = ref(null)
const overviewError = ref(null)

// Edit form
const editForm = ref({ username: '', bio: '' })

// Tabs
const tabs = [
  { id: 'posts', name: 'Posts' },
  { id: 'mood', name: 'Mood log' },
  { id: 'chat', name: 'Chat history' },
  { id: 'overview', name: 'Emotional overview' }
]

// Derivés d'affichage robustes
const displayName = computed(() => user.value?.username || user.value?.name || 'USER pseudo')
const displayDate = computed(() => {
  const raw = user.value?.createdAt || user.value?.registration_Date
  try {
    const d = new Date(raw)
    if (raw && !isNaN(d.getTime())) {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  } catch {
    // Erreur de formatage de date silencieuse
  }
  return 'Date inconnue'
})

// État pour la gestion des sessions (pour futures fonctionnalités)

// Helpers pour l'affichage des données

// Utilitaires de formatage intégrés dans les computed properties

const handleTabChange=(tab)=>{
  currentTab.value=tab
  if(tab==='posts') fetchUserPosts()
  else if(tab==='mood') fetchMoodData()
  else if(tab==='chat') fetchChatHistory()
  else if(tab==='overview') fetchOverview()
}

const fetchUserPosts = async () => {
  try {
    loadingPosts.value = true
    const apiUrl = getApiUrl()
    const res = await axios.get(`${apiUrl}/api/users/me/experiences`, getAuthHeaders())
    if (res.data.success) {
      userPosts.value = res.data.data.map(p => ({ ...p, comments: p.comments || [] }))
    }
  } catch (e) {
    console.error('Erreur lors du chargement des posts:', e)
    if (e.response?.status === 401) {
      router.push('/login')
    }
  } finally {
    loadingPosts.value = false
  }
}
const fetchMoodData = async () => {
  try {
    loadingMood.value = true
    moodError.value = null
    const apiUrl = getApiUrl()
    const res = await axios.get(`${apiUrl}/api/moods`, getAuthHeaders())
    moodData.value = res.data.data || []
  } catch (e) {
    console.error('Erreur lors du chargement des données de mood:', e)
    moodError.value = 'Impossible de charger les données de mood'
  } finally {
    loadingMood.value = false
  }
}
const fetchChatHistory = async () => {
  try {
    loadingChat.value = true
    chatError.value = null
    const apiUrl = getApiUrl()
    const res = await axios.get(`${apiUrl}/api/chat/sessions`, getAuthHeaders())
    if (res.data && res.data.success) {
      chatMessages.value = res.data.data
    } else {
      chatError.value = 'Impossible de récupérer l\'historique du chat'
    }
  } catch (e) {
    console.error('Erreur lors du chargement de l\'historique du chat:', e)
    chatError.value = 'Une erreur est survenue lors de la récupération de l\'historique du chat'
  } finally {
    loadingChat.value = false
  }
}
const sessionReports = ref([])
const loadingOverview = ref(false)
const fetchOverview = async () => {
  try {
    loadingOverview.value = true
    overviewError.value = null
    const apiUrl = getApiUrl()
    const res = await axios.get(`${apiUrl}/api/chat/sessions/reports`, getAuthHeaders())
    if (res.data && res.data.success) {
      sessionReports.value = res.data.data.reports || res.data.data || []
    } else {
      overviewError.value = 'Impossible de charger les rapports'
    }
  } catch (e) {
    console.error('Erreur lors du chargement des rapports:', e)
    overviewError.value = 'Erreur lors du chargement des rapports'
  } finally {
    loadingOverview.value = false
  }
}
const fetchUserData = async () => {
  try {
    const apiUrl = getApiUrl()
    const res = await axios.get(`${apiUrl}/api/users/me`, getAuthHeaders())
    if (res.data.success) {
      user.value = res.data.data
      editForm.value.username = user.value.username || user.value.name
      editForm.value.bio = user.value.bio || ''
    }
  } catch (e) {
    console.error('Erreur lors du chargement des données utilisateur:', e)
    if (e.response?.status === 401) {
      router.push('/login')
    }
  }
}
const updateProfile = async () => {
  try {
    const apiUrl = getApiUrl()
    await axios.put(`${apiUrl}/api/users/me`, editForm.value, getAuthHeaders())
    user.value.username = editForm.value.username
    showEditProfile.value = false
  } catch (e) {
    console.error('Erreur lors de la mise à jour du profil:', e)
  }
}
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  await fetchUserData()
  await fetchUserPosts()
})
</script>

<style scoped>
#app.with-nav {
  padding-bottom: 0px; 
}

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
  padding-bottom: 80px;
}

.profile-container {
  min-height: 100vh;
}

/* Header avec infos utilisateur */
.profile-header {
  padding: 24px;
  
}

.user-info {
  position: relative;
  z-index: 1;
}

.username {
  color: var(--Muted-Olive, #7C7E73);
  font-family: 'Fraunces', serif;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.member-since {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}


/* Contenu principal */
.main-content {
  background: var(--light-ivory, #F6F4F0);;
  border-radius: 20px 20px 0 0;
  margin: 0 24px;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

/* Tabs */
.tabs-container {
  display: flex;
  background: var(--light-ivory, #F6F4F0);;
  border-bottom: 1px solid rgba(124, 126, 115, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 16px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;

  transition: all 0.2s ease;
  position: relative;
}

.tab-btn.active {
  color: var(--Muted-Olive, #7C7E73);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--Muted-Olive, #7C7E73);
}

/* Contenu des tabs */
.tab-content {
  min-height: 400px;
  padding: 24px;
}


/* Chat History */
.chat-sessions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-group {
  border-bottom: 1px solid rgba(124, 126, 115, 0.1);
  padding-bottom: 16px;
}

.date-header {
  color: var(--Muted-Olive, #7C7E73);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.session-item {
  padding: 12px;
  border-radius: 8px;

  transition: all 0.2s ease;
  margin-bottom: 8px;
}



.session-item.active {
  background: var(--Muted-Olive, #7C7E73);
  color: white;
}

.session-message {
  font-size: 14px;
  color: inherit;
}

/* Session details */
.session-details {
  background: white;
  border: 1px solid rgba(124, 126, 115, 0.1);
  border-radius: 12px;
  margin-top: 16px;
}

.session-header {
  padding: 16px;
  border-bottom: 1px solid rgba(124, 126, 115, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--Muted-Olive, #7C7E73);
}

.close-session-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-secondary);

  padding: 4px;
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
  position: relative;
}

.user-message {
  align-self: flex-end;
  background: var(--Muted-Olive, #7C7E73);
  color: white;
}

.bot-message {
  align-self: flex-start;
  background: rgba(124, 126, 115, 0.1);
  color: var(--text-primary);
}

.message-content {
  margin-bottom: 4px;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
}

/* Loading et états vides */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  border: 3px solid rgba(124, 126, 115, 0.1);
  border-top: 3px solid var(--Muted-Olive, #7C7E73);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.create-post-btn,
.start-tracking-btn,
.start-chat-btn,
.retry-btn {
  background: var(--Muted-Olive, #7C7E73);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Nunito';
  margin-top: 16px;
  transition: all 0.2s ease;
}



/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--Muted-Olive, #7C7E73);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);

  padding: 4px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--Muted-Olive, #7C7E73);
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid rgba(124, 126, 115, 0.2);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(107, 138, 130, 0.2);
  outline: none;
  border-color: var(--Muted-Olive, #7C7E73);
  box-shadow: 0 0 0 2px rgba(124, 126, 115, 0.2);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;

  border: none;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: rgba(124, 126, 115, 0.1);
  color: var(--Muted-Olive, #7C7E73);
}

.save-btn {
  background: var(--Muted-Olive, #7C7E73);
  color: white;
}



@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

</style>