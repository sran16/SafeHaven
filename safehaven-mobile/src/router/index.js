import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/AuthView.vue'
import ChatbotView from '../views/ChatbotView.vue'
import ProfileView from '../views/ProfileView.vue'
import MoodTrackerView from '../views/MoodtrackerView.vue'
import SplashView from '../views/SplashView.vue'
import { getCurrentToken, clearAuthData } from '../utils/tokenValidator'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: SplashView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
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

router.beforeEach((to, from, next) => {
  const { token, isValid: tokenIsValid } = getCurrentToken()
  
  if (to.meta.requiresAuth && !tokenIsValid) {
    if (token && !tokenIsValid) {
      clearAuthData()
    }
    next('/login')
    return
  }
  
  if (tokenIsValid && (to.path === '/login' || to.path === '/')) {
    next('/home')
    return
  }
  
  next()
})

export default router
