import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPosts = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get('/api/experiences')
      posts.value = response.data.data || []
      console.log('Posts récupérés:', posts.value)
    } catch (err) {
      console.error('Erreur lors du chargement des posts:', err)
      error.value = 'Impossible de charger les posts'
    } finally {
      loading.value = false
    }
  }

  const createPost = async (postData) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      
      if (postData.content) {
        formData.append('content', postData.content)
      }
      
      if (postData.mood) {
        formData.append('mood', postData.mood)
      }
      
      if (postData.image) {
        formData.append('image', postData.image)
      }
      
      if (postData.isPrivate !== undefined) {
        formData.append('isPrivate', postData.isPrivate)
      }

      const response = await axios.post('/api/experiences', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      posts.value.unshift(response.data.data)
      return { success: true, post: response.data.data }
    } catch (err) {
      console.error('Erreur lors de la création du post:', err)
      error.value = 'Impossible de créer le post'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const likePost = async (postId) => {
    try {
      const response = await axios.post(`/api/experiences/${postId}/like`)
      const post = posts.value.find(p => p.id_experience === postId)
      if (post) {
        post.isLiked = response.data.data.isLiked
        post.likes = response.data.data.likes
      }
      return { success: true }
    } catch (err) {
      console.error('Erreur lors du like:', err)
      return { success: false, error: 'Impossible de liker le post' }
    }
  }

  const addComment = async (postId, content) => {
    try {
      const response = await axios.post(`/api/experiences/${postId}/comments`, { content })
      const post = posts.value.find(p => p.id_experience === postId)
      if (post) {
        if (!post.comments) post.comments = []
        post.comments.push(response.data.data)
      }
      return { success: true, comment: response.data.data }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err)
      return { success: false, error: 'Impossible d\'ajouter le commentaire' }
    }
  }

  const deletePost = async (postId) => {
    try {
      await axios.delete(`/api/experiences/${postId}`)
      posts.value = posts.value.filter(p => p.id !== postId)
      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression du post:', err)
      return { success: false, error: 'Impossible de supprimer le post' }
    }
  }

  const getUserPosts = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/api/experiences/user/${userId}`)
      return response.data.data || []
    } catch (err) {
      console.error('Erreur lors du chargement des posts de l\'utilisateur:', err)
      error.value = 'Impossible de charger les posts de l\'utilisateur'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
    addComment,
    deletePost,
    getUserPosts
  }
}) 