import { Router } from 'express';
import { env } from '../config/env.js';
import { uploadImage, uploadVideo } from '../middleware/upload.js';
import { AppError } from '../utils/app-error.js';

const router = Router();

function publicUrl(filename: string) {
  return `${env.PUBLIC_API_URL.replace(/\/$/, '')}/uploads/${filename}`;
}

// Tetap dipertahankan agar upload gambar tunggal versi lama tidak rusak.
router.post('/', uploadImage.single('image'), (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Pilih file gambar terlebih dahulu.');

    res.status(201).json({
      url: publicUrl(req.file.filename),
      filename: req.file.filename,
      size: req.file.size,
      type: 'IMAGE',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/images', uploadImage.array('images', 8), (req, res, next) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) throw new AppError(400, 'Pilih minimal satu gambar.');

    res.status(201).json({
      items: files.map((file) => ({
        url: publicUrl(file.filename),
        filename: file.filename,
        size: file.size,
        type: 'IMAGE',
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/video', uploadVideo.single('video'), (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Pilih file video terlebih dahulu.');

    res.status(201).json({
      url: publicUrl(req.file.filename),
      filename: req.file.filename,
      size: req.file.size,
      type: 'VIDEO',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
