import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, 'Email atau password salah.');
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      },
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new AppError(404, 'Akun tidak ditemukan.');
    res.json(user);
  }),
);


const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(10).max(128),
});

router.put(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!user || !(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw new AppError(400, 'Password saat ini tidak sesuai.');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ message: 'Password berhasil diperbarui.' });
  }),
);

export default router;
