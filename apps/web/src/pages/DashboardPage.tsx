import { Activity, Eye, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { MarketplaceBadge } from '../components/MarketplaceBadge';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import type { DashboardStats } from '../types';

export function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<DashboardStats>('/admin/stats')
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const maxClicks = useMemo(() => Math.max(1, ...(data?.dailyClicks.map((item) => item.clicks) || [1])), [data]);

  if (!data && !error) return <LoadingScreen label="Memuat dashboard..." />;

  const cards = data ? [
    { label: 'Total Produk', value: data.summary.totalProducts, icon: Package, note: `${data.summary.activeProducts} aktif` },
    { label: 'Total Klik', value: data.summary.totalClicks, icon: Eye, note: 'Seluruh waktu' },
    { label: 'Klik Hari Ini', value: data.summary.clicksToday, icon: Activity, note: new Date().toLocaleDateString('id-ID') },
    { label: 'Produk Aktif', value: data.summary.activeProducts, icon: ShoppingBag, note: 'Tampil di storefront' },
  ] : [];

  return (
    <div>
      <PageHeader title="Dashboard" description="Pantau performa katalog dan aktivitas pengunjung." />
      {error && <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, note }) => (
              <div key={label} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{value.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Icon size={21} /></div>
                </div>
                <p className="mt-4 text-xs font-medium text-slate-400">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <section className="card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div><h2 className="font-extrabold text-slate-900">Klik 14 Hari Terakhir</h2><p className="text-xs text-slate-500">Aktivitas redirect affiliate per hari</p></div>
                <TrendingUp className="text-violet-600" size={20} />
              </div>
              <div className="mt-8 flex h-64 items-end gap-2">
                {data.dailyClicks.map((item) => {
                  const height = Math.max(6, (item.clicks / maxClicks) * 100);
                  return (
                    <div key={item.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <div className="relative flex h-48 w-full items-end justify-center">
                        <div className="w-full max-w-8 rounded-t-xl bg-violet-500 transition group-hover:bg-violet-700" style={{ height: `${height}%` }} />
                        <span className="absolute -top-6 hidden rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white group-hover:block">{item.clicks}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(`${item.date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="font-extrabold text-slate-900">Per Marketplace</h2>
              <p className="text-xs text-slate-500">Jumlah produk dan klik</p>
              <div className="mt-5 space-y-4">
                {data.marketplaceStats.map((item) => (
                  <div key={item.marketplace} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between"><MarketplaceBadge marketplace={item.marketplace} /><span className="text-sm font-black text-slate-900">{item.clicks} klik</span></div>
                    <p className="mt-2 text-xs text-slate-500">{item.products} produk</p>
                  </div>
                ))}
                {data.marketplaceStats.length === 0 && <p className="text-sm text-slate-500">Belum ada data.</p>}
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="card p-5 sm:p-6">
              <h2 className="font-extrabold text-slate-900">Produk Teratas</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 py-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">{index + 1}</span>
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">{product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{product.name}</p><MarketplaceBadge marketplace={product.marketplace} /></div>
                    <p className="text-sm font-black text-violet-700">{product.clickCount}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <h2 className="font-extrabold text-slate-900">Klik Terbaru</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {data.recentClicks.map((click) => (
                  <div key={click.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{click.product.name}</p><p className="mt-1 text-xs text-slate-400">{new Date(click.createdAt).toLocaleString('id-ID')}</p></div>
                    <MarketplaceBadge marketplace={click.product.marketplace} />
                  </div>
                ))}
                {data.recentClicks.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Belum ada klik produk.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
