import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import redirectRoutes from './routes/redirect.js';
import adminProductsRoutes from './routes/admin-products.js';
import adminCategoriesRoutes from './routes/admin-categories.js';
import adminProfileRoutes from './routes/admin-profile.js';
import adminStatsRoutes from './routes/admin-stats.js';
import adminUploadRoutes from './routes/admin-upload.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin tidak diizinkan oleh CORS.'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login. Coba kembali beberapa menit lagi.' },
});

app.use('/api', standardLimiter);
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), { maxAge: '7d' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'affiliate-storefront-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/public', publicRoutes);
app.use('/r', redirectRoutes);

app.use('/api/admin/products', requireAuth, adminProductsRoutes);
app.use('/api/admin/categories', requireAuth, adminCategoriesRoutes);
app.use('/api/admin/profile', requireAuth, adminProfileRoutes);
app.use('/api/admin/stats', requireAuth, adminStatsRoutes);
app.use('/api/admin/upload', requireAuth, adminUploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
