## Mobile Components

Auth
- UserSignIn (`components/Auth/Signin.vue`)
  - Emits: none
  - Slots: none
  - Usage
  ```vue
  <UserSignIn />
  ```
- Signup (`components/Auth/Signup.vue`)
  - Emits: none
  - Slots: none

Chat
- Chat/Ia.vue
  - Props: message?: string
  - Slots: default (message content)
  - Usage
  ```vue
  <Ia message="Hello" />
  ```
- Chat/User.vue
  - Props: message?: string, username?: string
  - Slots: default

Experience
- Experience/Post.vue
  - Fetches and renders posts; handles like/unlike and comments via backend API.
  - Props: none; internal state-only
  - Emits: none

Mood
- Mood/MoodOfDay.vue
  - Props: mood?: { moodType: string, description?: string, dateRegistration?: string }
  - Usage
  ```vue
  <MoodOfDay :mood="todayMood" />
  ```
- Mood/MoodModal.vue
  - Props: isOpen: boolean
  - Emits: close, save({ moodType, description })
  - Usage
  ```vue
  <MoodModal :isOpen="isOpen" @close="isOpen=false" @save="handleSave" />
  ```

Profile
- Profile/ChatHistory.vue
  - Props: messages: Array, loading: Boolean, error: String
  - Emits: retry, start

Mobile UI
- Mobile/TabBar.vue
  - Navigation bar, no props/emits

Global
- All components are Vue 3 SFCs with `<script setup>` unless noted.
