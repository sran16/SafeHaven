<template>
  <div class="user-message">
    <div class="user-header">
      <img :src="logoUserChat" alt="User" class="user-icon" />
      <span class="user-name">{{ username }}</span>
    </div>
    <div class="message-bubble user-bubble">
      <slot>{{ message }}</slot>
    </div>
  </div>
</template>

<script setup>
import logoUserChat from '../../assets/Icons/chat/Logouserchat.svg'

defineProps({
  message: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: 'Username'
  }
})
</script>

<style scoped>
.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 16px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-direction: row-reverse;
}

.user-icon {
  width: 20px;
  height: 20px;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.user-bubble {
  background-color: var(--primary);
  color: white;
  border-bottom-right-radius: 4px;
}
</style>
