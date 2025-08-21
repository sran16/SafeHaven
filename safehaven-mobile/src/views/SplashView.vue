<template>
  <div class="splash-container">
    <div class="logo-container">
      <img src="@/assets/Logos/LogoSplash.svg" alt="SafeHaven Logo" class="logo" />
    </div>
    <div class="brand-name">
      SAFEHAVEN
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplashView',
  mounted() {
    setTimeout(() => {
      this.$router.push('/login')
    }, 5000)
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'Playfair Display';
  src: url('@/assets/Fonts/Fraunces,Playfair_Display/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

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
  padding: 60px 20px 40px 20px;
  box-sizing: border-box;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.logo {
  width: 120px;
  height: 120px;
}

.brand-name {
  color: #7C7E73;
  font-family: "Playfair Display";
  font-size: 40px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  text-align: center;
}
</style>   