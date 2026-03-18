<template>
  <div class="overlay" @click.self="store.fetchResult = null">
    <div class="modal">
      <div class="modal-head" :class="store.fetchResult.ok ? 'ok' : 'fail'">
        <span>{{ store.fetchResult.ok ? '✅ Fetch complete' : '❌ Fetch failed' }}</span>
        <button @click="store.fetchResult = null">×</button>
      </div>
      <div class="modal-body" v-if="store.fetchResult.ok">
        <div class="week-label">{{ store.fetchResult.label }}</div>
        <div class="kpi-mini-grid">
          <div v-for="item in summary" :key="item.label" class="mini">
            <div class="ml">{{ item.label }}</div>
            <div class="mv">{{ item.value }}</div>
          </div>
        </div>
        <p class="note">Week added/updated in store. To persist: run <code>pnpm fetch</code> to update weekly.json.</p>
      </div>
      <div class="modal-body fail-body" v-else>
        <p>{{ store.fetchResult.error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWeeksStore } from '../store.js'

const store = useWeeksStore()
const w = computed(() => store.fetchResult?.week)

const summary = computed(() => w.value ? [
  { label: 'Pageviews',       value: (w.value.reach.pageviews || 0).toLocaleString() },
  { label: 'Unique',          value: (w.value.reach.unique_visitors || 0).toLocaleString() },
  { label: 'CTA Rate',        value: w.value.engagement.cta_click_rate + '%' },
  { label: 'Total Forms',     value: w.value.leads.total_forms },
  { label: 'CVR',             value: w.value.leads.cvr + '%' },
  { label: 'Booked',          value: w.value.mql.demo_meeting_booked },
  { label: 'Leady',           value: w.value.mql.leady_new_lead },
  { label: 'GA Spend',        value: (w.value.paid.google.spend_czk || 0).toLocaleString() + ' Kč' },
  { label: 'LI Spend',        value: '$' + (w.value.paid.linkedin.spend_usd || 0).toLocaleString() },
] : [])
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal   { background: #fff; border-radius: 14px; width: 100%; max-width: 520px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,.3); }
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; font-weight: 700; font-size: 14px;
}
.modal-head.ok   { background: var(--green); color: #fff; }
.modal-head.fail { background: var(--red);   color: #fff; }
.modal-head button { background: rgba(255,255,255,.25); border: none; color: #fff; width: 28px; height: 28px; border-radius: 50%; font-size: 16px; cursor: pointer; }

.modal-body { padding: 20px; }
.week-label { font-weight: 700; color: var(--navy); font-size: 16px; margin-bottom: 14px; }

.kpi-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
.mini { background: var(--bg); border-radius: 8px; padding: 10px; }
.ml   { font-size: 10px; color: var(--gray); text-transform: uppercase; letter-spacing: .4px; }
.mv   { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 2px; }

.note { font-size: 11px; color: var(--gray); background: #f8fafc; padding: 8px 12px; border-radius: 6px; }
.note code { background: #e2e8f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; }
.fail-body p { color: var(--red); font-size: 13px; }
</style>
