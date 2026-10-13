import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChatRequest, handleAnalyzeRequest, getApiKey } from './apiHandlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    hasApiKey: Boolean(getApiKey())
  });
});

// Conversational AI Assistant endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const result = await handleChatRequest(req.body);
    return res.json(result);
  } catch (err) {
    console.error('API /api/chat error:', err);
    const status = err.status || (err.name === 'AbortError' ? 504 : 500);
    return res.status(status).json({
      error: err.message || 'Internal server error processing AI chat.'
    });
  }
});

// Report Analysis endpoint
app.post('/api/reports/analyze', async (req, res) => {
  try {
    const result = await handleAnalyzeRequest(req.body);
    return res.json(result);
  } catch (err) {
    console.error('API /api/reports/analyze error:', err);
    return res.status(400).json({
      error: err.message || 'Internal error analyzing medical report.'
    });
  }
});

// Serve frontend in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Cancer Companion Backend Server running on http://localhost:${PORT}`);
});
