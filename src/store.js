import { defineStore } from 'pinia'

export const useWeeksStore = defineStore('weeks', {
  state: () => ({
    weeks: [],
    meta: {},
    loading: false,
    fetching: false,
    fetchResult: null,
    error: null
  }),

  getters: {
    latest: s => s.weeks[s.weeks.length - 1] || null,
    prev:   s => s.weeks[s.weeks.length - 2] || null,
    labels: s => s.weeks.map(w => w.label),

    wowDelta: s => (metric, path) => {
      const cur  = getPath(s.weeks[s.weeks.length - 1], path)
      const prev = getPath(s.weeks[s.weeks.length - 2], path)
      if (cur == null || prev == null || prev === 0) return null
      return ((cur - prev) / prev * 100).toFixed(1)
    }
  },

  actions: {
    async loadFromFile() {
      this.loading = true
      try {
        const r = await fetch('./data/weekly.json?t=' + Date.now())
        const d = await r.json()
        this.weeks = d.weeks || []
        this.meta  = d._meta || {}
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchLastWeek() {
      this.fetching = true
      this.fetchResult = null
      const { start, end, label } = lastWeekRange()
      try {
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

        const pv   = n(traffic[0][0]), uv = n(traffic[0][1]), sess = n(traffic[0][2])
        const totalForms = forms.reduce((s, r) => s + n(r[1]), 0)
        const formMap = Object.fromEntries(forms.map(r => [r[0], n(r[1])]))

        const week = {
          label, range: `${start} – ${end}`, start, end,
          reach:      { pageviews: pv, unique_visitors: uv, sessions: sess, pages_per_session: sess ? +(pv / sess).toFixed(2) : 0 },
          engagement: { cta_clicks: n(cta[0][0]), cta_click_rate: uv ? +(n(cta[0][0]) / uv * 100).toFixed(2) : 0, install_views: n(install[0][0]), pricing_selections: n(pricing[0][0]) },
          leads:      { total_forms: totalForms, cvr: uv ? +(totalForms / uv * 100).toFixed(2) : 0, sign_up_lead_email: formMap.sign_up_lead_email || 0, sign_up: formMap.sign_up || 0, demo_lead: formMap.demo_lead || 0, callback: formMap.callback || 0, waiting_list: formMap.waiting_list || 0, newsletter: formMap.newsletter || 0, old_demo_event: n(oldDemo[0][0]) },
          mql:        { demo_meeting_booked: n(booked[0][0]), leady_new_lead: n(leady[0][0]) },
          paid:       { google: { impressions: n(ga[0][0]), clicks: n(ga[0][1]), spend_czk: +n(ga[0][2]).toFixed(0), conversions: +n(ga[0][3]).toFixed(0) }, linkedin: { impressions: n(li[0][0]), clicks: n(li[0][1]), lp_clicks: n(li[0][2]), spend_usd: +n(li[0][3]).toFixed(0), conversions: n(li[0][4]) } }
        }

        // Append only if label differs from existing last week
        if (!this.weeks.find(w => w.label === label)) {
          this.weeks.push(week)
        } else {
          this.weeks[this.weeks.length - 1] = week
        }
        this.fetchResult = { ok: true, label, week }
      } catch (e) {
        this.fetchResult = { ok: false, error: e.message }
      } finally {
        this.fetching = false
      }
    }
  }
})

/* helpers */
const PH_KEY  = 'phx_16gGfPCgCveVAkgID8VX1eZOxsBewot5fw5tF66XB6lQhZCl'
const PH_BASE = 'https://eu.posthog.com/api/projects/100634/query'

async function ph(sql) {
  const r = await fetch(PH_BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PH_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } })
  })
  const d = await r.json()
  return d.results
}

function n(v) { return Number(v) || 0 }

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : null), obj)
}

function lastWeekRange() {
  const today = new Date()
  const dow = today.getDay()
  const daysToLastMon = dow === 0 ? 6 : dow - 1
  const mon = new Date(today); mon.setDate(today.getDate() - daysToLastMon - 7)
  const sun = new Date(mon);   sun.setDate(mon.getDate() + 6)
  const endExcl = new Date(sun); endExcl.setDate(sun.getDate() + 1)
  const fmt = d => d.toISOString().split('T')[0]
  const mo = mon.toLocaleString('en', { month: 'short' })
  const wn = Math.ceil(mon.getDate() / 7)
  return { start: fmt(mon), end: fmt(endExcl), label: `${mo} W${wn}` }
}
