import crypto from 'node:crypto';
import { env } from '../config/env.js';

export function hashIp(ip?: string): string | null {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`${ip}:${env.IP_HASH_SALT}`).digest('hex');
}
