## Mobile Router

History
- Hash history via `createWebHashHistory()`

Routes
- '/' → SplashView
- '/login' → AuthView
- '/home' → HomeView (requiresAuth)
- '/chatbot' → ChatbotView (requiresAuth)
- '/profile' → ProfileView (requiresAuth)
- '/mood' → MoodTrackerView (requiresAuth)

Guards
- Before each navigation, token validity is checked via `getCurrentToken()`.
- If a route requires auth and the token is missing/invalid, local auth data is cleared and the user is redirected to `/login`.
- If token is valid and navigating to `/` or `/login`, redirect to `/home`.

Usage
```js
import router from '@/router'
router.push('/home')
```
