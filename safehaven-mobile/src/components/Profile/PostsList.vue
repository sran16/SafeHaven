<template>
  <div class="posts-list">
    <div v-if="loading" class="loading-state"><slot name="loading">Loading...</slot></div>
    <div v-else-if="posts.length===0" class="empty-state"><slot name="empty">No posts</slot></div>
    <div v-else class="list">
      <div v-for="post in posts" :key="post.id_experience" class="post-card">
        <div class="post-content">
          <p class="post-text">{{ post.content }}</p>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(post.publication_date) }}</span>
            <div class="post-stats">
              <img :src="likesIcon" class="likes"> {{ post.likes || 0 }}
              <img :src="commentsIcon" class="comments"> {{ post.comments?.length || 0 }}
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
const props = defineProps({ posts:{type:Array, default:()=>[]}, loading:{type:Boolean, default:false} })
const formatDate=(d)=> new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})
</script>
<style scoped>
.posts-list .list{display:flex;flex-direction:column;gap:16px}
.post-card { border:1px solid rgba(124,126,115,.1);border-radius:12px;padding:16px;transition:all .2s}
.post-meta{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--text-secondary)}
.post-stats{display:flex;gap:12px}
.loading-state,.empty-state{text-align:center;padding:20px;color:var(--text-secondary)}
</style>
