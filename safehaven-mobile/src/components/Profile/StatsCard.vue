<template>
  <div class="stats-card">
    <div class="stat-item">
      <span class="stat-value"><slot name="value">0</slot></span>
      <span class="stat-label"><slot name="label">Posts</slot></span>
    </div>
    <!-- Boutons d'action -->
    <div class="action-buttons">
        <button class="action-btn edit-btn" @click="handleEditProfile">
          Edit profile
        </button>
        <button class="action-btn logout-btn" @click="handleLogout">
          Log out
        </button>
      </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['editProfile', 'logout'])

const handleEditProfile = () => {
  emit('editProfile')
}

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.stats-card { background: var(--light-ivory, #F6F4F0); border-radius: 12px; padding: 20px; margin: 16px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.stat-value { font-size: 32px; font-weight: 600; color: var(--Muted-Olive, #7C7E73); }
.stat-label { font-size: 14px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }

/* Boutons d'action */
.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  
  transition: all 0.2s ease;
}

.edit-btn {
  background: white;
  color: var(--Muted-Olive, #7C7E73);
  border: 1px solid rgba(124, 126, 115, 0.2);
}

.logout-btn {
  background: var(--Muted-Olive, #7C7E73);
  color: white;
}
</style>
