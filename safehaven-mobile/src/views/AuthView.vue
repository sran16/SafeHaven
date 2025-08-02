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
    src: url('@/assets/Fonts/Fraunces,Playfair_Display/Playfair_Display/static/PlayfairDisplay-SemiBold.ttf') format('truetype');
    font-weight: 600;
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
    padding-top: 40px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 10px;
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
    font-size: 15px;
    font-weight: 400;
    opacity: 0.7;
    margin-bottom: 20px;
  }
  
  .logo-separator {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: -30px;
    z-index: 2;
  }
  
  .mini-logo {
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    padding: 6px;
  }
  
  .auth-card {
    background: #F9F7F7;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(124, 126, 115, 0.08);
    padding: 32px 24px 24px 24px;
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    margin-top: 0;
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
    outline: none;
    font-size: 18px;
    font-weight: 600;
    color: #7C7E73;
    padding: 12px 0 8px 0;
    cursor: pointer;
    transition: color 0.2s;
    border-bottom: 2px solid transparent;
  }
  
  .tabs button.active {
    color: #444;
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
  
  @media (max-width: 400px) {
    .auth-card {
      padding: 20px 8px 16px 8px;
      max-width: 98vw;
    }
    .brand {
      font-size: 30px;
    }
  }
  </style>