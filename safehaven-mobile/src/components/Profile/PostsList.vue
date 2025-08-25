<template>
  <div class="posts-list">
    <div v-if="loading" class="loading-state">
      <slot name="loading">Loading...</slot>
    </div>

    <div v-else-if="posts.length === 0" class="empty-state">
      <slot name="empty">No posts</slot>
    </div>

    <div v-else class="list">
      <div 
        v-for="post in posts" 
        :key="post.id_experience" 
        class="post-card"
      >
        <div class="post-content">
          <p class="post-text">
            {{ post.content }}
          </p>
          
          <div class="post-meta">
            <span class="post-date">
              {{ formatDate(post.publication_date) }}
            </span>
            
            <div class="post-stats">
              <span class="stat-item">
                <img :src="likesIcon" alt="Likes" class="icon">
                {{ post.likes || 0 }}
              </span>
              <span class="stat-item">
                <img :src="commentsIcon" alt="Comments" class="icon">
                {{ post.comments?.length || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import likesIcon from '../../assets/Icons/HomeIcons/likes.svg'
import commentsIcon from '../../assets/Icons/HomeIcons/comments.svg'

defineProps({
  posts: Array,
  loading: Boolean
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>
<style scoped>
.posts-list .list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-text {
  line-height: 1.5;
  margin: 0;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.post-date {
  font-weight: 500;
}

.post-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;
}

.loading-state {
  font-style: italic;
}
</style>
