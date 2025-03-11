<template>
  <nav class="navigation">
    <div class="nav-items">
      <router-link to="/home" class="nav-item" active-class="active">
        <span class="icon">🏠</span>
        <span class="label">Accueil</span>
      </router-link>

      <router-link to="/post" class="nav-item" active-class="active">
        <span class="icon">✏️</span>
        <span class="label">Publier</span>
      </router-link>

      <router-link to="/chatbot" class="nav-item" active-class="active">
        <span class="icon">🤖</span>
        <span class="label">Assistant</span>
      </router-link>

      <router-link to="/mood" class="nav-item" active-class="active">
        <span class="icon">📊</span>
        <span class="label">Humeur</span>
      </router-link>

      <router-link to="/profile" class="nav-item" active-class="active">
        <span class="icon">👤</span>
        <span class="label">Profil</span>
      </router-link>

      <button @click="handleLogout" class="nav-item logout-btn">
        <span class="icon">🚪</span>
        <span class="label">Déconnexion</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 0.5rem;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.nav-items {
  display: flex;
  justify-content: space-around;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 60px;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.active {
  color: #4CAF50;
}

.icon {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.label {
  font-size: 0.7rem;
  text-align: center;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: #666;
}

.logout-btn:hover {
  color: #f44336;
}

@media (min-width: 768px) {
  .navigation {
    left: 0;
    top: 0;
    bottom: 0;
    width: 80px;
    padding: 1rem 0;
  }

  .nav-items {
    flex-direction: column;
    height: 100%;
    padding: 1rem 0;
  }

  .nav-item {
    margin: 0.5rem 0;
  }
}
</style> 