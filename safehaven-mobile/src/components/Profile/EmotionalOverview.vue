<template>
  <div class="overview">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading emotional report...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="$emit('retry')">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!reports || reports.length === 0" class="empty-state">
      <p>No reports available yet.</p>
      <button class="start-chat-btn" @click="$emit('startChat')">Start a conversation</button>
    </div>

    <!-- Reports List -->
    <div v-else class="reports">
      <div 
        v-for="report in reports" 
        :key="report.id_report || report.id" 
        class="report-card"
      >
        <!-- Report Header -->
        <div class="report-header">
          <div class="title">
            Report from {{ formatDate(report.createdAt || report.session?.startDate) }}
          </div>
          <div :class="['badge', severityClass(report.distressLevel)]">
            Distress: {{ report.distressLevel }}/5
          </div>
        </div>

        <!-- Tags -->
        <div class="tags">
          <span class="tag" v-if="report.sentiment">
            Sentiment: {{ report.sentiment }}
          </span>
          <span 
            class="tag" 
            v-for="topic in toArray(report.topics)" 
            :key="topic"
          >
            #{{ topic }}
          </span>
          <span class="tag warn" v-if="report.emergency">
            Emergency
          </span>
        </div>

        <!-- Immediate Recommendations -->
        <div class="section" v-if="report.immediateRecommendations?.length">
          <div class="section-title">Immediate Actions</div>
          <ul class="list">
            <li 
              v-for="(recommendation, index) in report.immediateRecommendations" 
              :key="index"
            >
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <!-- Long Term Recommendations -->
        <div class="section" v-if="report.longTermRecommendations?.length">
          <div class="section-title">Follow-up</div>
          <ul class="list">
            <li 
              v-for="(recommendation, index) in report.longTermRecommendations" 
              :key="index"
            >
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <!-- Follow-up Info -->
        <div class="follow" v-if="report.followUpNeeded">
          <span class="chip">Follow-up: {{ report.followUpUrgency }}</span>
          <span class="chip">Suggested timing: {{ report.suggestedTiming }}</span>
        </div>

        <!-- Professional Notes -->
        <div class="notes" v-if="report.professionalNotes">
          <div class="section-title">Notes</div>
          <p>{{ report.professionalNotes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reports: { 
    type: Array, 
    default: () => [] 
  },
  loading: { 
    type: Boolean, 
    default: false 
  },
  error: { 
    type: String, 
    default: null 
  }
})

// Utility functions
const toArray = (value) => {
  return Array.isArray(value) ? value : (value ? [value] : [])
}

const formatDate = (date) => {
  if (!date) return 'Unknown date'
  
  const dateObj = new Date(date)
  return isNaN(dateObj.getTime()) 
    ? 'Unknown date' 
    : dateObj.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
}

const severityClass = (level) => {
  if (level >= 4) return 'high'
  if (level >= 3) return 'medium'
  return 'low'
}
</script>

<style scoped>
/* Layout */
.overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reports {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Report Card */
.report-card {
  background: #fff;
  border: 1px solid rgba(124, 126, 115, 0.1);
  border-radius: 12px;
  padding: 16px;
}

/* Report Header */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  color: var(--Muted-Olive, #7C7E73);
  font-weight: 600;
}

/* Badge */
.badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  color: #fff;
}

.badge.high {
  background: #d26666;
}

.badge.medium {
  background: #c4a13a;
}

.badge.low {
  background: #7C7E73;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
}

.tag {
  background: rgba(124, 126, 115, 0.08);
  color: var(--Muted-Olive, #7C7E73);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.tag.warn {
  background: #e7d1d1;
  color: #8a3a3a;
}

/* Sections */
.section {
  margin-top: 8px;
}

.section-title {
  font-weight: 600;
  color: var(--Muted-Olive, #7C7E73);
  margin-bottom: 6px;
}

.list {
  padding-left: 18px;
  margin: 0;
}

/* Follow-up */
.follow {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.chip {
  background: rgba(124, 126, 115, 0.08);
  color: var(--Muted-Olive, #7C7E73);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

/* Loading Spinner */
.loading-spinner {
  border: 3px solid rgba(124, 126, 115, 0.1);
  border-top: 3px solid var(--Muted-Olive, #7C7E73);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0) }
  100% { transform: rotate(360deg) }
}

/* Buttons */
.retry-btn,
.start-chat-btn {
  background: var(--Muted-Olive, #7C7E73);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Nunito';
  margin-top: 16px;
  cursor: pointer;
}
</style>
