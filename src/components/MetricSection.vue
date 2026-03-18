<template>
  <div class="card">
    <div class="card-title">{{ title }}</div>
    <table class="tbl">
      <thead>
        <tr>
          <th class="col-metric">Metric</th>
          <th v-for="w in store.weeks" :key="w.label" :class="{ 'col-latest': isLatest(w) }">
            {{ w.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label" :class="{ highlight: row.highlight, muted: row.muted }">
          <td class="col-metric">{{ row.label }}</td>
          <td
            v-for="w in store.weeks" :key="w.label"
            :class="{ 'col-latest': isLatest(w) }"
          >
            <span class="val">{{ fmtVal(getPath(w, row.path), row.fmt) }}</span>
            <span
              v-if="isLatest(w) && store.prev && delta(row.path) !== null"
              class="delta"
              :class="deltaClass(row.path, row.critical)"
            >
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

const props = defineProps({
  title: String,
  rows: Array,
})

const store = useWeeksStore()

function isLatest(w) {
  return store.latest && w.label === store.latest.label
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : null), obj)
}

function fmtVal(v, fmt) {
  if (v == null) return '—'
  if (fmt === 'pct') return v + '%'
  if (fmt === 'dec') return Number(v).toFixed(2)
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
  if (d === null) return ''
  return (d >= 0 ? '↑' : '↓') + ' ' + Math.abs(d).toFixed(1) + '%'
}

function deltaClass(path, critical) {
  const d = delta(path)
  if (d === null) return ''
  if (critical && d < 0) return 'delta-bad'
  if (critical && d >= 0) return 'delta-good'
  return d >= 0 ? 'delta-good' : 'delta-bad'
}
</script>

<style scoped>
.tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
.tbl thead th {
  background: var(--navy); color: #fff;
  padding: 6px 10px; text-align: right; font-size: 11px; font-weight: 600;
}
.tbl thead th.col-metric { text-align: left; }
.tbl thead th.col-latest { background: var(--blue); }

.tbl tbody tr:nth-child(even) td { background: #f8fafc; }
.tbl tbody tr.highlight td { font-weight: 700; }
.tbl tbody tr.muted td { color: #94a3b8; font-style: italic; }

.tbl td {
  padding: 6px 10px; border-bottom: 1px solid var(--border);
  text-align: right; vertical-align: top;
}
.tbl td.col-metric { text-align: left; color: #475569; font-size: 11px; }
.tbl td.col-latest { background: #eaf4fb; }

.val   { display: block; font-weight: 600; color: #0f172a; }
.delta { display: block; font-size: 10px; margin-top: 2px; }
.delta-good { color: var(--green); }
.delta-bad  { color: var(--red); }
</style>
