<template>
    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="loginForm.name" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="loginForm.password" type="password" required />
      </div>
      <button class="main-btn" type="submit">Sign in</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '../../stores/auth'

  const authStore = useAuthStore()

  const loginForm = ref({
    name: '',
    password: ''
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
  </script>
  
  <style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  label {
    color: #7C7E73;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  input {
    border: 1px solid #7C7E73;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 16px;
    background: #fff;
    color: #444;
    outline: none;
    transition: border 0.2s;
  }
  
  input:focus {
    border: 1.5px solid #7C7E73;
  }
  
  .main-btn {
    margin-top: 10px;
    background: #7C7E73;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .main-btn:hover {
    background: #5e5f56;
  }
  </style>