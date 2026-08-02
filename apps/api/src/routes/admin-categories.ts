import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { slugify } from '../utils/slug.js';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().max(90).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const slug = slugify(input.slug || input.name);
    if (!slug) throw new AppError(400, 'Slug kategori tidak valid.');

    const category = await prisma.category.create({ data: { ...input, slug } });
    res.status(201).json(category);
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const slug = slugify(input.slug || input.name);
    if (!slug) throw new AppError(400, 'Slug kategori tidak valid.');

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { ...input, slug },
    });
    res.json(category);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) throw new AppError(404, 'Kategori tidak ditemukan.');
    if (category._count.products > 0) {
      throw new AppError(409, 'Kategori masih digunakan oleh produk. Pindahkan produknya terlebih dahulu.');
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
