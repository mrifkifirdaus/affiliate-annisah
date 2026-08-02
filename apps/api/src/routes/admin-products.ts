import { Marketplace, Prisma, ProductMediaType } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { assertAllowedAffiliateUrl } from '../utils/affiliate.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { slugify } from '../utils/slug.js';

const router = Router();

const nullableUrl = z.union([z.string().url(), z.literal(''), z.null()]).optional().transform((value) => value || null);
const nullableText = z.union([z.string(), z.literal(''), z.null()]).optional().transform((value) => value || null);

const mediaSchema = z.object({
  type: z.nativeEnum(ProductMediaType),
  url: z.string().url(),
  thumbnailUrl: nullableUrl,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const productSchema = z
  .object({
    name: z.string().min(2).max(160),
    slug: z.string().max(90).optional(),
    description: nullableText,
    priceLabel: nullableText,
    originalPriceLabel: nullableText,
    imageUrl: nullableUrl,
    media: z.array(mediaSchema).max(9).default([]),
    affiliateUrl: z.string().url(),
    marketplace: z.nativeEnum(Marketplace),
    categoryId: z.union([z.string().cuid(), z.literal(''), z.null()]).optional().transform((value) => value || null),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    sortOrder: z.coerce.number().int().default(0),
  })
  .superRefine((value, ctx) => {
    const imageCount = value.media.filter((item) => item.type === ProductMediaType.IMAGE).length;
    const videoCount = value.media.filter((item) => item.type === ProductMediaType.VIDEO).length;

    if (imageCount > 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['media'], message: 'Maksimal 8 gambar per produk.' });
    }
    if (videoCount > 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['media'], message: 'Maksimal 1 video per produk.' });
    }
  });

const listSchema = z.object({
  search: z.string().trim().optional(),
  marketplace: z.nativeEnum(Marketplace).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const productInclude = {
  category: true,
  media: { orderBy: { sortOrder: 'asc' as const } },
};

async function makeUniqueSlug(value: string, excludeId?: string): Promise<string> {
  const base = slugify(value);
  if (!base) throw new AppError(400, 'Slug produk tidak valid.');

  let candidate = base;
  let counter = 2;

  while (
    await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function normalizeMedia(media: z.infer<typeof mediaSchema>[]) {
  return media.map((item, index) => ({
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    sortOrder: index,
  }));
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = listSchema.parse(req.query);
    const where: Prisma.ProductWhereInput = {
      ...(query.marketplace ? { marketplace: query.marketplace } : {}),
      ...(query.status ? { isActive: query.status === 'active' } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { category: { name: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
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

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: productInclude,
    });
    if (!product) throw new AppError(404, 'Produk tidak ditemukan.');
    res.json(product);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = productSchema.parse(req.body);
    const slug = await makeUniqueSlug(input.slug || input.name);
    const affiliateUrl = assertAllowedAffiliateUrl(input.affiliateUrl);
    const media = normalizeMedia(input.media);
    const primaryImage = media.find((item) => item.type === ProductMediaType.IMAGE)?.url ?? input.imageUrl;
    const { media: _media, imageUrl: _imageUrl, ...productData } = input;

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        affiliateUrl,
        imageUrl: primaryImage,
        media: { create: media },
      },
      include: productInclude,
    });
    res.status(201).json(product);
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = productSchema.parse(req.body);
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'Produk tidak ditemukan.');

    const slug = await makeUniqueSlug(input.slug || input.name, existing.id);
    const affiliateUrl = assertAllowedAffiliateUrl(input.affiliateUrl);
    const media = normalizeMedia(input.media);
    const primaryImage = media.find((item) => item.type === ProductMediaType.IMAGE)?.url ?? input.imageUrl;
    const { media: _media, imageUrl: _imageUrl, ...productData } = input;

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...productData,
        slug,
        affiliateUrl,
        imageUrl: primaryImage,
        media: {
          deleteMany: {},
          create: media,
        },
      },
      include: productInclude,
    });
    res.json(product);
  }),
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const input = z.object({ isActive: z.boolean() }).parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: input.isActive },
      include: productInclude,
    });
    res.json(product);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
