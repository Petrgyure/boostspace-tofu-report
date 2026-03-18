<template>
  <div class="kpi-card" :class="[`kpi-${color}`, { critical }]">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value">{{ value }}</div>
    <div class="kpi-sub" v-if="sub">{{ sub }}</div>
    <div class="kpi-delta" v-if="delta !== null">
      <span :class="deltaDir">{{ deltaDir === 'up' ? '↑' : '↓' }} {{ Math.abs(delta) }}% WoW</span>
    </div>
    <div class="critical-tag" v-if="critical">CRITICAL</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  label: String, value: String, delta: { default: null },
  sub: String, color: { default: 'blue' }, critical: Boolean
})
const deltaDir = computed(() => props.delta >= 0 ? 'up' : 'dn')
</script>

<style scoped>
.kpi-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  padding: 14px 16px; position: relative; overflow: hidden;
}
.kpi-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.kpi-blue::before   { background: var(--blue); }
.kpi-green::before  { background: var(--green); }
.kpi-orange::before { background: var(--org); }
.kpi-red::before    { background: var(--red); }
.kpi-navy::before   { background: var(--navy); }

.kpi-label { font-size: 10px; font-weight: 600; color: var(--gray); text-transform: uppercase; letter-spacing: .5px; }
.kpi-value { font-size: 22px; font-weight: 700; color: #0f172a; margin: 4px 0 2px; line-height: 1.1; }
.kpi-sub   { font-size: 10px; color: var(--gray); }
.kpi-delta { margin-top: 4px; font-size: 11px; font-weight: 600; }
.up  { color: var(--green); }
.dn  { color: var(--red); }

.critical .kpi-value { color: var(--red); }
.critical-tag {
  position: absolute; top: 8px; right: 8px;
  background: var(--red); color: #fff;
  font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
}
</style>
