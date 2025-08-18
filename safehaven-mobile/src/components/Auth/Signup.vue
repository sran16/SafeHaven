<template>
    <form class="auth-form" @submit.prevent="handleSignup">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="signupForm.name" type="text" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="signupForm.email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="signupForm.password" type="password" required />
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input 
          id="confirm-password"
          type="password" 
          v-model="signupForm.confirmPassword" 
          required 
        />
      </div>
      <button class="main-btn" type="submit">Sign up</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../../stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  const signupForm = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})
  
  
 const handleSignup = async () => {
    if (signupForm.value.password !== signupForm.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  
  try {
    const result = await authStore.register(
      signupForm.value.name,
      signupForm.value.email,
      signupForm.value.password
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