import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

//teste de comentario

import webhook from './routes/webhook.js';
import avaliacao from './routes/avaliacao.js';
import listenTicketClosed from './controllers/ticketClosedListener.js';
import { login } from './api-logidoc/index.js';

// ─── APP INITIALIZATION ─────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ?? 4001;

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// rate limiter: 1 request per 2.5s per IP
const limiter = rateLimit({
  windowMs: 1.0 * 1000,
  limit: 1,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(cors());

// ─── ROUTES ─────────────────────────────────────────────────────────────────────
app.post('/webhook', webhook);
app.post('/avaliacao', avaliacao);

// Healthcheck
app.get('/', (req, res) => {
  res.send('✅ API server is up');
});

// ─── EVENT LISTENERS ────────────────────────────────────────────────────────────
listenTicketClosed();

// ─── LOGIDOC LOGIN ──────────────────────────────────────────────────────────────
await login();

// ─── START SERVER ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
});