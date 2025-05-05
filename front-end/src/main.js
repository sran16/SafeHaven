import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configuration d'Axios
axios.defaults.baseURL = 'http://localhost:3000'
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// Création de l'application
const app = createApp(App)

// Installation des plugins
app.use(createPinia())
app.use(router)

// Montage de l'application
app.mount('#app')
