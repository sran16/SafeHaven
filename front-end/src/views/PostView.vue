<template>
  <div class="post-container">
    <header class="header">
      <button @click="$router.go(-1)" class="back-btn">
        ← Retour
      </button>
      <h1>Créer un post</h1>
    </header>

    <form @submit.prevent="handleSubmit" class="post-form">
      <div class="form-group">
        <label for="content">Que souhaitez-vous partager ?</label>
        <textarea
          id="content"
          v-model="postForm.content"
          rows="4"
          placeholder="Partagez vos pensées..."
          required
        ></textarea>
      </div>

      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? 'Publication en cours...' : 'Publier' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isSubmitting = ref(false)

// Fonction utilitaire pour obtenir l'URL de l'API sans slash final
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL.endsWith('/') 
    ? import.meta.env.VITE_API_URL.slice(0, -1) 
    : import.meta.env.VITE_API_URL;
};

const postForm = ref({
  content: ''
})

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const apiUrl = getApiUrl();
    await axios.post(`${apiUrl}/api/experiences`, {
      content: postForm.value.content
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    router.push('/home')
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.post-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-primary);
  padding: var(--spacing-sm);
  transition: var(--transition-fast);
}

.back-btn:hover {
  color: var(--primary-color);
  transform: translateX(-4px);
}

.post-form {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-soft);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  resize: vertical;
  font-family: inherit;
  min-height: 120px;
  transition: var(--transition-fast);
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(124, 154, 146, 0.1);
}

.submit-btn {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: var(--transition-fast);
}

.submit-btn:hover:not(:disabled) {
  background-color: #6b8a83;
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.submit-btn:disabled {
  background-color: var(--text-secondary);
  cursor: not-allowed;
}
</style> 