<template>
  <div class="profile-container">
    <header class="profile-header">
      <button @click="$router.go(-1)" class="back-btn">←</button>
      <h2>Profil</h2>
    </header>
    
    <main class="profile-content">
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">Se déconnecter</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    alert('Erreur lors de la déconnexion')
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  margin-right: 15px;
  cursor: pointer;
  color: #667eea;
}

.profile-header h2 {
  margin: 0;
  color: #333;
}

.profile-content {
  padding: 20px;
}

.logout-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}
</style>