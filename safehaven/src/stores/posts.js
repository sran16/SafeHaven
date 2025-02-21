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
      const response = await axios.get('http://localhost:3000/api/posts')
      posts.value = response.data
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

      const response = await axios.post('http://localhost:3000/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      posts.value.unshift(response.data)
      return { success: true, post: response.data }
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
      await axios.post(`http://localhost:3000/api/posts/${postId}/like`)
      
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }
    } catch (err) {
      console.error('Erreur lors du like:', err)
    }
  }

  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/api/posts/${postId}`)
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
      const response = await axios.get(`http://localhost:3000/api/users/${userId}/posts`)
      return response.data
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
    deletePost,
    getUserPosts
  }
}) 