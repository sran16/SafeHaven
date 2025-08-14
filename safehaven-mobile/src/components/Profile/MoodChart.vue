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

const moodTypeToValue = (moodType) => ({ angry:1, sad:2, neutral:3, calm:4, happy:5 }[moodType] ?? 3)
const moodTypeToEmoji = (moodType) => ({ angry:'😡', sad:'😢', neutral:'😐', calm:'🙂', happy:'😄' }[moodType] ?? '😐')
const moodTypeToLabel = (moodType) => ({ angry:'En colère', sad:'Triste', neutral:'Neutre', calm:'Calme', happy:'Heureux' }[moodType] ?? 'Neutre')

const createChart = () => {
  if (chart) chart.destroy()
  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')

  // Dégradé olive → transparent
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(124,126,115,0.25)') // olive clair
  gradient.addColorStop(1, 'rgba(124,126,115,0.02)')

  const labels = props.moodData.map(entry => {
    const d = new Date(entry.dateRegistration || entry.createdAt)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  })

  const data = props.moodData.map(entry => moodTypeToValue(entry.moodType))

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
              const i = ctx.dataIndex
              const moodType = props.moodData[i].moodType
              return `${moodTypeToEmoji(moodType)} ${moodTypeToLabel(moodType)}`
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
            callback: (v) => ({1:'😡',2:'😢',3:'😐',4:'🙂',5:'😄'}[v])
          }
        }
      }
    }
  })
}

watch(() => props.moodData, (val) => { if (val?.length) createChart() }, { deep: true })

onMounted(() => { if (props.moodData?.length) createChart() })
</script>

<style scoped>
.mood-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
