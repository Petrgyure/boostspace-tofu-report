/**
 * Lightweight PostHog proxy — runs inside Docker alongside Grafana
 * Grafana (or any client) → http://localhost:4000/query → PostHog EU
 *
 * Start: node server.js
 * Env:   POSTHOG_API_KEY, POSTHOG_PROJECT, POSTHOG_BASE_URL
 */
const http = require('http');
const https = require('https');

const PORT     = process.env.PORT             || 4000;
const API_KEY  = process.env.POSTHOG_API_KEY  || '';
const PROJECT  = process.env.POSTHOG_PROJECT  || '100634';
const BASE_URL = process.env.POSTHOG_BASE_URL || 'https://eu.posthog.com';

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'POST' && req.url === '/query') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const target = new URL(`/api/projects/${PROJECT}/query`, BASE_URL);
      const options = {
        hostname: target.hostname,
        path:     target.pathname,
        method:   'POST',
        headers: {
          'Authorization':  `Bearer ${API_KEY}`,
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const proxy = https.request(options, phRes => {
        res.writeHead(phRes.statusCode, { 'Content-Type': 'application/json' });
        phRes.pipe(res);
      });

      proxy.on('error', err => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxy.write(body);
      proxy.end();
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', project: PROJECT }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`PostHog proxy running on port ${PORT}`);
  console.log(`Project: ${PROJECT} | Base: ${BASE_URL}`);
});
