/**
 * Vercel Serverless Function — PostHog Proxy
 * Keeps API key server-side. Dashboard calls /api/posthog instead of eu.posthog.com directly.
 *
 * Env var required: POSTHOG_API_KEY (set in Vercel dashboard)
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.POSTHOG_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'PostHog API key not configured' });
  }

  try {
    const response = await fetch(
      'https://eu.posthog.com/api/projects/100634/query',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    // Forward status and response
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
