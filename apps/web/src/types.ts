export type Marketplace = 'SHOPEE' | 'TOKOPEDIA' | 'TIKTOK' | 'OTHER';
export type ProductMediaType = 'IMAGE' | 'VIDEO';

export type ProductMedia = {
  id: string;
  productId: string;
  type: ProductMediaType;
  url: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreProfile = {
  id: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  whatsappUrl: string | null;
  themeColor: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceLabel: string | null;
  originalPriceLabel: string | null;
  imageUrl: string | null;
  media: ProductMedia[];
  affiliateUrl: string;
  marketplace: Marketplace;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  clickCount: number;
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProducts = {
  items: Product[];
  pagination: Pagination;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
};

export type DashboardStats = {
  summary: {
    totalProducts: number;
    activeProducts: number;
    totalClicks: number;
    clicksToday: number;
  };
  dailyClicks: Array<{ date: string; clicks: number }>;
  topProducts: Array<Pick<Product, 'id' | 'name' | 'slug' | 'marketplace' | 'clickCount' | 'imageUrl'>>;
  recentClicks: Array<{
    id: string;
    createdAt: string;
    product: { name: string; marketplace: Marketplace };
  }>;
  marketplaceStats: Array<{ marketplace: Marketplace; products: number; clicks: number }>;
};
