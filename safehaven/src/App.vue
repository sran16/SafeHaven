<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from './components/Navigation.vue'

const route = useRoute()

const showNavigation = computed(() => {
  return route.name !== 'login'
})
</script>

<template>
  <div id="app" :class="{ 'with-nav': showNavigation }">
    <Navigation v-if="showNavigation" />
    <main :class="{ 'with-nav': showNavigation }">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Couleurs principales */
  --primary-color: #7C9A92;     /* Vert apaisant */
  --secondary-color: #F5E6E8;   /* Rose très pâle */
  --accent-color: #D5B9B2;      /* Rose poudré */
  --text-primary: #2C3E50;      /* Bleu foncé doux */
  --text-secondary: #647380;    /* Gris bleuté */
  --background-soft: #F9F7F7;   /* Blanc cassé */

  /* Ombres */
  --shadow-soft: 0 2px 8px rgba(0,0,0,0.05);
  --shadow-medium: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-large: 0 8px 24px rgba(0,0,0,0.12);

  /* Espacements */
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */

  /* Bordures */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--background-soft);
  color: var(--text-primary);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

#app.with-nav {
  padding-bottom: 80px;
}

main {
  transition: var(--transition-normal);
}

main.with-nav {
  padding-bottom: 60px;
}

@media (min-width: 768px) {
  #app.with-nav {
    padding-left: 80px;
    padding-bottom: 0;
  }

  main.with-nav {
    padding-left: 80px;
    padding-bottom: 0;
  }
}

/* Styles de base */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

button {
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 1rem;
  transition: var(--transition-fast);
}

input, textarea, select {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  background-color: white;
  transition: var(--transition-fast);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(124, 154, 146, 0.1);
}

/* Classes utilitaires */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Formulaires */
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-primary);
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: var(--transition-fast);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #6b8a83;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: #e8d9db;
}

/* Cartes */
.card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--spacing-lg);
}
</style>
