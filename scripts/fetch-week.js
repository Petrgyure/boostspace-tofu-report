#!/usr/bin/env node
/**
 * fetch-week.js — Fetch last week data from PostHog and append to public/data/weekly.json
 * Usage:  node scripts/fetch-week.js
 *         node scripts/fetch-week.js --week 2026-03-08   (custom start date)
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir  = dirname(fileURLToPath(import.meta.url))
const DATA   = join(__dir, '../public/data/weekly.json')
// Load .env if present
try { const { config } = await import('dotenv'); config() } catch {}
const PH_KEY = process.env.POSTHOG_API_KEY || 'phx_16gGfPCgCveVAkgID8VX1eZOxsBewot5fw5tF66XB6lQhZCl'
const PH_URL = 'https://eu.posthog.com/api/projects/100634/query'

/* ── Date range ── */
function getRange(customStart) {
  if (customStart) {
    const start = new Date(customStart)
    const end   = new Date(start); end.setDate(start.getDate() + 7)
    return range(start, end)
  }
  const today = new Date()
  const dow   = today.getDay()
  const daysBack = dow === 0 ? 6 : dow - 1
  const mon = new Date(today); mon.setDate(today.getDate() - daysBack - 7)
  const sun = new Date(mon);   sun.setDate(mon.getDate() + 6)
  const endExcl = new Date(sun); endExcl.setDate(sun.getDate() + 1)
  return range(mon, endExcl)
}

function range(mon, endExcl) {
  const fmt = d => d.toISOString().split('T')[0]
  const mo  = mon.toLocaleString('en', { month: 'short' })
  const wn  = Math.ceil(mon.getDate() / 7)
  return { start: fmt(mon), end: fmt(endExcl), label: `${mo} W${wn}` }
}

/* ── PostHog query ── */
async function ph(sql) {
  const res = await fetch(PH_URL, {
    method:  'POST',
    headers: { Authorization: `Bearer ${PH_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } })
  })
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${await res.text()}`)
  return (await res.json()).results
}

const n = v => Number(v) || 0

/* ── Main ── */
async function main() {
  const weekFlagIdx = process.argv.indexOf('--week')
  const customStart = process.argv.find(a => a.startsWith('--week='))?.split('=')[1]
               || (weekFlagIdx !== -1 ? process.argv[weekFlagIdx + 1] : undefined)
  const { start, end, label } = getRange(customStart)

  console.log(`\n⟳ Fetching PostHog data for ${label} (${start} → ${end})...\n`)

  const [traffic, cta, install, pricing, forms, oldDemo, booked, leady, ga, li] =
    await Promise.all([
      ph(`SELECT count(), count(DISTINCT person_id), count(DISTINCT $session_id) FROM events WHERE event='$pageview' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT count() FROM events WHERE event='cta_click' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT count() FROM events WHERE event='install_view' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT count() FROM events WHERE event='select_pricing_plan' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT properties.form_type, count() FROM events WHERE event='form_submit' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}' GROUP BY properties.form_type ORDER BY count() DESC`),
      ph(`SELECT count() FROM events WHERE event='be_form_submit_demo_lead' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT count() FROM events WHERE event='demo_meeting_booked' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT count() FROM events WHERE event='leady_new_lead' AND toDate(timestamp)>='${start}' AND toDate(timestamp)<'${end}'`),
      ph(`SELECT sum(metrics_impressions), sum(metrics_clicks), sum(metrics_cost_micros)/1000000, sum(metrics_conversions) FROM googleads_campaign_stats WHERE toDate(segments_date)>='${start}' AND toDate(segments_date)<'${end}'`),
      ph(`SELECT sum(impressions), sum(clicks), sum(landing_page_clicks), sum(cost_in_usd), sum(external_website_conversions) FROM linkedinads_campaign_stats WHERE toDate(date_start)>='${start}' AND toDate(date_start)<'${end}'`)
    ])

  const pv = n(traffic[0][0]), uv = n(traffic[0][1]), sess = n(traffic[0][2])
  const totalForms = forms.reduce((s, r) => s + n(r[1]), 0)
  const formMap    = Object.fromEntries(forms.map(r => [r[0], n(r[1])]))

  const week = {
    label,
    range: `${start} – ${new Date(new Date(end).getTime() - 86400000).toISOString().split('T')[0]}`,
    start, end,
    reach: {
      pageviews: pv, unique_visitors: uv, sessions: sess,
      pages_per_session: sess ? +((pv / sess).toFixed(2)) : 0
    },
    engagement: {
      cta_clicks:         n(cta[0][0]),
      cta_click_rate:     uv ? +((n(cta[0][0]) / uv * 100).toFixed(2)) : 0,
      install_views:      n(install[0][0]),
      pricing_selections: n(pricing[0][0])
    },
    leads: {
      total_forms:        totalForms,
      cvr:                uv ? +((totalForms / uv * 100).toFixed(2)) : 0,
      sign_up_lead_email: formMap.sign_up_lead_email || 0,
      sign_up:            formMap.sign_up            || 0,
      demo_lead:          formMap.demo_lead          || 0,
      callback:           formMap.callback           || 0,
      waiting_list:       formMap.waiting_list       || 0,
      newsletter:         formMap.newsletter         || 0,
      old_demo_event:     n(oldDemo[0][0])
    },
    mql: {
      demo_meeting_booked: n(booked[0][0]),
      leady_new_lead:      n(leady[0][0])
    },
    paid: {
      google: {
        impressions: n(ga[0][0]), clicks: n(ga[0][1]),
        spend_czk:   +n(ga[0][2]).toFixed(0), conversions: +n(ga[0][3]).toFixed(0)
      },
      linkedin: {
        impressions: n(li[0][0]), clicks: n(li[0][1]), lp_clicks: n(li[0][2]),
        spend_usd:   +n(li[0][3]).toFixed(0), conversions: n(li[0][4])
      }
    }
  }

  // Print summary
  console.log('✅ Reach:      PV', pv, '| UV', uv, '| Sessions', sess)
  console.log('✅ Engagement: CTA', n(cta[0][0]), '| CTR', week.engagement.cta_click_rate + '%')
  console.log('✅ Leads:     ', totalForms, 'forms | CVR', week.leads.cvr + '%')
  console.log('✅ MQL:        booked', n(booked[0][0]), '| leady', n(leady[0][0]))
  console.log('✅ Google Ads: clicks', n(ga[0][1]), '| spend', week.paid.google.spend_czk, 'CZK | conv', week.paid.google.conversions)
  console.log('✅ LinkedIn:   clicks', n(li[0][1]), '| spend $' + week.paid.linkedin.spend_usd)

  // Update weekly.json
  const existing = JSON.parse(readFileSync(DATA, 'utf8'))
  const idx = existing.weeks.findIndex(w => w.label === label)
  if (idx >= 0) {
    existing.weeks[idx] = week
    console.log(`\n⟳ Updated existing entry for ${label}`)
  } else {
    existing.weeks.push(week)
    console.log(`\n✅ Appended new entry: ${label}`)
  }
  existing._meta.updated_at  = new Date().toISOString()
  existing._meta.updated_by  = 'fetch-week-script'
  existing._meta.next_update = nextMonday()

  writeFileSync(DATA, JSON.stringify(existing, null, 2))
  console.log(`📄 Saved to ${DATA}\n`)
}

function nextMonday() {
  const d = new Date()
  const diff = (7 - d.getDay() + 1) % 7 || 7
  d.setDate(d.getDate() + diff)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
