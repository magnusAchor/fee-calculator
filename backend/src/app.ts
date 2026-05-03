import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { verifyWixInstance } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import rulesRouter from './routes/rules';
import calculateRouter from './routes/calculate';

const app = express();

// Trust Vercel proxy
app.set('trust proxy', 1);

// CORS — allow Wix origins in production
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Health check — no auth required
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// All API routes require Wix instance verification
app.use('/api', verifyWixInstance);
app.use('/api/rules', rulesRouter);
app.use('/api/calculate', calculateRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Fee Calculator API running on port ${PORT}`);
});

export default app;