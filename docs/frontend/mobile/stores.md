## Mobile Stores (Pinia)

auth.js – useAuthStore()
- State: user, token, isLoading, error
- Getters: isAuthenticated
- Actions:
  - login(name: string, password: string) → { success: boolean, error?: string }
  - register(name: string, email: string, password: string) → { success: boolean, error?: string }
  - logout(): Promise<void>
  - fetchUser(): Promise<void>

Usage
```js
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const { success, error } = await auth.login('alice','secret')
```

moods.js – useMoodStore
- State: moods: any[], todayMood: any|null, loading: boolean, error: string|null
- Actions:
  - createMood({ moodType: string, description?: string }) → Promise<{ success, message, data }>
  - fetchMoods(): Promise<void>
  - updateTodayMood(): void

Usage
```js
import { useMoodStore } from '@/stores/moods'
const mood = useMoodStore()
await mood.createMood({ moodType: 'happy', description: 'Sunshine' })
await mood.fetchMoods()
console.log(mood.todayMood)
```
