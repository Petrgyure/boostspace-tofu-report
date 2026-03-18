<template>
  <div class="kpi-grid" v-if="latest">
    <KpiCard label="Pageviews" :value="fmt(latest.reach.pageviews)" :delta="delta('reach.pageviews')" week="latest" color="blue" />
    <KpiCard label="Unique Visitors" :value="fmt(latest.reach.unique_visitors)" :delta="delta('reach.unique_visitors')" color="blue" />
    <KpiCard label="CTA Click Rate" :value="latest.engagement.cta_click_rate + '%'" :delta="delta('engagement.cta_click_rate')" color="orange" />
    <KpiCard label="Total Forms" :value="fmt(latest.leads.total_forms)" :delta="delta('leads.total_forms')" color="green" />
    <KpiCard label="CVR" :value="latest.leads.cvr + '%'" :delta="delta('leads.cvr')" color="green" />
    <KpiCard label="Meetings Booked" :value="String(latest.mql.demo_meeting_booked)" :delta="delta('mql.demo_meeting_booked')" :critical="latest.mql.demo_meeting_booked === 0" color="red" />
    <KpiCard label="Leady Leads" :value="fmt(latest.mql.leady_new_lead)" :delta="delta('mql.leady_new_lead')" color="green" />
    <KpiCard label="Week" :value="latest.label" :sub="latest.range" color="navy" />
  </div>
  <div class="kpi-grid skeleton" v-else>
    <div class="kpi-card" v-for="i in 8" :key="i"><div class="skel"></div></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWeeksStore } from '../store.js'
import KpiCard from './KpiCard.vue'

const store  = useWeeksStore()
const latest = computed(() => store.latest)
const prev   = computed(() => store.prev)

function fmt(v) { return (v || 0).toLocaleString() }

function delta(path) {
  const cur  = getPath(store.latest, path)
  const prv  = getPath(store.prev,   path)
  if (cur == null || prv == null || prv === 0) return null
  return ((cur - prv) / prv * 100).toFixed(1)
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : null), obj)
}
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}
@media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 700px)  { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
.skel { height: 70px; background: #e2e8f0; border-radius: 8px; animation: pulse 1.2s infinite; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
</style>
