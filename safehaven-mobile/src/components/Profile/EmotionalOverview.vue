<template>
  <div class="overview">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading emotional report...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="$emit('retry')">Retry</button>
    </div>

    <div v-else-if="!reports || reports.length === 0" class="empty-state">
      <p>No reports available yet.</p>
      <button class="start-chat-btn" @click="$emit('startChat')">Start a conversation</button>
    </div>

    <div v-else class="reports">
      <div v-for="r in reports" :key="r.id_report || r.id" class="report-card">
        <div class="report-header">
          <div class="title">Rapport du {{ formatDate(r.createdAt || r.session?.startDate) }}</div>
          <div :class="['badge', severityClass(r.distressLevel)]">Détresse: {{ r.distressLevel }}/5</div>
        </div>

        <div class="tags">
          <span class="tag" v-if="r.sentiment">Sentiment: {{ r.sentiment }}</span>
          <span class="tag" v-for="t in toArray(r.topics)" :key="t">#{{ t }}</span>
          <span class="tag warn" v-if="r.emergency">Urgence</span>
        </div>

        <div class="section" v-if="r.immediateRecommendations?.length">
          <div class="section-title">Actions immédiates</div>
          <ul class="list">
            <li v-for="(rec, i) in r.immediateRecommendations" :key="i">{{ rec }}</li>
          </ul>
        </div>

        <div class="section" v-if="r.longTermRecommendations?.length">
          <div class="section-title">Suivi</div>
          <ul class="list">
            <li v-for="(rec, i) in r.longTermRecommendations" :key="i">{{ rec }}</li>
          </ul>
        </div>

        <div class="follow" v-if="r.followUpNeeded">
          <span class="chip">Suivi: {{ r.followUpUrgency }}</span>
          <span class="chip">Délai suggéré: {{ r.suggestedTiming }}</span>
        </div>

        <div class="notes" v-if="r.professionalNotes">
          <div class="section-title">Notes</div>
          <p>{{ r.professionalNotes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reports: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const toArray = (val) => Array.isArray(val) ? val : (val ? [val] : [])
const formatDate = (d) => {
  if (!d) return 'Date inconnue'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? 'Date inconnue' : dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
const severityClass = (lvl) => {
  if (lvl >= 4) return 'high'
  if (lvl >= 3) return 'medium'
  return 'low'
}
</script>

<style scoped>
.overview { display: flex; flex-direction: column; gap: 16px; }
.reports { display: flex; flex-direction: column; gap: 16px; }
.report-card { background: #fff; border: 1px solid rgba(124,126,115,0.1); border-radius: 12px; padding: 16px; }
.report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.title { color: var(--Muted-Olive, #7C7E73); font-weight: 600; }
.badge { padding: 4px 8px; border-radius: 8px; font-size: 12px; color: #fff; }
.badge.high { background: #d26666; }
.badge.medium { background: #c4a13a; }
.badge.low { background: #7C7E73; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.tag { background: rgba(124,126,115,0.08); color: var(--Muted-Olive, #7C7E73); padding: 4px 8px; border-radius: 6px; font-size: 12px; }
.tag.warn { background: #e7d1d1; color: #8a3a3a; }
.section { margin-top: 8px; }
.section-title { font-weight: 600; color: var(--Muted-Olive, #7C7E73); margin-bottom: 6px; }
.list { padding-left: 18px; margin: 0; }
.follow { display: flex; gap: 8px; margin-top: 8px; }
.chip { background: rgba(124,126,115,0.08); color: var(--Muted-Olive, #7C7E73); padding: 4px 8px; border-radius: 999px; font-size: 12px; }
.loading-state, .error-state, .empty-state { text-align: center; padding: 20px; color: var(--text-secondary); }
.loading-spinner{border:3px solid rgba(124,126,115,.1);border-top:3px solid var(--Muted-Olive,#7C7E73);border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 16px}
@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.retry-btn, .start-chat-btn { background: var(--Muted-Olive,#7C7E73); color:#fff; border:none; border-radius:8px; padding:10px 16px; }
</style>
