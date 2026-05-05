import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import uploadRouter from './routes/upload.js';
import authRouter from './routes/auth.js';

const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
