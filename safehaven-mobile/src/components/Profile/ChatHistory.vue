<template>
  <div class="chat-tab">
    <div v-if="loading" class="loading-state"><div class="loading-spinner"></div><p>Loading history...</p></div>
    <div v-else-if="error" class="error-state"><p>{{ error }}</p><button class="retry-btn" @click="$emit('retry')">Retry</button></div>
    <div v-else-if="!messages || messages.length===0" class="empty-state"><p>No conversations yet</p><button class="start-chat-btn" @click="$emit('start')">Start chatting</button></div>
    <div v-else class="chat-sessions">
      <div v-for="group in messages" :key="group.date" class="date-group">
        <div class="date-header">{{ formatDate(group.date) }}</div>
        <div v-for="session in group.sessions" :key="session.id" :class="['session-item', {active:selectedSession?.id===session.id}]" @click="select(session)">
          <div class="session-preview"><div class="session-message">{{ session.preview }}</div></div>
        </div>
      </div>

      <div v-if="selectedSession" class="session-details">
        <div class="session-header">
          <h3>Conversation du {{ formatDate(selectedSession.date) }}</h3>
          <button class="close-session-btn" @click="selectedSession=null">×</button>
        </div>
        <div class="messages-container">
          <div v-for="message in selectedSession.messages" :key="message.id" :class="['message', message.isUserMessage ? 'user-message' : 'bot-message']">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const props=defineProps({messages:{type:Array, default:()=>[]}, loading:{type:Boolean, default:false}, error:{type:String, default:null}})
const emit=defineEmits(['retry','start'])
const selectedSession=ref(null)
const select=(s)=>{selectedSession.value=s}
const formatDate=(d)=> new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})
const formatTime=(d)=> new Date(d).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
</script>
<style scoped>
.chat-sessions{display:flex;flex-direction:column;gap:16px}
.date-group{border-bottom:1px solid rgba(124,126,115,.1);padding-bottom:16px}
.date-header{color:var(--Muted-Olive,#7C7E73);font-size:16px;font-weight:500;margin-bottom:12px}
.session-item{padding:12px;border-radius:8px;transition:all .2s;margin-bottom:8px}

.session-item.active{background:var(--Muted-Olive,#7C7E73);color:#fff}
.session-message{font-size:14px;color:inherit}
.session-details{background:#fff;border:1px solid rgba(124,126,115,.1);border-radius:12px;margin-top:16px}
.session-header{padding:16px;border-bottom:1px solid rgba(124,126,115,.1);display:flex;justify-content:space-between;align-items:center}
.messages-container{padding:16px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
.message{max-width:80%;padding:12px;border-radius:12px}
.user-message{align-self:flex-end;background:var(--Muted-Olive,#7C7E73);color:#fff}
.bot-message{align-self:flex-start;background:rgba(124,126,115,.1);color:var(--text-primary)}
.loading-state,.error-state,.empty-state{text-align:center;padding:20px;color:var(--text-secondary)}
.loading-spinner{border:3px solid rgba(124,126,115,.1);border-top:3px solid var(--Muted-Olive,#7C7E73);border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 16px}
@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.retry-btn,.start-chat-btn{background:var(--Muted-Olive,#7C7E73);color:#fff;border:none;border-radius:8px;padding:10px 16px}
</style>
