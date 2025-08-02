<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/Mobile/TabBar.vue'

const route = useRoute()

const showNavigation = computed(() => {
  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = localStorage.getItem('token')
  
  // Afficher la TabBar seulement sur les pages authentifiées ET si l'utilisateur est connecté
  const authenticatedRoutes = ['home', 'chatbot', 'mood', 'profile']
  return authenticatedRoutes.includes(route.name) && isAuthenticated
})
</script>

<template>  
  <div id="app" :class="{ 'with-nav': showNavigation }">
    <TabBar v-if="showNavigation" />
    <main :class="{ 'with-nav': showNavigation }">
      <router-view></router-view>
    </main>
  </div>
</template>