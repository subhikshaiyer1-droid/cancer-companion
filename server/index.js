import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import dataRoutes from './routes/data.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cancer Companion API Server is running smoothly' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', dataRoutes);

app.listen(PORT, () => {
  console.log(`[Cancer Companion Server] Listening on port ${PORT}`);
});
