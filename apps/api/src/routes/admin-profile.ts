import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

const profileSchema = z.object({
  displayName: z.string().min(2).max(80),
  username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/),
  bio: z.string().max(300).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  instagramUrl: z.string().url().nullable().optional(),
  tiktokUrl: z.string().url().nullable().optional(),
  whatsappUrl: z.string().url().nullable().optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const profile = await prisma.storeProfile.findUnique({ where: { key: 'main' } });
    res.json(profile);
  }),
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const input = profileSchema.parse(req.body);
    const profile = await prisma.storeProfile.upsert({
      where: { key: 'main' },
      update: input,
      create: { key: 'main', ...input },
    });
    res.json(profile);
  }),
);

export default router;
