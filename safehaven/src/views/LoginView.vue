<template>
  <div class="login-container">
    <div class="login-content">
      <div class="logo-section">
        <h1>SafeHaven</h1>
        <p class="tagline">Votre espace de bien-être mental</p>
      </div>

      <div class="form-container" v-if="!isRegistering">
        <h2>Connexion</h2>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="login-name">Nom d'utilisateur</label>
            <input 
              id="login-name"
              type="text" 
              v-model="loginForm.name" 
              placeholder="Votre nom d'utilisateur"
              required 
            />
          </div>

          <div class="form-group">
            <label for="login-password">Mot de passe</label>
            <input 
              id="login-password"
              type="password" 
              v-model="loginForm.password" 
              placeholder="Votre mot de passe"
              required 
            />
          </div>

          <button type="submit" class="submit-btn">Se connecter</button>
        </form>

        <div class="form-footer">
          <p>Pas encore de compte ?</p>
          <button @click="isRegistering = true" class="switch-btn">
            Créer un compte
          </button>
        </div>
      </div>
      
      <div class="form-container" v-else>
        <h2>Inscription</h2>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="register-name">Nom d'utilisateur</label>
            <input 
              id="register-name"
              type="text" 
              v-model="registerForm.name" 
              placeholder="Choisissez un nom d'utilisateur"
              required 
            />
          </div>

          <div class="form-group">
            <label for="register-email">Email</label>
            <input 
              id="register-email"
              type="email" 
              v-model="registerForm.email" 
              placeholder="Votre adresse email"
              required 
            />
          </div>

          <div class="form-group">
            <label for="register-password">Mot de passe</label>
            <input 
              id="register-password"
              type="password" 
              v-model="registerForm.password" 
              placeholder="Choisissez un mot de passe"
              required 
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirmer le mot de passe</label>
            <input 
              id="confirm-password"
              type="password" 
              v-model="registerForm.confirmPassword" 
              placeholder="Confirmez votre mot de passe"
              required 
            />
          </div>

          <button type="submit" class="submit-btn">S'inscrire</button>
        </form>

        <div class="form-footer">
          <p>Déjà un compte ?</p>
          <button @click="isRegistering = false" class="switch-btn">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isRegistering = ref(false)

const loginForm = ref({
  name: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  try {
    const result = await authStore.login(loginForm.value.name, loginForm.value.password)
    if (!result.success) {
      alert(result.error || 'Erreur de connexion')
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    alert('Erreur de connexion')
  }
}

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  
  try {
    const result = await authStore.register(
      registerForm.value.name,
      registerForm.value.email,
      registerForm.value.password
    )
    
    if (!result.success) {
      alert(result.error || 'Erreur d\'inscription')
    }
  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    alert('Erreur d\'inscription')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: var(--background-soft);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo-section h1 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.tagline {
  color: var(--text-secondary);
  font-size: 1rem;
}

.form-container {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
}

.form-container h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
}

.form-group input:focus {
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
  font-size: 1rem;
  font-weight: 500;
  margin-top: var(--spacing-md);
}

.form-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.form-footer p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.switch-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 1rem;
}

/* Ajustements pour les très petits écrans */
@media (max-width: 320px) {
  .login-container {
    padding: var(--spacing-sm);
  }

  .form-container {
    padding: var(--spacing-md);
  }

  .logo-section h1 {
    font-size: 1.8rem;
  }

  .form-container h2 {
    font-size: 1.3rem;
  }
}
</style> 