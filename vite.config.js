import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

function devApiMiddleware() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const readBody = () => new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch {
              resolve({});
            }
          });
        });

        const sendJson = (statusCode, obj) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };

        try {
          const urlPath = req.url.split('?')[0];

          if (urlPath === '/api/health' && req.method === 'GET') {
            const { getApiKey } = await import('./server/apiHandlers.js');
            return sendJson(200, {
              status: 'ok',
              mode: 'vite-dev-middleware',
              hasApiKey: Boolean(getApiKey())
            });
          }

          if (urlPath === '/api/chat' && req.method === 'POST') {
            const body = await readBody();
            const { handleChatRequest } = await import('./server/apiHandlers.js');
            const result = await handleChatRequest(body);
            return sendJson(200, result);
          }

          if (urlPath === '/api/reports/analyze' && req.method === 'POST') {
            const body = await readBody();
            const { handleAnalyzeRequest } = await import('./server/apiHandlers.js');
            const result = await handleAnalyzeRequest(body);
            return sendJson(200, result);
          }

          return next();
        } catch (err) {
          console.error('Vite dev API middleware error:', err);
          return sendJson(err.status || 400, { error: err.message || 'API Request Failed' });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), devApiMiddleware()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    open: true
  }
});
