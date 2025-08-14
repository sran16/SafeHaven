<template>
    <nav class="navigation">
      <div class="nav-items">
        <router-link to="/home" class="nav-item" active-class="active">
          <img src="@/assets/Icons/Tabbar/Home.png" alt="Accueil" class="icon-img" />
        </router-link>
  
        <router-link to="/chatbot" class="nav-item" active-class="active">
          <img src="@/assets/Icons/Tabbar/Safehaven.png" alt="SafeHaven" class="icon-img" />
        </router-link>
  
        <router-link to="/mood" class="nav-item" active-class="active">
          <img src="@/assets/Icons/Tabbar/Mood.png" alt="Humeur" class="icon-img" />
        </router-link>
  
        <router-link to="/profile" class="nav-item" active-class="active">
          <img src="@/assets/Icons/Tabbar/Profile.png" alt="Profil" class="icon-img" />
        </router-link>
  
      </div>
    </nav>
  </template>

<script setup>
</script>

<style scoped>
.navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 50px 50px 0px 0px;
  background: linear-gradient(0deg, #7C7E73 7.41%, #F6F4F0 131.07%);
  padding: 0.5rem;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.nav-items {
  display: flex;
  justify-content: space-around;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  min-width: 60px;
}



.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.icon-img {
  width: 24px;
  height: 24px;
  margin-bottom: 0.2rem;
  transition: all 0.2s ease;
}
</style> 