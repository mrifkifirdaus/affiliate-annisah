import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { hashIp } from '../utils/ip-hash.js';

const router = Router();

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isActive: true },
      select: { id: true, affiliateUrl: true },
    });

    if (!product) throw new AppError(404, 'Produk tidak ditemukan atau sedang tidak aktif.');

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { clickCount: { increment: 1 } },
      }),
      prisma.productClick.create({
        data: {
          productId: product.id,
          userAgent: req.get('user-agent')?.slice(0, 500),
          referrer: req.get('referer')?.slice(0, 1000),
          ipHash: hashIp(req.ip),
        },
      }),
    ]);

    res.redirect(302, product.affiliateUrl);
  }),
);

export default router;
