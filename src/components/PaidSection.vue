<template>
  <div class="card">
    <div class="card-title">Paid Channels</div>

    <div class="platform-label google">Google Ads</div>
    <table class="tbl">
      <thead>
        <tr>
          <th class="col-m">Metric</th>
          <th v-for="w in store.weeks" :key="w.label" :class="{ latest: isLatest(w) }">{{ w.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in gaRows" :key="row.label">
          <td class="col-m">{{ row.label }}</td>
          <td v-for="w in store.weeks" :key="w.label" :class="{ latest: isLatest(w) }">
            {{ fmtVal(getPath(w, row.path), row.fmt) }}
            <span v-if="isLatest(w) && delta(row.path)" class="d" :class="row.invert ? deltaClass(row.path, true) : deltaClass(row.path)">
              {{ deltaLabel(row.path) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="platform-label linkedin" style="margin-top:14px">LinkedIn Ads</div>
    <table class="tbl">
      <thead>
        <tr>
          <th class="col-m">Metric</th>
          <th v-for="w in store.weeks" :key="w.label" :class="{ latest: isLatest(w) }">{{ w.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in liRows" :key="row.label">
          <td class="col-m">{{ row.label }}</td>
          <td v-for="w in store.weeks" :key="w.label" :class="{ latest: isLatest(w) }">
            {{ fmtVal(getPath(w, row.path), row.fmt) }}
            <span v-if="isLatest(w) && delta(row.path)" class="d" :class="deltaClass(row.path)">
              {{ deltaLabel(row.path) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useWeeksStore } from '../store.js'

const store = useWeeksStore()

const gaRows = [
  { label: 'Impressions', path: 'paid.google.impressions', fmt: 'num' },
  { label: 'Clicks',      path: 'paid.google.clicks',      fmt: 'num' },
  { label: 'Spend CZK',   path: 'paid.google.spend_czk',   fmt: 'czk' },
  { label: 'Conv.',       path: 'paid.google.conversions',  fmt: 'num' },
]

const liRows = [
  { label: 'Impressions', path: 'paid.linkedin.impressions', fmt: 'num' },
  { label: 'Clicks',      path: 'paid.linkedin.clicks',      fmt: 'num' },
  { label: 'LP Clicks',   path: 'paid.linkedin.lp_clicks',   fmt: 'num' },
  { label: 'Spend USD',   path: 'paid.linkedin.spend_usd',   fmt: 'usd' },
  { label: 'Conv.',       path: 'paid.linkedin.conversions',  fmt: 'num' },
]

function isLatest(w) { return store.latest?.label === w.label }

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : null), obj)
}

function fmtVal(v, fmt) {
  if (v == null) return '—'
  if (fmt === 'czk') return Number(v).toLocaleString() + ' Kč'
  if (fmt === 'usd') return '$' + Number(v).toLocaleString()
  return Number(v).toLocaleString()
}

function delta(path) {
  const cur  = getPath(store.latest, path)
  const prev = getPath(store.prev,   path)
  if (cur == null || prev == null || prev === 0) return null
  return ((cur - prev) / prev * 100)
}

function deltaLabel(path) {
  const d = delta(path)
  if (!d) return ''
  return (d >= 0 ? '↑' : '↓') + ' ' + Math.abs(d).toFixed(1) + '%'
}

function deltaClass(path, goodIsDown = false) {
  const d = delta(path)
  if (d === null) return ''
  const good = goodIsDown ? d < 0 : d >= 0
  return good ? 'dg' : 'db'
}
</script>

<style scoped>
.platform-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px; padding: 4px 8px; border-radius: 4px;
  display: inline-block; margin-bottom: 8px;
}
.google   { background: #fce8e6; color: #c5221f; }
.linkedin { background: #e8f0fe; color: #1558d6; }

.tbl { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 4px; }
.tbl th {
  background: var(--navy); color: #fff;
  padding: 5px 8px; text-align: right; font-size: 10px;
}
.tbl th.col-m { text-align: left; }
.tbl th.latest { background: var(--blue); }
.tbl td {
  padding: 5px 8px; border-bottom: 1px solid var(--border);
  text-align: right; font-size: 11px;
}
.tbl td.col-m { text-align: left; color: #475569; }
.tbl td.latest { background: #eaf4fb; }
.tbl tr:nth-child(even) td { background: #f8fafc; }
.tbl tr:nth-child(even) td.latest { background: #ddeef8; }
.d   { display: block; font-size: 10px; margin-top: 1px; }
.dg  { color: var(--green); font-weight: 600; }
.db  { color: var(--red);   font-weight: 600; }
</style>
