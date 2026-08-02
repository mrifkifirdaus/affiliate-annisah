import { Marketplace, Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

const querySchema = z.object({
  search: z.string().trim().optional(),
  marketplace: z.nativeEnum(Marketplace).optional(),
  category: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

router.get(
  '/store',
  asyncHandler(async (_req, res) => {
    const profile = await prisma.storeProfile.findUnique({ where: { key: 'main' } });
    res.json(profile);
  }),
);

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });
    res.json(categories);
  }),
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const query = querySchema.parse(req.query);
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.marketplace ? { marketplace: query.marketplace } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.featured ? { isFeatured: query.featured === 'true' } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { category: { name: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true, media: { orderBy: { sortOrder: 'asc' } } },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  }),
);

export default router;
