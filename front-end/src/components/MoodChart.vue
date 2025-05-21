<template>
  <div class="mood-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  moodData: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)
let chart = null

const moodTypeToValue = (moodType) => {
  switch (moodType) {
    case 'angry': return 1;
    case 'sad': return 2;
    case 'neutral': return 3;
    case 'calm': return 4;
    case 'happy': return 5;
    default: return 3;
  }
}

const moodTypeToEmoji = (moodType) => {
  switch (moodType) {
    case 'angry': return '😡';
    case 'sad': return '😢';
    case 'neutral': return '😐';
    case 'calm': return '🙂';
    case 'happy': return '😄';
    default: return '😐';
  }
}

const moodTypeToLabel = (moodType) => {
  switch (moodType) {
    case 'angry': return 'En colère';
    case 'sad': return 'Triste';
    case 'neutral': return 'Neutre';
    case 'calm': return 'Calme';
    case 'happy': return 'Heureux';
    default: return 'Neutre';
  }
}

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  // Préparer les données pour le graphique
  const labels = props.moodData.map(entry => {
    const date = new Date(entry.dateRegistration)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  })
  
  const data = props.moodData.map(entry => moodTypeToValue(entry.moodType))
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Humeur',
        data: data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: props.moodData.map(entry => {
          switch (entry.moodType) {
            case 'angry': return '#e57373';
            case 'sad': return '#64b5f6';
            case 'neutral': return '#ffd54f';
            case 'calm': return '#81c784';
            case 'happy': return '#ffb74d';
            default: return '#bdbdbd';
          }
        })
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const moodType = props.moodData[index].moodType;
              const emoji = moodTypeToEmoji(moodType);
              const label = moodTypeToLabel(moodType);
              return `${emoji} ${label}`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              switch(value) {
                case 1: return '😡';
                case 2: return '😢';
                case 3: return '😐';
                case 4: return '🙂';
                case 5: return '😄';
              }
            }
          }
        }
      }
    }
  })
}

watch(() => props.moodData, () => {
  if (props.moodData.length > 0) {
    createChart()
  }
}, { deep: true })

onMounted(() => {
  if (props.moodData.length > 0) {
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