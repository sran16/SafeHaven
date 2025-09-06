<template>
  <div class="mood-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  moodData: { type: Array, required: true }
})

const chartCanvas = ref(null)
let chart = null

// Configuration des humeurs
const MOOD_CONFIG = {
  angry: { value: 1, emoji: '😡', label: 'En colère' },
  sad: { value: 2, emoji: '😢', label: 'Triste' },
  neutral: { value: 3, emoji: '😐', label: 'Neutre' },
  calm: { value: 4, emoji: '🙂', label: 'Calme' },
  happy: { value: 5, emoji: '😄', label: 'Heureux' }
}

const getMoodValue = (moodType) => MOOD_CONFIG[moodType]?.value || 3
const getMoodEmoji = (moodType) => MOOD_CONFIG[moodType]?.emoji || '😐'
const getMoodLabel = (moodType) => MOOD_CONFIG[moodType]?.label || 'Neutre'

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })
}

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')

  // Création du dégradé
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(124,126,115,0.25)')
  gradient.addColorStop(1, 'rgba(124,126,115,0.02)')

  const labels = props.moodData.map(entry => 
    formatDate(entry.dateRegistration || entry.createdAt)
  )

  const data = props.moodData.map(entry => 
    getMoodValue(entry.moodType)
  )

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Humeur',
        data,
        borderColor: '#7C7E73',
        backgroundColor: gradient,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#7C7E73',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          backgroundColor: '#7C7E73',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: (ctx) => {
              const moodType = props.moodData[ctx.dataIndex].moodType
              return `${getMoodEmoji(moodType)} ${getMoodLabel(moodType)}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(124,126,115,0.08)' },
          ticks: { color: '#7C7E73', font: { size: 12 } }
        },
        y: {
          min: 1,
          max: 5,
          grid: { color: 'rgba(124,126,115,0.08)' },
          ticks: {
            stepSize: 1,
            color: '#7C7E73',
            font: { size: 12 },
            callback: (value) => MOOD_CONFIG[Object.keys(MOOD_CONFIG)[value - 1]]?.emoji || '😐'
          }
        }
      }
    }
  })
}

watch(() => props.moodData, () => {
  if (props.moodData?.length) {
    createChart()
  }
}, { deep: true })

onMounted(() => {
  if (props.moodData?.length) {
    createChart()
  }
})
</script>

<style scoped>
.mood-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
