<template>
    <div class="auth-bg">
      <div class="header">
        <div class="brand">SafeHaven</div>
        <div class="slogan">Your peaceful haven, always at your fingertips</div>
      </div>
      <div class="logo-separator">
        <img src="@/assets/Logos/LogoLogin.svg" alt="Logo" class="mini-logo" />
      </div>
      <div class="auth-card">
        <div class="tabs">
          <button
            :class="{ active: activeTab === 'signIn' }"
            @click="activeTab = 'signIn'"
          >Sign in</button>
          <button
            :class="{ active: activeTab === 'signUp' }"
            @click="activeTab = 'signUp'"
          >Sign up</button>
        </div>
        <div class="tab-underline">
          <div :class="{ underline: activeTab === 'signIn' }"></div>
          <div :class="{ underline: activeTab === 'signUp' }"></div>
        </div>
        <Signin v-if="activeTab === 'signIn'" />
        <Signup v-else />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Signin from '../components/Auth/Signin.vue'
  import Signup from '../components/Auth/Signup.vue'
  
  const activeTab = ref('signIn')
  </script>
  
  <style scoped>
  @font-face {
    font-family: 'Playfair Display';
    src: url('@/assets/Fonts/Fraunces,Playfair_Display/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf') format('truetype');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
  
  .auth-bg {
    min-height: 100vh;
    width: 100vw;
    background: url('@/assets/Bgs/LoginBg.svg') no-repeat center center;
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 80px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 100px;
  }
  
  .brand {
    font-family: 'Playfair Display', serif;
    color: #7C7E73;
    font-size: 40px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .slogan {
    color: #7C7E73;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Nunito';
    line-height: normal;
    margin-bottom: 20px;
  }
  
  .logo-separator {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: -43px;
    z-index: 2;
  }
  
  
  .auth-card {
    background: var(--light-ivory, #F6F4F0);
    border-radius: 20px;
    padding: 32px 24px 24px 24px;
    width: 73%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    z-index: 1;
  }
  
  .tabs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0;
  }
  
  .tabs button {
    flex: 1;
    background: none;
    border: none;
    
    font-size: 16px;
    font-weight: 600;
    color: var(--Muted-Olive);
    padding: 12px 0 8px 0;
    
    border-bottom: 2px solid transparent;
    font-family: 'Nunito';
    line-height: normal;
  }
  
  
  .tab-underline {
    display: flex;
    height: 2px;
    background: none;
    margin-bottom: 24px;
  }
  
  .tab-underline > div {
    flex: 1;
    background: #E0E0E0;
    transition: background 0.2s;
  }
  
  .tab-underline > div.underline {
    background: #7C7E73;
  }
  
  </style>