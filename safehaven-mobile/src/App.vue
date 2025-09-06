<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import TabBar from './components/Mobile/TabBar.vue'

const route = useRoute()
const authStore = useAuthStore()

const showNavigation = computed(() => {
  // Afficher la TabBar seulement sur les pages authentifiées ET si l'utilisateur est connecté
  const authenticatedRoutes = ['home', 'chatbot', 'mood', 'profile']
  return authenticatedRoutes.includes(route.name) && authStore.isAuthenticated
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