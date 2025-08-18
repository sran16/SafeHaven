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
  
  // Debug logs (à supprimer en production)
  if (import.meta.env.DEV) {
    console.log('Router guard - Route:', to.path)
    console.log('Router guard - Token présent:', !!token)
    console.log('Router guard - Token valide:', tokenIsValid)
    console.log('Router guard - Requires auth:', to.meta.requiresAuth)
  }
  
  if (to.meta.requiresAuth && !tokenIsValid) {
    // Nettoyer le token invalide
    if (token && !tokenIsValid) {
      if (import.meta.env.DEV) console.log('Nettoyage token expiré')
      clearAuthData()
    }
    if (import.meta.env.DEV) console.log('Redirection vers /login - token invalide ou absent')
    next('/login')
  } else if (to.path === '/login' && tokenIsValid) {
    if (import.meta.env.DEV) console.log('Redirection vers /home - token valide sur login')
    next('/home')
  } else if (to.path === '/' && tokenIsValid) {
    // Si l'utilisateur est connecté et accède à la page d'accueil, aller directement à /home
    if (import.meta.env.DEV) console.log('Redirection vers /home - token valide sur splash')
    next('/home')
  } else {
    if (import.meta.env.DEV) console.log('Navigation normale')
    next()
  }
})

export default router
