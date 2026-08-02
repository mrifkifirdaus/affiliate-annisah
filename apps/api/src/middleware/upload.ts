import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const imageMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const videoMimeTypes = new Map([
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
]);

function createStorage(allowedMimeTypes: Map<string, string>) {
  return multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const extension = allowedMimeTypes.get(file.mimetype) ?? path.extname(file.originalname);
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  });
}

export const uploadImage = multer({
  storage: createStorage(imageMimeTypes),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!imageMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, 'Format gambar harus JPG, PNG, WEBP, atau GIF.'));
      return;
    }
    callback(null, true);
  },
});

export const uploadVideo = multer({
  storage: createStorage(videoMimeTypes),
  limits: { fileSize: env.MAX_VIDEO_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!videoMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, 'Format video harus MP4 atau WEBM.'));
      return;
    }
    callback(null, true);
  },
});
