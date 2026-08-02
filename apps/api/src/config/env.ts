import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  MAX_VIDEO_UPLOAD_MB: z.coerce.number().positive().default(50),
  AFFILIATE_ALLOWED_HOSTS: z.string().default(
    'shopee.co.id,shopee.com,tokopedia.com,tokopedia.link,tiktok.com,tiktokshop.com',
  ),
  IP_HASH_SALT: z.string().min(8).default('development-only-salt'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  allowedOrigins: parsed.data.CORS_ORIGIN.split(',').map((item) => item.trim()),
  affiliateAllowedHosts: parsed.data.AFFILIATE_ALLOWED_HOSTS.split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
};
