import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { getApiUrl, getAuthHeaders } from '../utils/api'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPosts = async () => {
    loading.value = true
    error.value = null
    
    try {
      const apiUrl = getApiUrl();
      console.log('URL complète pour fetchPosts:', `${apiUrl}/api/experiences`);
      
      const response = await axios.get(`${apiUrl}/api/experiences`, getAuthHeaders())
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

      const apiUrl = getApiUrl();
      console.log('URL complète pour createPost:', `${apiUrl}/api/experiences`);
      
      const headers = getAuthHeaders().headers;
      headers['Content-Type'] = 'multipart/form-data';

      const response = await axios.post(`${apiUrl}/api/experiences`, formData, {
        headers: headers
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
      const apiUrl = getApiUrl();
      console.log('URL complète pour likePost:', `${apiUrl}/api/experiences/${postId}/like`);
      
      const response = await axios.post(`${apiUrl}/api/experiences/${postId}/like`, {}, getAuthHeaders())
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
      const apiUrl = getApiUrl();
      console.log('URL complète pour addComment:', `${apiUrl}/api/experiences/${postId}/comments`);
      
      const response = await axios.post(`${apiUrl}/api/experiences/${postId}/comments`, { content }, getAuthHeaders())
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
      const apiUrl = getApiUrl();
      console.log('URL complète pour deletePost:', `${apiUrl}/api/experiences/${postId}`);
      
      await axios.delete(`${apiUrl}/api/experiences/${postId}`, getAuthHeaders())
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
      const apiUrl = getApiUrl();
      console.log('URL complète pour getUserPosts:', `${apiUrl}/api/experiences/user/${userId}`);
      
      const response = await axios.get(`${apiUrl}/api/experiences/user/${userId}`, getAuthHeaders())
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