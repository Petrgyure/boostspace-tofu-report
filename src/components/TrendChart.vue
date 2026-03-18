<template>
  <div class="card">
    <div class="card-title">4-Week Trend</div>
    <div class="chart-row">
      <div class="chart-wrap">
        <canvas ref="canvasRef"></canvas>
      </div>
      <div class="legend">
        <div class="legend-item" v-for="s in series" :key="s.key">
          <span class="dot" :style="{ background: s.color }"></span>{{ s.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useWeeksStore } from '../store.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const store     = useWeeksStore()
const canvasRef = ref(null)
let chart       = null

const series = [
  { key: 'reach.unique_visitors', label: 'Unique Visitors', color: '#2e75b6' },
  { key: 'leads.total_forms',     label: 'Total Forms',     color: '#27ae60' },
  { key: 'engagement.cta_clicks', label: 'CTA Clicks',      color: '#e67e22' },
  { key: 'mql.leady_new_lead',    label: 'Leady Leads',     color: '#8e44ad' },
]

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : null), obj)
}

function buildChart() {
  if (!canvasRef.value || !store.weeks.length) return
  const labels  = store.weeks.map(w => w.label)
  const datasets = series.map(s => ({
    label:           s.label,
    data:            store.weeks.map(w => getPath(w, s.key) || 0),
    backgroundColor: s.color + 'cc',
    borderColor:     s.color,
    borderWidth:     1,
    borderRadius:    4,
  }))

  if (chart) { chart.destroy() }
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 11 } } }
      }
    }
  })
}

onMounted(() => { if (store.weeks.length) buildChart() })
watch(() => store.weeks.length, buildChart)
</script>

<style scoped>
.chart-row  { display: flex; gap: 16px; align-items: flex-start; }
.chart-wrap { flex: 1; height: 200px; }
.legend     { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; min-width: 130px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; }
.dot        { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
</style>
