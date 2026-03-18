<template>
  <div class="app">
    <AppHeader />
    <main class="main">
      <KpiGrid />
      <TrendChart />
      <div class="grid-3">
        <MetricSection title="Layer 1 — Reach" :rows="reachRows" />
        <MetricSection title="Layer 2 — Engagement" :rows="engRows" />
        <MetricSection title="Layer 3 — Leads" :rows="leadsRows" />
      </div>
      <div class="grid-2">
        <MetricSection title="Layer 4 — MQL" :rows="mqlRows" />
        <PaidSection />
      </div>
    </main>
    <FetchModal v-if="store.fetchResult" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useWeeksStore } from './store.js'
import AppHeader     from './components/AppHeader.vue'
import KpiGrid       from './components/KpiGrid.vue'
import TrendChart    from './components/TrendChart.vue'
import MetricSection from './components/MetricSection.vue'
import PaidSection   from './components/PaidSection.vue'
import FetchModal    from './components/FetchModal.vue'

const store = useWeeksStore()
onMounted(() => store.loadFromFile())

const reachRows = computed(() => [
  { label: 'Pageviews',        path: 'reach.pageviews',        fmt: 'num' },
  { label: 'Unique Visitors',  path: 'reach.unique_visitors',  fmt: 'num' },
  { label: 'Sessions',         path: 'reach.sessions',         fmt: 'num' },
  { label: 'Pages / Session',  path: 'reach.pages_per_session',fmt: 'dec' },
])

const engRows = computed(() => [
  { label: 'CTA Clicks',          path: 'engagement.cta_clicks',          fmt: 'num' },
  { label: 'CTA Click Rate',      path: 'engagement.cta_click_rate',      fmt: 'pct' },
  { label: 'Install Views',       path: 'engagement.install_views',       fmt: 'num' },
  { label: 'Pricing Selections',  path: 'engagement.pricing_selections',  fmt: 'num' },
])

const leadsRows = computed(() => [
  { label: 'Total Forms',          path: 'leads.total_forms',          fmt: 'num', highlight: true },
  { label: 'CVR',                  path: 'leads.cvr',                  fmt: 'pct' },
  { label: 'sign_up_lead_email',   path: 'leads.sign_up_lead_email',   fmt: 'num' },
  { label: 'sign_up',              path: 'leads.sign_up',              fmt: 'num' },
  { label: 'demo_lead',            path: 'leads.demo_lead',            fmt: 'num' },
  { label: 'callback',             path: 'leads.callback',             fmt: 'num' },
  { label: 'waiting_list',         path: 'leads.waiting_list',         fmt: 'num' },
  { label: 'newsletter',           path: 'leads.newsletter',           fmt: 'num' },
  { label: 'old demo event',       path: 'leads.old_demo_event',       fmt: 'num', muted: true },
])

const mqlRows = computed(() => [
  { label: 'demo_meeting_booked', path: 'mql.demo_meeting_booked', fmt: 'num', critical: true },
  { label: 'leady_new_lead',      path: 'mql.leady_new_lead',      fmt: 'num', highlight: true },
])
</script>

<style>
:root {
  --navy:  #1b3a5c;
  --blue:  #2e75b6;
  --lb:    #d5e8f0;
  --green: #27ae60;
  --red:   #c00000;
  --org:   #e67e22;
  --gray:  #64748b;
  --bg:    #f1f5f9;
  --card:  #ffffff;
  --border:#dde3ec;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: #1e293b; font-size: 13px; }
.app  { min-height: 100vh; }
.main { max-width: 1400px; margin: 0 auto; padding: 24px 20px 80px; display: flex; flex-direction: column; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card   { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; }
.card-title { font-size: 12px; font-weight: 700; color: var(--navy); text-transform: uppercase; letter-spacing: .6px; margin-bottom: 14px; border-left: 3px solid var(--blue); padding-left: 8px; }
@media (max-width: 960px) { .grid-3 { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
</style>
