import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

type DailyClickRow = { date: string; clicks: number };

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const chartStart = new Date();
    chartStart.setDate(chartStart.getDate() - 13);
    chartStart.setHours(0, 0, 0, 0);

    const [totalProducts, activeProducts, totalClicks, clicksToday, topProducts, recentClicks, marketplaceStats, dailyRows] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.productClick.count(),
        prisma.productClick.count({ where: { createdAt: { gte: startToday } } }),
        prisma.product.findMany({
          take: 5,
          orderBy: { clickCount: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            marketplace: true,
            clickCount: true,
            imageUrl: true,
          },
        }),
        prisma.productClick.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: { product: { select: { name: true, marketplace: true } } },
        }),
        prisma.product.groupBy({
          by: ['marketplace'],
          _sum: { clickCount: true },
          _count: { id: true },
        }),
        prisma.$queryRaw<DailyClickRow[]>(Prisma.sql`
          SELECT TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS "date",
                 COUNT(*)::int AS "clicks"
          FROM "ProductClick"
          WHERE "createdAt" >= ${chartStart}
          GROUP BY DATE_TRUNC('day', "createdAt")
          ORDER BY DATE_TRUNC('day', "createdAt") ASC
        `),
      ]);

    const dailyMap = new Map(dailyRows.map((row) => [row.date, Number(row.clicks)]));
    const dailyClicks = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(chartStart);
      date.setDate(chartStart.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, clicks: dailyMap.get(key) ?? 0 };
    });

    res.json({
      summary: { totalProducts, activeProducts, totalClicks, clicksToday },
      dailyClicks,
      topProducts,
      recentClicks,
      marketplaceStats: marketplaceStats.map((item) => ({
        marketplace: item.marketplace,
        products: item._count.id,
        clicks: item._sum.clickCount ?? 0,
      })),
    });
  }),
);

export default router;
