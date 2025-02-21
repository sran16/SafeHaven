<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const posts = ref([])
const loading = ref(true)

const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/posts', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    posts.value = response.data.map(post => ({
      ...post,
      showComments: false,
      newComment: '',
      comments: post.comments || []
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des posts:', error)
  } finally {
    loading.value = false
  }
}

const likePost = async (postId) => {
  try {
    const response = await axios.post(`http://localhost:3000/api/posts/${postId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const post = posts.value.find(p => p.id_experience === postId)
    if (post) {
      post.isLiked = response.data.isLiked
      post.likes = response.data.likes
    }
  } catch (error) {
    console.error('Erreur lors du like:', error)
  }
}

const showComments = (post) => {
  post.showComments = !post.showComments
}

const addComment = async (post) => {
  if (!post.newComment.trim()) return

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Pas de token d\'authentification');
      return;
    }

    console.log('Token présent:', token);
    console.log('Post pour commentaire:', post);
    console.log('Contenu du commentaire:', post.newComment);

    const response = await axios.post(
      `http://localhost:3000/api/posts/${post.id_experience}/comment`,
      { content: post.newComment },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    console.log('Réponse du serveur:', response.data);
    if (response.data.success) {
      post.comments.push(response.data.comment);
      post.newComment = '';
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
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
              <div v-for="comment in post.comments" :key="comment.id" class="comment">
                <div class="comment-header">
                  <strong>{{ comment.author }}</strong>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
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
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.comment-header strong {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.comment-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.comment-content {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.comment-form {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: white;
  box-shadow: var(--shadow-large);
  z-index: 99;
}

.comment-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  font-size: 0.95rem;
  margin-bottom: var(--spacing-sm);
  transition: var(--transition-fast);
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(124, 154, 146, 0.1);
}

.comment-btn {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition-fast);
}

.comment-btn:hover {
  background-color: #6b8a83;
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
