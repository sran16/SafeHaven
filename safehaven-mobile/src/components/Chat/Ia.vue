<template>
  <div class="ia-message">
    <div class="ia-header">
      <img :src="logoChat" alt="SafeHaven" class="ia-icon" />
      <span class="ia-name">SafeHaven</span>
    </div>
    <div class="message-bubble ia-bubble">
      <slot>{{ message }}</slot>
    </div>
  </div>
</template>

<script setup>
import logoChat from '../../assets/Icons/chat/LogoChat.svg'

defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.ia-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}

.ia-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ia-icon {
  width: 20px;
  height: 20px;
}

.ia-name {
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

.ia-bubble {
  background-color: #F5F5F5;
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}
</style>
