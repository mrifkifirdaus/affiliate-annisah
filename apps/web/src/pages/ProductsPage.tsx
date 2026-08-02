import { Edit3, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingScreen } from '../components/LoadingScreen';
import { MarketplaceBadge } from '../components/MarketplaceBadge';
import { PageHeader } from '../components/PageHeader';
import { api, redirectUrl } from '../lib/api';
import type { Marketplace, PaginatedProducts, Product } from '../types';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [marketplace, setMarketplace] = useState<'' | Marketplace>('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: '100' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (marketplace) params.set('marketplace', marketplace);
    if (status) params.set('status', status);

    try {
      const result = await api<PaginatedProducts>(`/admin/products?${params.toString()}`);
      setProducts(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [debouncedSearch, marketplace, status]);

  async function toggleStatus(product: Product) {
    try {
      const updated = await api<Product>(`/admin/products/${product.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      setProducts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status produk.');
    }
  }

  async function removeProduct() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api<void>(`/admin/products/${deleteTarget.id}`, { method: 'DELETE' });
      setProducts((items) => items.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Kelola Produk"
        description="Tambahkan katalog dan atur link affiliate marketplace."
        action={
          <Link to="/admin/products/new" className="btn-primary"><Plus size={18} /> Tambah Produk</Link>
        }
      />

      {error && <div className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}

      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_170px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama produk..." />
          </div>
          <select className="input" value={marketplace} onChange={(event) => setMarketplace(event.target.value as '' | Marketplace)}>
            <option value="">Semua marketplace</option>
            <option value="SHOPEE">Shopee</option>
            <option value="TOKOPEDIA">Tokopedia</option>
            <option value="TIKTOK">TikTok Shop</option>
            <option value="OTHER">Lainnya</option>
          </select>
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
        {loading ? (
          <LoadingScreen label="Memuat produk..." />
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-extrabold text-slate-800">Belum ada produk</p>
            <p className="mt-1 text-sm text-slate-500">Tambahkan produk pertama untuk mulai membangun katalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Produk</th>
                  <th className="px-5 py-4 font-bold">Marketplace</th>
                  <th className="px-5 py-4 font-bold">Kategori</th>
                  <th className="px-5 py-4 font-bold">Klik</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          {(product.media?.find((item) => item.type === 'IMAGE')?.url || product.imageUrl) && (
                            <img src={product.media?.find((item) => item.type === 'IMAGE')?.url || product.imageUrl || ''} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-xs truncate text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-400">/{product.slug}</p>
                          {product.isFeatured && <span className="mt-1 inline-block text-[11px] font-bold text-violet-600">Produk unggulan</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><MarketplaceBadge marketplace={product.marketplace} /></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{product.category?.name || '-'}</td>
                    <td className="px-5 py-4 text-sm font-black text-slate-900">{product.clickCount.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => void toggleStatus(product)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {product.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a href={redirectUrl(product.slug)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Buka produk"><ExternalLink size={16} /></a>
                        <Link to={`/admin/products/${product.id}/edit`} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-violet-50 hover:text-violet-600" aria-label="Edit produk"><Edit3 size={16} /></Link>
                        <button onClick={() => setDeleteTarget(product)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus produk"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus produk?"
        description={`Produk “${deleteTarget?.name || ''}” dan seluruh data kliknya akan dihapus permanen.`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void removeProduct()}
      />
    </div>
  );
}
