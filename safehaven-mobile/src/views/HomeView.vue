<template> 
<div class="home-container">
    <Header />
    <div class="Intro"> 
        <p>Some experiences are heavy ...</p>
        <p>If you feel ready, we're here to hear it .</p>
    </div>
    
    <div class="posts-wrapper">
        <Post />
    </div>
</div>
</template>

<script setup>
import Header from '../components/Mobile/Header.vue'
import Post from '../components/Experience/Post.vue'
</script>

<style scoped>
.home-container {
  padding: 24px;
  padding-top: 50px;
  padding-bottom: 50px;
}
.Intro {
    margin: 24px 0 0 0;
    width: 286px;
    color: var(--Muted-Olive, #7C7E73);
    font-family: Nunito;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.posts-wrapper {
    margin-top: 32px; 
}
</style>