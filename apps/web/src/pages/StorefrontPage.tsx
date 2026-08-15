import {
  ExternalLink,
  Instagram,
  MessageCircle,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { api } from '../lib/api';
import type { Category, Marketplace, PaginatedProducts, Product, StoreProfile } from '../types';

const marketplaceFilters: Array<{ value: '' | Marketplace; label: string }> = [
  { value: '', label: 'Semua' },
  { value: 'SHOPEE', label: 'Shopee' },
  { value: 'TOKOPEDIA', label: 'Tokopedia' },
  { value: 'TIKTOK', label: 'TikTok Shop' },
];

export function StorefrontPage() {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [marketplace, setMarketplace] = useState<'' | Marketplace>('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    Promise.all([
      api<StoreProfile | null>('/public/store', { auth: false }),
      api<Category[]>('/public/categories', { auth: false }),
    ])
      .then(([store, categoryData]) => {
        setProfile(store);
        setCategories(categoryData);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setProductLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (marketplace) params.set('marketplace', marketplace);
    if (category) params.set('category', category);
    params.set('limit', '60');

    api<PaginatedProducts>(`/public/products?${params.toString()}`, { auth: false })
      .then((data) => setProducts(data.items))
      .catch((err: Error) => setError(err.message))
      .finally(() => setProductLoading(false));
  }, [debouncedSearch, marketplace, category]);

  const featuredCount = useMemo(() => products.filter((item) => item.isFeatured).length, [products]);

  async function shareStore() {
    const data = {
      title: profile?.displayName || 'Affiliate Storefront',
      text: profile?.bio || 'Lihat katalog produk pilihan.',
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(data).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    window.alert('Link storefront berhasil disalin.');
  }

  if (loading) return <LoadingScreen label="Menyiapkan storefront..." />;

  const themeColor = profile?.themeColor || '#7c3aed';

  return (
    <div className="min-h-screen bg-[#f7f7fb] pb-16">
      <div className="relative mx-auto min-h-screen max-w-3xl overflow-hidden bg-slate-300 shadow-2xl shadow-slate-200/60">
        <div
          className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-400 sm:h-56"
          style={profile?.coverUrl ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={shareStore}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:scale-105"
              aria-label="Bagikan storefront"
            >
              <Share2 size={19} />
            </button>
          </div>
        </div>

        <section className="relative px-5 pb-4 sm:px-8">
          <div className="-mt-14 flex items-end justify-between gap-4">
            <div className="h-28 w-28 overflow-hidden rounded-full border-[5px] border-white bg-gradient-to-br from-violet-200 to-pink-100 shadow-xl sm:h-32 sm:w-32">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-3xl font-black text-violet-700">
                  {(profile?.displayName || 'A').slice(0, 1)}
                </div>
              )}
            </div>
            <div className="mb-2 flex items-center gap-2">
              {profile?.instagramUrl && (
                <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Instagram size={18} />
                </a>
              )}
              {profile?.tiktokUrl && (
                <a href={profile.tiktokUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-sm font-black text-slate-800 hover:bg-slate-50">
                  TT
                </a>
              )}
              {profile?.whatsappUrl && (
                <a href={profile.whatsappUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-emerald-600 hover:bg-emerald-50">
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{profile?.displayName || 'Affiliate Store'}</h1>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">@{profile?.username || 'store'}</span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{profile?.bio || 'Katalog produk affiliate pilihan.'}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ShoppingBag size={14} /> {products.length} produk</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles size={14} /> {featuredCount} pilihan utama</span>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 border-y border-slate-300 bg-tranparent px-5 py-4 backdrop-blur sm:px-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk yang kamu butuhkan..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {marketplaceFilters.map((item) => (
              <button
                key={item.label}
                onClick={() => setMarketplace(item.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  marketplace === item.value ? 'text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={marketplace === item.value ? { backgroundColor: themeColor } : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setCategory('')}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${category === '' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                Semua kategori
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.slug)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${category === item.slug ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  {item.name} {item._count ? `(${item._count.products})` : ''}
                </button>
              ))}
            </div>
          )}
        </section>

        <main className="px-5 py-7 sm:px-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>
          )}

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Katalog Pilihan</h2>
              <p className="text-xs text-slate-500">Klik produk untuk menuju toko resminya.</p>
            </div>
            <ExternalLink size={18} className="text-slate-400" />
          </div>

          {productLoading ? (
            <LoadingScreen label="Memuat produk..." />
          ) : products.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <ShoppingBag className="mx-auto text-slate-300" size={42} />
              <h3 className="mt-4 font-extrabold text-slate-800">Produk belum ditemukan</h3>
              <p className="mt-1 text-sm text-slate-500">Coba ubah kata pencarian atau filter yang digunakan.</p>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-100 px-5 py-8 text-center text-xs text-slate-400">
          Produk akan membuka halaman marketplace melalui link affiliate.
          <div className="mt-2"><a href="/admin/login" className="font-semibold text-slate-500 hover:text-violet-600">@mrf05_</a></div>
        </footer>
      </div>
    </div>
  );
}
