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
          @click="currentTab = tab.id"
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

        <!-- Saved -->
        <div v-else class="saved-posts">
          <div v-for="post in savedPosts" :key="post.id" class="saved-post">
            <img v-if="post.image" :src="post.image" :alt="post.content" class="post-thumbnail" />
            <div class="saved-post-content">
              <p>{{ post.content }}</p>
              <span class="saved-date">Sauvegardé le {{ formatDate(post.savedAt) }}</span>
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

const editForm = ref({
  username: '',
  bio: ''
})

const tabs = [
  { id: 'posts', name: 'Publications' },
  { id: 'mood', name: 'Suivi d\'humeur' },
  { id: 'saved', name: 'Sauvegardés' }
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
    const response = await axios.post('http://localhost:3000/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    user.value.avatar = response.data.avatarUrl
  } catch (error) {
    console.error('Erreur lors du changement d\'avatar:', error)
  }
}

const updateProfile = async () => {
  try {
    await axios.put('http://localhost:3000/api/users/profile', editForm.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    user.value.username = editForm.value.username
    showEditProfile.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
  }
}

const fetchUserData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    user.value = response.data
    editForm.value.username = response.data.username
    editForm.value.bio = response.data.bio || ''
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
  }
}

onMounted(() => {
  fetchUserData()
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
</style> 