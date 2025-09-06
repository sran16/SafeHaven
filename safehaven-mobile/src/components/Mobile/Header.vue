<template>
    <div class="header">
        <div class="header-left">
            <img src="@/assets/Logos/Logo.svg" alt="Logo" class="logo" />
        </div>
        <div class="header-right">
            <img src="@/assets/Icons/HomeIcons/AddIcon.svg" alt="AddIcon" class="AddIcon" @click="openAddModal" />
        </div>
    </div>  
    
    <!-- Modal d'ajout d'expérience -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h2>Do you wanna share your experience with us ?</h2>
            </div>
            
            <div class="modal-body">
                <textarea 
                    v-model="experienceContent" 
                    placeholder="Write your experience here..."
                    class="experience-input"
                    rows="8"
                ></textarea>
            </div>
            
            <div class="modal-footer">
                <button @click="shareExperience" class="share-btn" :disabled="!experienceContent.trim() || isLoading">
                    {{ isLoading ? 'Publishing...' : 'Share' }}
                </button>
                <button @click="closeAddModal" class="cancel-btn" :disabled="isLoading">
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <!-- Modal de warning pour contenu bloqué -->
    <div v-if="showWarning" class="modal-overlay" @click="closeWarningModal">
        <div class="warning-modal" @click.stop>
            <div class="warning-header">
                <h3>{{ warningData?.title }}</h3>
            </div>
            
            <div class="warning-body">
                <p class="warning-message">{{ warningData?.message }}</p>
                <p class="warning-suggestion"><strong>Suggestion:</strong> {{ warningData?.suggestion }}</p>
                
                <div v-if="warningData?.helpResources?.length > 0" class="help-resources">
                    <h4>🆘 Support Resources:</h4>
                    <ul>
                        <li v-for="resource in warningData.helpResources" :key="resource">
                            {{ resource }}
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="warning-footer">
                <button @click="closeWarningModal" class="understand-btn">
                    I Understand
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiUrl, getAuthHeaders } from '../../utils/api.js'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showAddModal = ref(false)
const showWarning = ref(false)
const experienceContent = ref('')
const isLoading = ref(false)
const warningData = ref(null)

const openAddModal = () => {
    showAddModal.value = true
}

const closeAddModal = () => {
    showAddModal.value = false
    experienceContent.value = ''
    isLoading.value = false
}

const showWarningModal = (warning) => {
    warningData.value = warning
    showWarning.value = true
}

const closeWarningModal = () => {
    showWarning.value = false
    warningData.value = null
}

const shareExperience = async () => {
    if (!experienceContent.value.trim() || isLoading.value) return
    
    isLoading.value = true
    
    try {
        const response = await axios.post(
            `${getApiUrl()}/api/experiences`,
            { content: experienceContent.value },
            getAuthHeaders()
        )
        
        if (response.data.success) {
            // Post créé avec succès - rafraîchir la liste si nécessaire
        }
        
        // Fermer le modal
        closeAddModal()
        
        // Rafraîchir la liste des posts
        window.location.reload()
        
    } catch (error) {
        console.error(' Error while publishing:', error)
        
        if (error.response?.status === 401) {
            authStore.logout()
        } else if (error.response?.status === 400 && error.response?.data?.data?.blocked) {
            const warning = error.response.data.data.warning
            showWarningModal(warning)
        } else {
            alert('Error while publishing')
        }
    } finally {
        isLoading.value = false
    }
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

    transition: transform 0.2s;
}


/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 1000;
}

.modal-content {
    border-radius: 40px 40px 0px 0px;
    border: 1px solid var(--Muted-Olive, #7C7E73);
    background: var(--test-post, linear-gradient(0deg, #9C9D93 -23.87%, rgba(201, 200, 194, 0.62) 41.39%, #F6F4F0 106.65%));
    width: 100vw;
    height: 66%;
    padding: 24px;
    padding-top: 32px;
}

.modal-header {
    margin-bottom: 20%;
}

.modal-header h2 {
    color: var(--Muted-Olive, #7C7E73);
    text-align: center;
    font-family: 'Nunito';
    font-size: 17px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    margin: 0;
}

.modal-body {
    margin-bottom: 20px;
}

.experience-input {
    width: 100%;
    min-height: 120px;
    padding: 16px;
    border: 1px solid var(--Muted-Olive, #7C7E73);
    border-radius: 12px;
    background: var(--light-ivory);
    color: var(--Muted-Olive, #7C7E73);
    font-family: 'Nunito';
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    resize: vertical;

    box-sizing: border-box;
}


.modal-footer {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.share-btn {
    border-radius: 10px;
    background: var(--Muted-Olive, #7C7E73);
    color: white;
    border: none;
    padding: 12px ;
    font-family: 'Nunito';
    font-size: 16px;
    font-weight: 600;

    transition: all 0.2s;
    min-width: 100px;
}


.cancel-btn {
    border-radius: 10px;
    background: transparent;
    color: var(--light-ivory, #F6F4F0);
    border: 1px solid var(--light-ivory, #F6F4F0);
    padding: 12px ;
    font-family: 'Nunito';
    font-size: 16px;
    font-weight: 600;

    transition: all 0.2s;
    min-width: 100px;
}

    

/* Warning Modal Styles */
.warning-modal {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    padding: 24px;
    margin: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 2px solid #ff6b6b;
}

.warning-header {
    text-align: center;
    margin-bottom: 20px;
}

.warning-header h3 {
    color: #d63031;
    font-family: 'Nunito';
    font-size: 18px;
    font-weight: 700;
    margin: 0;
}

.warning-body {
    margin-bottom: 24px;
}

.warning-message {
    color: var(--Muted-Olive, #7C7E73);
    font-family: 'Nunito';
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 16px;
}

.warning-suggestion {
    color: var(--Muted-Olive, #7C7E73);
    font-family: 'Nunito';
    font-size: 14px;
    line-height: 1.4;
    background: rgba(124, 126, 115, 0.1);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
}

.help-resources {
    background: #fff5f5;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #ff6b6b;
}

.help-resources h4 {
    color: #d63031;
    font-family: 'Nunito';
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
}

.help-resources ul {
    margin: 0;
    padding-left: 20px;
}

.help-resources li {
    color: var(--Muted-Olive, #7C7E73);
    font-family: 'Nunito';
    font-size: 14px;
    margin-bottom: 8px;
}

.warning-footer {
    text-align: center;
}

.understand-btn {
    background: #d63031;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 32px;
    font-family: 'Nunito';
    font-size: 16px;
    font-weight: 600;

    transition: all 0.2s;
    min-width: 150px;
}


</style>