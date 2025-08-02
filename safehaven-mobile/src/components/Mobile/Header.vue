<template>
    <div class="header">
        <div class="header-left">
            <img src="@/assets/Logos/Logo.svg" alt="Logo" class="logo" />
        </div>
        <div class="header-right">
            <img src="@/assets/Icons/HomeIcons/AddIcon.svg" alt="AddIcon" class="AddIcon" />
        </div>
    </div>  
    
</template>
<script>
export default {
    name: 'Header',
}
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
}

.AddIcon {
    width: 20px;
    height: 20px;
}
</style>