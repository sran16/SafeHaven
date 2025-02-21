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

      <div class="form-group">
        <label for="mood">Comment vous sentez-vous ?</label>
        <select id="mood" v-model="postForm.mood" required>
          <option value="happy">😊 Heureux</option>
          <option value="sad">😢 Triste</option>
          <option value="angry">😠 En colère</option>
          <option value="anxious">😰 Anxieux</option>
          <option value="calm">😌 Calme</option>
        </select>
      </div>

      <div class="form-group">
        <label for="image">Ajouter une image (optionnel)</label>
        <input
          type="file"
          id="image"
          @change="handleImageUpload"
          accept="image/*"
        />
      </div>

      <div class="privacy-settings">
        <label>
          <input
            type="checkbox"
            v-model="postForm.isPrivate"
          />
          Rendre ce post privé
        </label>
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

const postForm = ref({
  content: '',
  mood: 'happy',
  image: null,
  isPrivate: false
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    postForm.value.image = file
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const formData = new FormData()
    formData.append('content', postForm.value.content)
    formData.append('mood', postForm.value.mood)
    formData.append('isPrivate', postForm.value.isPrivate)
    
    if (postForm.value.image) {
      formData.append('image', postForm.value.image)
    }

    await axios.post('http://localhost:3000/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
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

select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  background-color: white;
  font-size: 1rem;
  color: var(--text-primary);
  transition: var(--transition-fast);
}

select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(124, 154, 146, 0.1);
}

.privacy-settings {
  margin-bottom: var(--spacing-lg);
}

.privacy-settings label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}

input[type="checkbox"]:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
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

input[type="file"] {
  width: 100%;
  padding: var(--spacing-sm) 0;
  color: var(--text-primary);
  cursor: pointer;
}

input[type="file"]::file-selector-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--secondary-color);
  border: none;
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  font-weight: 500;
  margin-right: var(--spacing-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

input[type="file"]::file-selector-button:hover {
  background-color: var(--accent-color);
}
</style> 