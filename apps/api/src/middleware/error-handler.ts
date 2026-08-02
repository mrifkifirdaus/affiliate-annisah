import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Data yang dikirim tidak valid.',
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Data dengan nilai tersebut sudah tersedia.' });
      return;
    }

    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Data tidak ditemukan.' });
      return;
    }
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
};
