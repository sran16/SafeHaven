<template>
  <div v-if="loading" class="loading">
    Chargement des posts...
  </div>
  
  <div v-else class="posts-container">
    <div v-for="post in posts" :key="post.id_experience" class="post-card">
      <!-- Contenu principal -->
      <div class="post-content">
        <p class="post-text">{{ post.content }}</p>
      </div>
      
      <!-- Séparateur -->
      <div class="separator"></div>
      
      <!-- Section utilisateur et engagement -->
      <div class="post-footer">
        <div class="user-info">
          <img :src="userIcon" alt="User" class="user-icon" />
          <span class="username">{{ post.user?.name || 'Utilisateur' }}</span>
        </div>
        
        <div class="engagement">
          <div class="engagement-item" @click="likePost(post.id_experience)">
            <img :src="likesIcon" alt="Likes" class="engagement-icon" :class="{ 'liked': post.isLiked }" />
            <span class="engagement-count">{{ post.likes || 0 }}</span>
          </div>
          <div class="engagement-item" @click="showComments(post)">
            <img :src="commentsIcon" alt="Comments" class="engagement-icon" />
            <span class="engagement-count">{{ post.comments?.length || 0 }}</span>
          </div>
        </div>
      </div>
      
      <!-- Section commentaires -->
      <div v-if="post.showComments" class="comments-section">
        <div class="separator"></div>
        
        <!-- Liste des commentaires -->
        <div v-if="post.comments && post.comments.length > 0" class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
        
        <!-- Formulaire d'ajout de commentaire -->
        <div class="add-comment">
          <input 
            v-model="post.newComment"
            type="text" 
            placeholder="Ajouter un commentaire..."
            class="comment-input"
            @keyup.enter="addComment(post)"
          />
          <button @click="addComment(post)" class="comment-btn">Envoyer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import userIcon from '../../assets/Icons/HomeIcons/userPost.svg'
import likesIcon from '../../assets/Icons/HomeIcons/likes.svg'
import commentsIcon from '../../assets/Icons/HomeIcons/comments.svg'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const posts = ref([])
const loading = ref(true)

// Fonction pour obtenir l'URL de l'API
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

const fetchPosts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Pas de token d\'authentification')
      router.push('/login')
      return
    }

    const apiUrl = getApiUrl();
    
    const response = await axios.get(`${apiUrl}/api/experiences`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    
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

    const apiUrl = getApiUrl();
    const post = posts.value.find(p => p.id_experience === postId)
    let response
    if (post?.isLiked) {
      // UNLIKE → DELETE
      response = await axios.delete(`${apiUrl}/api/experiences/${postId}/likes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } else {
      // LIKE → PUT (idempotent)
      response = await axios.put(`${apiUrl}/api/experiences/${postId}/likes`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    }
    
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

    const apiUrl = getApiUrl();
    const response = await axios.post(
      `${apiUrl}/api/experiences/${post.id_experience}/comments`,
      { content: commentContent },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    
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
  // Test de l'API sans authentification
  const apiUrl = getApiUrl();
  axios.get(`${apiUrl}/api/test`).catch(() => {})
    
  fetchPosts()
})
</script>

<style scoped>
.post-card {
  background-color: var(--background);
  border: 1px solid #7C7E7380; 
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-content {
  margin-bottom: 12px;
}

.post-text {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
  white-space: pre-line; 
}



.separator {
  height: 1px;
  background-color: #E0E0E0;
  margin: 12px 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0; 
}

.username {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1; 
}

.engagement {
  display: flex;
  gap: 16px;
  align-items: center;
}

.engagement-item {
  display: flex;
  align-items: center;
  gap: 4px;

}

.engagement-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0; 
}

.engagement-count {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1; 
}

/* Section commentaires - Style */
.comments-section {
  margin-top: 12px;
}

.comments-list {
  margin-bottom: 16px;
}

.comment {
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.comment-date {
  font-size: 11px;
  color: var(--text-secondary);
}

.comment-content {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0;
}

.add-comment {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--light-ivory);

  transition: border-color 0.2s;
}

.comment-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(107, 138, 130, 0.2);
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(107, 138, 130, 0.2);
}

.comment-input::placeholder {
  color: var(--text-secondary);
}

.comment-btn {
  padding: 10px 16px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;

  transition: background-color 0.2s;
  white-space: nowrap;
}



.comment-btn:active {
  transform: translateY(1px);
}
</style>