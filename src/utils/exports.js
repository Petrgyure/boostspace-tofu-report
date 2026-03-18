import jsPDF from 'jspdf'
import 'jspdf-autotable'

/* ── CSV ── */
export function exportCSV(weeks) {
  const rows = []

  rows.push(['BOOST.SPACE — TOFU Marketing Report'])
  rows.push([`Generated: ${new Date().toISOString().slice(0, 10)}`])
  rows.push([])

  // Header row
  rows.push(['Metric', ...weeks.map(w => w.label)])

  const add = (label, fn) => rows.push([label, ...weeks.map(w => fn(w) ?? '')])

  rows.push(['--- REACH ---'])
  add('Pageviews',        w => w.reach.pageviews)
  add('Unique Visitors',  w => w.reach.unique_visitors)
  add('Sessions',         w => w.reach.sessions)
  add('Pages / Session',  w => w.reach.pages_per_session)

  rows.push(['--- ENGAGEMENT ---'])
  add('CTA Clicks',       w => w.engagement.cta_clicks)
  add('CTA Click Rate %', w => w.engagement.cta_click_rate)
  add('Install Views',    w => w.engagement.install_views)
  add('Pricing Selections', w => w.engagement.pricing_selections)

  rows.push(['--- LEADS ---'])
  add('Total Forms',            w => w.leads.total_forms)
  add('CVR %',                  w => w.leads.cvr)
  add('sign_up_lead_email',     w => w.leads.sign_up_lead_email)
  add('sign_up',                w => w.leads.sign_up)
  add('demo_lead',              w => w.leads.demo_lead)
  add('callback',               w => w.leads.callback)
  add('waiting_list',           w => w.leads.waiting_list)
  add('newsletter',             w => w.leads.newsletter)
  add('be_form_submit (old)',   w => w.leads.old_demo_event)

  rows.push(['--- MQL ---'])
  add('demo_meeting_booked', w => w.mql.demo_meeting_booked)
  add('leady_new_lead',      w => w.mql.leady_new_lead)

  rows.push(['--- PAID: GOOGLE ADS ---'])
  add('GA Impressions', w => w.paid.google.impressions)
  add('GA Clicks',      w => w.paid.google.clicks)
  add('GA Spend CZK',   w => w.paid.google.spend_czk)
  add('GA Conversions', w => w.paid.google.conversions)

  rows.push(['--- PAID: LINKEDIN ---'])
  add('LI Impressions', w => w.paid.linkedin.impressions)
  add('LI Clicks',      w => w.paid.linkedin.clicks)
  add('LI LP Clicks',   w => w.paid.linkedin.lp_clicks)
  add('LI Spend USD',   w => w.paid.linkedin.spend_usd)
  add('LI Conversions', w => w.paid.linkedin.conversions)

  const csv = rows.map(r => r.map(cell =>
    String(cell ?? '').includes(',') ? `"${cell}"` : cell
  ).join(',')).join('\n')

  download(`tofu-report-${today()}.csv`, 'text/csv', csv)
}

/* ── PDF ── */
export function exportPDF(weeks) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const navy = [27, 58, 92], blue = [46, 117, 182], green = [39, 174, 96], red = [192, 0, 0]

  // Title
  doc.setFillColor(...navy)
  doc.rect(0, 0, 297, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('BOOST.SPACE — TOFU Marketing Report', 14, 13)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${today()} | Weeks: ${weeks.map(w => w.label).join(', ')}`, 14, 19.5)
  doc.setTextColor(0, 0, 0)

  let y = 28

  const section = (title) => {
    doc.setFillColor(...blue)
    doc.rect(0, y, 297, 7, 'F')
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold')
    doc.text(title, 6, y + 5)
    doc.setTextColor(0,0,0)
    y += 9
  }

  const table = (head, body) => {
    doc.autoTable({
      startY: y,
      head: [head],
      body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 6, right: 6 },
      theme: 'striped'
    })
    y = doc.lastAutoTable.finalY + 5
  }

  const cols = weeks.map(w => w.label)
  const row = (label, fn) => [label, ...weeks.map(w => fmt(fn(w)))]

  section('REACH & ENGAGEMENT')
  table(
    ['Metric', ...cols],
    [
      row('Pageviews',           w => w.reach.pageviews),
      row('Unique Visitors',     w => w.reach.unique_visitors),
      row('Sessions',            w => w.reach.sessions),
      row('Pages / Session',     w => w.reach.pages_per_session),
      row('CTA Clicks',          w => w.engagement.cta_clicks),
      row('CTA Click Rate %',    w => w.engagement.cta_click_rate),
      row('Install Views',       w => w.engagement.install_views),
      row('Pricing Selections',  w => w.engagement.pricing_selections),
    ]
  )

  section('LEADS & MQL')
  table(
    ['Metric', ...cols],
    [
      row('Total Forms',         w => w.leads.total_forms),
      row('CVR %',               w => w.leads.cvr),
      row('sign_up_lead_email',  w => w.leads.sign_up_lead_email),
      row('sign_up',             w => w.leads.sign_up),
      row('demo_lead',           w => w.leads.demo_lead),
      row('callback',            w => w.leads.callback),
      row('demo_meeting_booked', w => w.mql.demo_meeting_booked),
      row('leady_new_lead',      w => w.mql.leady_new_lead),
    ]
  )

  section('PAID CHANNELS')
  table(
    ['Platform / Metric', ...cols],
    [
      row('Google — Impressions', w => w.paid.google.impressions),
      row('Google — Clicks',      w => w.paid.google.clicks),
      row('Google — Spend CZK',   w => w.paid.google.spend_czk),
      row('Google — Conv.',       w => w.paid.google.conversions),
      row('LinkedIn — Impressions', w => w.paid.linkedin.impressions),
      row('LinkedIn — Clicks',    w => w.paid.linkedin.clicks),
      row('LinkedIn — Spend USD', w => w.paid.linkedin.spend_usd),
      row('LinkedIn — Conv.',     w => w.paid.linkedin.conversions),
    ]
  )

  doc.save(`tofu-report-${today()}.pdf`)
}

/* ── Google Sheets ── */
export function exportGoogleSheets(weeks) {
  // Build TSV (tab-separated) for paste into Sheets
  const rows = [['Metric', ...weeks.map(w => w.label)]]
  const add  = (label, fn) => rows.push([label, ...weeks.map(w => fn(w) ?? '')])

  add('Pageviews',         w => w.reach.pageviews)
  add('Unique Visitors',   w => w.reach.unique_visitors)
  add('Sessions',          w => w.reach.sessions)
  add('CTA Click Rate %',  w => w.engagement.cta_click_rate)
  add('Total Forms',       w => w.leads.total_forms)
  add('CVR %',             w => w.leads.cvr)
  add('demo_meeting_booked', w => w.mql.demo_meeting_booked)
  add('leady_new_lead',    w => w.mql.leady_new_lead)
  add('Google Spend CZK',  w => w.paid.google.spend_czk)
  add('LinkedIn Spend USD', w => w.paid.linkedin.spend_usd)

  const tsv = rows.map(r => r.join('\t')).join('\n')
  navigator.clipboard.writeText(tsv).catch(() => {})

  // Open a new empty Google Sheet
  window.open('https://docs.google.com/spreadsheets/create', '_blank')
  return tsv
}

/* helpers */
function today() { return new Date().toISOString().slice(0, 10) }
function fmt(v)  { return v == null ? '' : v.toLocaleString() }
function download(name, mime, content) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: mime }))
  a.download = name
  a.click()
}
