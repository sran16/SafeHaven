<template>
  <div class="splash-container">
    <div class="splash-content">
      <div class="logo-container">
        <!-- Ici vous pouvez ajouter un logo si vous en avez un -->
      </div>
      <div class="brand-name">
        SAFEHAVEN
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplashView',
  mounted() {
    // Redirection automatique vers login après 3 secondes
    setTimeout(() => {
      this.$router.push('/login')
    }, 3000)
  }
}
</script>

<style scoped>
.splash-container {
  background-color: #F6F4F0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
}

.splash-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.logo-container {
  /* Espace pour un logo futur */
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  color: #7C7E73;
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  text-align: center;
  margin-bottom: 2rem;
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
}

/* Animation d'apparition */
.splash-container {
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .brand-name {
    font-size: 2rem;
    bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .brand-name {
    font-size: 1.5rem;
    bottom: 1rem;
  }
}
</style> 