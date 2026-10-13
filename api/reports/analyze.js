import { handleAnalyzeRequest } from '../../server/apiHandlers.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  },
  maxDuration: 60
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const result = await handleAnalyzeRequest(body || {});
    return res.status(200).json(result);
  } catch (err) {
    console.error('API /api/reports/analyze error:', err.message);
    const status = err.status || 400;
    return res.status(status).json({
      error: err.message || 'Internal error analyzing medical report.'
    });
  }
}
