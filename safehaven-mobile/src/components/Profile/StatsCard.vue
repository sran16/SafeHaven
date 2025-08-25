<template>
  <div class="stats-card">
    <div class="stat-item">
      <span class="stat-value">
        <slot name="value">0</slot>
      </span>
      <span class="stat-label">
        <slot name="label">Posts</slot>
      </span>
    </div>
    
    <div class="action-buttons">
      <button class="action-btn edit-btn" @click="$emit('editProfile')">
        Edit profile
      </button>
      <button class="action-btn logout-btn" @click="$emit('logout')">
        Log out
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['editProfile', 'logout'])
</script>

<style scoped>
.stats-card {
  background: #F6F4F0;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 24px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #7C7E73;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.edit-btn {
  background: white;
  color: #7C7E73;
  border: 1px solid #ccc;
}

.logout-btn {
  background: #7C7E73;
  color: white;
}
</style>
