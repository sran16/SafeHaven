<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const posts = ref([])
const loading = ref(true)
const router = useRouter()

const fetchPosts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Pas de token d\'authentification')
      router.push('/login')
      return
    }

    const response = await axios.get('http://localhost:3000/api/experiences', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('Réponse des expériences:', response.data)
    if (response.data.success) {
      posts.value = response.data.data.map(post => ({
        ...post,
        showComments: false,
        newComment: '',
        comments: post.comments || []
      }))
    } else {
      console.error('Erreur dans la réponse:', response.data)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des posts:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const likePost = async (postId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Pas de token d\'authentification')
      router.push('/login')
      return
    }

    const response = await axios.post(`/api/experiences/${postId}/like`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const post = posts.value.find(p => p.id_experience === postId)
    if (post && response.data.success) {
      post.isLiked = response.data.data.isLiked
      post.likes = response.data.data.likes
    }
  } catch (error) {
    console.error('Erreur lors du like:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
  }
}

const showComments = (post) => {
  post.showComments = !post.showComments
}

const addComment = async (post) => {
  if (!post.newComment.trim()) return

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Pas de token d\'authentification')
      router.push('/login')
      return
    }

    const commentContent = post.newComment.trim()
    post.newComment = '' // Vider l'input immédiatement

    const response = await axios.post(
      `/api/experiences/${post.id_experience}/comments`,
      { content: commentContent },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    console.log('Réponse du serveur:', response.data)
    if (response.data.success) {
      const newComment = {
        id: response.data.data.id,
        content: response.data.data.content,
        author: response.data.data.author,
        createdAt: response.data.data.createdAt
      }
      
      // Initialiser le tableau des commentaires s'il n'existe pas
      if (!Array.isArray(post.comments)) {
        post.comments = []
      }
      
      // Ajouter le nouveau commentaire au début du tableau
      post.comments = [newComment, ...post.comments]
      
      console.log('Commentaire ajouté:', newComment)
      console.log('Liste des commentaires mise à jour:', post.comments)
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error)
    if (error.response?.status === 401) {
      router.push('/login')
    }
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data)
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="home-container">
    <div class="content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
      
      <div v-else-if="posts.length === 0" class="no-posts">
        <p>Aucun post pour le moment.</p>
        <button @click="$router.push('/post')" class="create-post-btn">
          Créer votre premier post
        </button>
      </div>
      
      <div v-else class="posts-container">
        <article v-for="post in posts" :key="post.id_experience" class="post-card">
          <div class="post-header">
            <div class="user-info">
              <img :src="post.user?.avatar || '/default-avatar.png'" alt="Avatar" class="avatar" />
              <div>
                <h3>{{ post.user?.name || 'Utilisateur inconnu' }}</h3>
                <span class="post-date">{{ formatDate(post.publication_date) }}</span>
              </div>
            </div>
          </div>
          
          <div class="post-content">
            <p>{{ post.content }}</p>
            <img v-if="post.image" :src="post.image" alt="Post image" class="post-image" />
          </div>
          
          <div class="post-actions">
            <button @click="likePost(post.id_experience)" :class="{ 'liked': post.isLiked }" class="action-btn">
              <span class="icon">❤️</span>
              <span class="count">{{ post.likes }}</span>
            </button>
            <button @click="showComments(post)" class="action-btn">
              <span class="icon">💬</span>
              <span class="count">{{ post.comments.length }}</span>
            </button>
          </div>

          <!-- Section commentaires -->
          <div v-if="post.showComments" class="comments-section">
            <div class="comments-list">
              <div v-if="post.comments && post.comments.length > 0">
                <div v-for="comment in post.comments" :key="comment.id" class="comment">
                  <div class="comment-header">
                    <strong>{{ comment.author }}</strong>
                    <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                </div>
              </div>
              <div v-else class="no-comments">
                <p>Aucun commentaire pour le moment</p>
              </div>
            </div>
            
            <form @submit.prevent="addComment(post)" class="comment-form">
              <input 
                v-model="post.newComment" 
                placeholder="Ajouter un commentaire..."
                class="comment-input"
              />
              <button type="submit" class="comment-btn">Envoyer</button>
            </form>
          </div>
        </article>
      </div>
    </div>

    <button @click="$router.push('/post')" class="floating-action-btn">
      <span>+</span>
    </button>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #7C9A92;     /* Vert apaisant */
  --secondary-color: #F5E6E8;   /* Rose très pâle */
  --accent-color: #D5B9B2;      /* Rose poudré */
  --text-primary: #2C3E50;      /* Bleu foncé doux */
  --text-secondary: #647380;    /* Gris bleuté */
  --background-soft: #F9F7F7;   /* Blanc cassé */
  --shadow-soft: 0 2px 8px rgba(0,0,0,0.05);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-container {
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: var(--background-soft);
}

.content {
  padding-bottom: 80px;
}

.loading {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.loading-spinner {
  border: 2px solid var(--secondary-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: var(--spacing-md);
}

.no-posts {
  margin: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-lg);
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.create-post-btn {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  transition: var(--transition-fast);
}

.create-post-btn:hover {
  background-color: #6b8a83;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.posts-container {
  padding: var(--spacing-sm);
}

.post-card {
  background: white;
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: var(--transition-fast);
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.post-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--secondary-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--secondary-color);
}

.user-info h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.post-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: block;
  margin-top: var(--spacing-xs);
}

.post-content {
  padding: var(--spacing-md);
}

.post-content p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.post-image {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  margin-top: var(--spacing-sm);
  border-radius: var(--border-radius-md);
}

.post-actions {
  display: flex;
  padding: var(--spacing-sm);
  border-top: 1px solid var(--secondary-color);
  justify-content: space-around;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  transition: var(--transition-fast);
}

.action-btn:hover {
  color: var(--primary-color);
  transform: scale(1.05);
}

.action-btn.liked {
  color: #E57373;
}

.count {
  font-size: 0.9rem;
}

.floating-action-btn {
  position: fixed;
  bottom: 75px;
  right: var(--spacing-md);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-large);
  z-index: 100;
  transition: var(--transition-fast);
}

.floating-action-btn:hover {
  transform: scale(1.1);
  background-color: #6b8a83;
  box-shadow: var(--shadow-large);
}

.comments-section {
  background-color: var(--background-soft);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--secondary-color);
}

.comments-list {
  margin-bottom: var(--spacing-md);
}

.comment {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-soft);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.comment-header strong {
  color: var(--text-primary);
  font-weight: 600;
}

.comment-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.comment-content {
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.4;
}

.no-comments {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
}

.comment-form {
  margin-top: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
}

.comment-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  font-size: 0.95rem;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(124, 154, 146, 0.1);
}

.comment-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: var(--transition-fast);
}

.comment-btn:hover {
  background-color: #6b8a83;
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

@media (max-width: 320px) {
  .post-content p {
    font-size: 0.9rem;
  }

  .action-btn {
    padding: var(--spacing-sm);
    font-size: 1rem;
  }

  .floating-action-btn {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
