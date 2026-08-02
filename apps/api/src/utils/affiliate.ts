import { env } from '../config/env.js';
import { AppError } from './app-error.js';

export function assertAllowedAffiliateUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new AppError(400, 'Link affiliate tidak valid.');
  }

  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new AppError(400, 'Link affiliate harus menggunakan HTTP atau HTTPS.');
  }

  const hostname = url.hostname.toLowerCase();
  const allowed = env.affiliateAllowedHosts.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );

  if (!allowed) {
    throw new AppError(
      400,
      `Domain link affiliate tidak diizinkan. Domain yang didukung: ${env.affiliateAllowedHosts.join(', ')}`,
    );
  }

  return url.toString();
}
