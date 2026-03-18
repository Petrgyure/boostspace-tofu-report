const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const SETTINGS = {
    posthog: {
        apiKey: process.env.POSTHOG_API_KEY,
        projectId: process.env.POSTHOG_PROJECT_ID,
        // CHANGED TO EU ENDPOINT
        url: `https://eu.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/query/`
    }
};

async function syncData() {
    console.log("🚀 Syncing PostHog Project 100634 (EU Region)...");
    const query = {
        "query": {
            "kind": "HogQLQuery",
            "query": "SELECT event, count(), toDate(timestamp) as day FROM events WHERE timestamp >= '2026-02-17' AND event IN ('$pageview', 'cta_click', 'form_submit', 'meeting_booked', 'leady_new_lead') GROUP BY event, day ORDER BY day DESC"
        }
    };
    try {
        const phRes = await axios.post(SETTINGS.posthog.url, query, {
            headers: { 'Authorization': `Bearer ${SETTINGS.posthog.apiKey}` }
        });
        const data = phRes.data.results.map(row => ({
            event: row[0],
            count: row[1],
            date: row[2]
        }));
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
        console.log("✅ Local data.json updated!");
        console.table(data.slice(0, 10));
    } catch (err) {
        console.error("❌ Sync Error:", err.response?.data || err.message);
    }
}
syncData();
