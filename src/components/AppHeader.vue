<template>
  <header class="header">
    <div class="header-left">
      <div class="logo">BOOST.SPACE</div>
      <div class="subtitle">TOFU Marketing Report</div>
      <div class="meta">
        <span>{{ store.weeks.length }} weeks</span>
        <span v-if="store.meta.updated_at"> · Updated {{ store.meta.updated_at.slice(0,10) }}</span>
        <span class="live-dot" v-if="store.weeks.length">● live</span>
      </div>
    </div>

    <div class="header-right">
      <button class="btn btn-fetch" :disabled="store.fetching" @click="store.fetchLastWeek()">
        <span class="spin" v-if="store.fetching">⟳</span>
        <span v-else>⟳</span>
        {{ store.fetching ? 'Fetching…' : 'Fetch Last Week' }}
      </button>
      <button class="btn btn-pdf"    @click="pdf"    :disabled="!store.weeks.length">PDF</button>
      <button class="btn btn-csv"    @click="csv"    :disabled="!store.weeks.length">CSV</button>
      <button class="btn btn-sheets" @click="sheets" :disabled="!store.weeks.length">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right:4px"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        Sheets
      </button>
    </div>
  </header>

  <div v-if="sheetsMsg" class="sheets-toast" @click="sheetsMsg=''">
    📋 Data copied to clipboard — paste into Google Sheets (Ctrl+V / ⌘V). <strong>Click to dismiss.</strong>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWeeksStore } from '../store.js'
import { exportPDF, exportCSV, exportGoogleSheets } from '../utils/exports.js'

const store = useWeeksStore()
const sheetsMsg = ref(false)

function pdf()    { exportPDF(store.weeks) }
function csv()    { exportCSV(store.weeks) }
function sheets() {
  exportGoogleSheets(store.weeks)
  sheetsMsg.value = true
  setTimeout(() => sheetsMsg.value = false, 8000)
}
</script>

<style scoped>
.header {
  background: var(--navy);
  color: #fff;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0,0,0,.2);
}
.logo    { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
.subtitle { font-size: 13px; color: #aac4de; margin-top: 2px; }
.meta    { font-size: 11px; color: #7fa8c8; margin-top: 4px; display: flex; gap: 6px; }
.live-dot { color: #4ade80; font-weight: 700; }

.header-right { display: flex; gap: 8px; flex-wrap: wrap; }

.btn {
  padding: 8px 16px; border: none; border-radius: 8px;
  font-size: 12px; font-weight: 700; cursor: pointer;
  transition: opacity .15s; display: flex; align-items: center; gap: 4px;
}
.btn:disabled { opacity: .45; cursor: default; }
.btn-fetch  { background: var(--blue); color: #fff; }
.btn-fetch:not(:disabled):hover { background: #1a5a9e; }
.btn-pdf    { background: #e74c3c; color: #fff; }
.btn-pdf:not(:disabled):hover { background: #c0392b; }
.btn-csv    { background: var(--green); color: #fff; }
.btn-csv:not(:disabled):hover { background: #1e8449; }
.btn-sheets { background: #34a853; color: #fff; }
.btn-sheets:not(:disabled):hover { background: #2d8f47; }

.spin { display: inline-block; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.sheets-toast {
  background: #34a853; color: #fff;
  padding: 10px 20px; text-align: center; font-size: 13px;
  cursor: pointer;
}
</style>
