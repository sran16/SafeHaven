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
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .form-group {
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  label {
    color: var(--Muted-Olive);
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  input {
    border: 1px solid var(--Muted-Olive);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 16px;
    color: var(--text-primary);
    outline: none;
    transition: border 0.2s;
  }
  
  input:focus {
    border: 1.5px solid var(--Muted-Olive);
  }
  
  .main-btn {
    margin-top: 10px;
    background: var(--Muted-Olive);
    color: var(--light-ivory);
    border: none;
    border-radius: 10px;
    padding: 12px 0;
    font-size: 16px;
    font-weight: 700;
    line-height: normal;
    font-family: 'Nunito';
    font-style: normal;
    cursor: pointer;
    width: 61%;
    transition: background 0.2s;
  }
  
  </style>