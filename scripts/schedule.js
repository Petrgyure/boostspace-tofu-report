#!/usr/bin/env node
/**
 * schedule.js — Run fetch-week.js every Monday at 09:00
 * Usage:  node scripts/schedule.js
 *         Keep running in background (pm2 / screen / tmux)
 *
 * Requires: node-cron  (already in devDependencies)
 */

import cron from 'node-cron'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir  = dirname(fileURLToPath(import.meta.url))
const FETCH  = join(__dir, 'fetch-week.js')

console.log('📅 Scheduler started — fetch runs every Monday at 09:00')
console.log('   Press Ctrl+C to stop\n')

// Cron: second minute hour dayOfMonth month dayOfWeek
// "0 9 * * 1"  = At 09:00 on Monday
cron.schedule('0 9 * * 1', () => {
  const now = new Date().toISOString()
  console.log(`\n[${now}] ⟳ Starting weekly fetch...`)
  try {
    execSync(`node ${FETCH}`, { stdio: 'inherit' })
    console.log(`[${now}] ✅ Fetch complete`)
  } catch (e) {
    console.error(`[${now}] ❌ Fetch failed:`, e.message)
  }
}, {
  timezone: 'Europe/Prague'
})

// Optional: run immediately on start with --now flag
if (process.argv.includes('--now')) {
  console.log('--now flag detected — running fetch immediately...\n')
  try {
    execSync(`node ${FETCH}`, { stdio: 'inherit' })
  } catch (e) {
    console.error('❌', e.message)
  }
}
