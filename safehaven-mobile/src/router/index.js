import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/AuthView.vue'
import ChatbotView from '../views/ChatbotView.vue'
import ProfileView from '../views/ProfileView.vue'
import MoodTrackerView from '../views/MoodtrackerView.vue'
import SplashView from '../views/SplashView.vue'
import { getCurrentToken, clearAuthData } from '../utils/tokenValidator'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: SplashView,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/chatbot',
      name: 'chatbot',
      component: ChatbotView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/mood',
      name: 'mood',
      component: MoodTrackerView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const { token, isValid: tokenIsValid } = getCurrentToken()
  
  // Debug logs supprimés pour une console plus propre
  
  if (to.meta.requiresAuth && !tokenIsValid) {
    // Nettoyer le token invalide
    if (token && !tokenIsValid) {
      clearAuthData()
    }
    next('/login')
  } else if (to.path === '/login' && tokenIsValid) {
    next('/home')
  } else if (to.path === '/' && tokenIsValid) {
    // Si l'utilisateur est connecté et accède à la page d'accueil, aller directement à /home
    next('/home')
  } else {
    next()
  }
})

export default router
