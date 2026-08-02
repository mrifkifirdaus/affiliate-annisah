import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Marketplace, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@affiliate.local';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name: 'Administrator', passwordHash },
    create: { email, name: 'Administrator', passwordHash },
  });

  await prisma.storeProfile.upsert({
    where: { key: 'main' },
    update: {},
    create: {
      key: 'main',
      displayName: 'Rifki Picks',
      username: 'rifkipicks',
      bio: 'Kumpulan produk pilihan yang praktis, menarik, dan layak dicoba.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
      instagramUrl: 'https://instagram.com/',
      tiktokUrl: 'https://tiktok.com/',
      whatsappUrl: 'https://wa.me/6280000000000',
      themeColor: '#7c3aed',
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: { name: 'Fashion', slug: 'fashion', sortOrder: 1 },
  });

  const beauty = await prisma.category.upsert({
    where: { slug: 'beauty' },
    update: {},
    create: { name: 'Beauty', slug: 'beauty', sortOrder: 2 },
  });

  const home = await prisma.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: { name: 'Home & Living', slug: 'home-living', sortOrder: 3 },
  });

  const products = [
    {
      name: 'Tas Shoulder Minimalis',
      slug: 'tas-shoulder-minimalis',
      description: 'Tas harian dengan desain clean dan ruang penyimpanan yang cukup.',
      priceLabel: 'Mulai Rp89.000',
      originalPriceLabel: 'Rp129.000',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85',
      affiliateUrl: 'https://shopee.co.id/',
      marketplace: Marketplace.SHOPEE,
      isFeatured: true,
      sortOrder: 1,
      categoryId: fashion.id,
    },
    {
      name: 'Serum Wajah Brightening',
      slug: 'serum-wajah-brightening',
      description: 'Serum ringan untuk melengkapi rutinitas perawatan wajah harian.',
      priceLabel: 'Mulai Rp59.000',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85',
      affiliateUrl: 'https://www.tokopedia.com/',
      marketplace: Marketplace.TOKOPEDIA,
      isFeatured: true,
      sortOrder: 2,
      categoryId: beauty.id,
    },
    {
      name: 'Tumbler Stainless Modern',
      slug: 'tumbler-stainless-modern',
      description: 'Tumbler praktis untuk dibawa bekerja, belajar, dan bepergian.',
      priceLabel: 'Mulai Rp75.000',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85',
      affiliateUrl: 'https://www.tiktok.com/',
      marketplace: Marketplace.TIKTOK,
      isFeatured: false,
      sortOrder: 3,
      categoryId: home.id,
    },
    {
      name: 'Kemeja Linen Unisex',
      slug: 'kemeja-linen-unisex',
      description: 'Kemeja santai dengan bahan ringan untuk tampilan kasual.',
      priceLabel: 'Mulai Rp119.000',
      imageUrl: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=900&q=85',
      affiliateUrl: 'https://shopee.co.id/',
      marketplace: Marketplace.SHOPEE,
      isFeatured: false,
      sortOrder: 4,
      categoryId: fashion.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`Seed selesai. Login admin: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
