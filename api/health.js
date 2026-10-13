import { getApiKey } from '../server/apiHandlers.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    hasApiKey: Boolean(getApiKey())
  });
}
