import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Link2,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoadingScreen } from '../components/LoadingScreen';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import type { Category, Marketplace, Product, ProductMediaType } from '../types';

type ProductMediaForm = {
  type: ProductMediaType;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  priceLabel: string;
  originalPriceLabel: string;
  media: ProductMediaForm[];
  affiliateUrl: string;
  marketplace: Marketplace;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type UploadedMedia = {
  url: string;
  filename: string;
  size: number;
  type: ProductMediaType;
};

const initialForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  priceLabel: '',
  originalPriceLabel: '',
  media: [],
  affiliateUrl: '',
  marketplace: 'SHOPEE',
  categoryId: '',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

function normalizeMedia(items: ProductMediaForm[]): ProductMediaForm[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }));
}

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Category[]>('/admin/categories')
      .then(setCategories)
      .catch((err: Error) => setError(err.message));

    if (!id) return;
    api<Product>(`/admin/products/${id}`)
      .then((product) => {
        const media: ProductMediaForm[] = product.media?.length
          ? product.media.map((item) => ({
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl || '',
              sortOrder: item.sortOrder,
            }))
          : product.imageUrl
            ? [{ type: 'IMAGE', url: product.imageUrl, thumbnailUrl: '', sortOrder: 0 }]
            : [];

        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          priceLabel: product.priceLabel || '',
          originalPriceLabel: product.originalPriceLabel || '',
          media: normalizeMedia(media),
          affiliateUrl: product.affiliateUrl,
          marketplace: product.marketplace,
          categoryId: product.categoryId || '',
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          sortOrder: product.sortOrder,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const imageCount = useMemo(() => form.media.filter((item) => item.type === 'IMAGE').length, [form.media]);
  const hasVideo = useMemo(() => form.media.some((item) => item.type === 'VIDEO'), [form.media]);
  const selectedMedia = form.media[selectedMediaIndex];
  const firstImageIndex = form.media.findIndex((item) => item.type === 'IMAGE');

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setMedia(items: ProductMediaForm[]) {
    const normalized = normalizeMedia(items);
    setForm((current) => ({ ...current, media: normalized }));
    setSelectedMediaIndex((current) => Math.min(current, Math.max(0, normalized.length - 1)));
  }

  async function uploadImages(files?: FileList | null) {
    if (!files?.length) return;
    const remaining = 8 - imageCount;
    if (remaining <= 0) {
      setError('Maksimal 8 gambar per produk.');
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(`Hanya ${remaining} gambar tambahan yang dapat diupload.`);
    } else {
      setError('');
    }

    setUploadingImages(true);
    try {
      const data = new FormData();
      selected.forEach((file) => data.append('images', file));
      const result = await api<{ items: UploadedMedia[] }>('/admin/upload/images', { method: 'POST', body: data });
      setMedia([
        ...form.media,
        ...result.items.map((item) => ({ type: 'IMAGE' as const, url: item.url, thumbnailUrl: '', sortOrder: 0 })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gambar gagal.');
    } finally {
      setUploadingImages(false);
    }
  }

  async function uploadVideo(file?: File) {
    if (!file) return;
    setUploadingVideo(true);
    setError('');
    try {
      const data = new FormData();
      data.append('video', file);
      const result = await api<UploadedMedia>('/admin/upload/video', { method: 'POST', body: data });
      const withoutOldVideo = form.media.filter((item) => item.type !== 'VIDEO');
      setMedia([...withoutOldVideo, { type: 'VIDEO', url: result.url, thumbnailUrl: '', sortOrder: 0 }]);
      setSelectedMediaIndex(withoutOldVideo.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload video gagal.');
    } finally {
      setUploadingVideo(false);
    }
  }

  function addImageUrl() {
    const value = imageUrlInput.trim();
    if (!value) return;
    if (imageCount >= 8) {
      setError('Maksimal 8 gambar per produk.');
      return;
    }
    setMedia([...form.media, { type: 'IMAGE', url: value, thumbnailUrl: '', sortOrder: 0 }]);
    setImageUrlInput('');
    setError('');
  }

  function addVideoUrl() {
    const value = videoUrlInput.trim();
    if (!value) return;
    const withoutOldVideo = form.media.filter((item) => item.type !== 'VIDEO');
    setMedia([...withoutOldVideo, { type: 'VIDEO', url: value, thumbnailUrl: '', sortOrder: 0 }]);
    setSelectedMediaIndex(withoutOldVideo.length);
    setVideoUrlInput('');
    setError('');
  }

  function removeMedia(index: number) {
    setMedia(form.media.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.media.length) return;
    const next = [...form.media];
    const currentItem = next[index];
    const targetItem = next[target];

    if (!currentItem || !targetItem) return;

next[index] = targetItem;
next[target] = currentItem;

    setMedia(next);
    setSelectedMediaIndex(target);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const firstImage = form.media.find((item) => item.type === 'IMAGE');
    const payload = {
      ...form,
      slug: form.slug || undefined,
      description: form.description || null,
      priceLabel: form.priceLabel || null,
      originalPriceLabel: form.originalPriceLabel || null,
      imageUrl: firstImage?.url || null,
      media: form.media.map((item, index) => ({
        type: item.type,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || null,
        sortOrder: index,
      })),
      categoryId: form.categoryId || null,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      await api<Product>(isEdit ? `/admin/products/${id}` : '/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Produk gagal disimpan.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen label="Memuat data produk..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
        description="Isi informasi katalog, galeri media, dan link affiliate tujuan."
        action={<Link to="/admin/products" className="btn-secondary"><ArrowLeft size={17} /> Kembali</Link>}
      />

      {error && <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Informasi Produk</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Nama Produk *</label>
                <input className="input" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Contoh: Tas Shoulder Minimalis" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Slug</label>
                <input className="input" value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder="Otomatis dari nama produk" />
                <p className="mt-2 text-xs text-slate-400">Digunakan pada URL redirect produk.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Deskripsi</label>
                <textarea className="input min-h-28 resize-y" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Deskripsi singkat produk..." />
              </div>
              <div>
                <label className="label">Label Harga</label>
                <input className="input" value={form.priceLabel} onChange={(event) => update('priceLabel', event.target.value)} placeholder="Mulai Rp89.000" />
              </div>
              <div>
                <label className="label">Harga Coret</label>
                <input className="input" value={form.originalPriceLabel} onChange={(event) => update('originalPriceLabel', event.target.value)} placeholder="Rp129.000" />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}>
                  <option value="">Tanpa kategori</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Urutan</label>
                <input type="number" className="input" value={form.sortOrder} onChange={(event) => update('sortOrder', Number(event.target.value))} />
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Marketplace & Link Affiliate</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Marketplace *</label>
                <select className="input" value={form.marketplace} onChange={(event) => update('marketplace', event.target.value as Marketplace)}>
                  <option value="SHOPEE">Shopee</option>
                  <option value="TOKOPEDIA">Tokopedia</option>
                  <option value="TIKTOK">TikTok Shop</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Link Affiliate *</label>
                <input type="url" className="input" value={form.affiliateUrl} onChange={(event) => update('affiliateUrl', event.target.value)} placeholder="https://s.shopee.co.id/..." required />
                <p className="mt-2 text-xs leading-5 text-slate-400">Backend hanya menerima domain marketplace yang terdapat pada AFFILIATE_ALLOWED_HOSTS.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Galeri Produk</h2>
                <p className="mt-1 text-xs text-slate-500">Maksimal 8 gambar dan 1 video.</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">{imageCount} foto {hasVideo ? '+ 1 video' : ''}</span>
            </div>

            <div className="relative mt-5 aspect-square overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-slate-50">
              {selectedMedia?.type === 'IMAGE' ? (
                <img src={selectedMedia.url} alt="Preview produk" className="h-full w-full object-cover" />
              ) : selectedMedia?.type === 'VIDEO' ? (
                <video src={selectedMedia.url} poster={selectedMedia.thumbnailUrl || undefined} controls preload="metadata" className="h-full w-full bg-slate-950 object-contain" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-400"><ImagePlus size={44} /><p className="mt-3 text-sm font-semibold">Belum ada media</p></div>
              )}

              {form.media.length > 1 && (
                <>
                  <button type="button" onClick={() => setSelectedMediaIndex((selectedMediaIndex - 1 + form.media.length) % form.media.length)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg" aria-label="Media sebelumnya"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={() => setSelectedMediaIndex((selectedMediaIndex + 1) % form.media.length)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg" aria-label="Media berikutnya"><ChevronRight size={18} /></button>
                </>
              )}
            </div>

            {form.media.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {form.media.map((item, index) => (
                  <div key={`${item.type}-${item.url}-${index}`} className={`group relative overflow-hidden rounded-2xl border-2 bg-slate-100 ${selectedMediaIndex === index ? 'border-violet-500' : 'border-transparent'}`}>
                    <button type="button" onClick={() => setSelectedMediaIndex(index)} className="block aspect-square w-full">
                      {item.type === 'IMAGE' ? (
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="relative h-full w-full bg-slate-900">
                          <video src={item.url} muted preload="metadata" className="h-full w-full object-cover opacity-70" />
                          <PlayCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={28} />
                        </div>
                      )}
                    </button>
                    {index === firstImageIndex && item.type === 'IMAGE' && <span className="absolute left-1.5 top-1.5 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold text-white">Cover</span>}
                    {item.type === 'VIDEO' && <span className="absolute left-1.5 top-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-white">Video</span>}
                    <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                      <button type="button" onClick={() => moveMedia(index, -1)} disabled={index === 0} className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-slate-700 shadow disabled:opacity-30" aria-label="Geser ke kiri"><ChevronLeft size={14} /></button>
                      <button type="button" onClick={() => moveMedia(index, 1)} disabled={index === form.media.length - 1} className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-slate-700 shadow disabled:opacity-30" aria-label="Geser ke kanan"><ChevronRight size={14} /></button>
                      <button type="button" onClick={() => removeMedia(index)} className="grid h-7 w-7 place-items-center rounded-lg bg-rose-600 text-white shadow" aria-label="Hapus media"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <label className="btn-secondary w-full cursor-pointer">
                <UploadCloud size={17} /> {uploadingImages ? 'Mengupload...' : 'Upload Foto'}
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadingImages || imageCount >= 8} onChange={(event) => void uploadImages(event.target.files)} />
              </label>
              <label className="btn-secondary w-full cursor-pointer">
                <Video size={17} /> {uploadingVideo ? 'Mengupload...' : hasVideo ? 'Ganti Video' : 'Upload Video'}
                <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={uploadingVideo} onChange={(event) => void uploadVideo(event.target.files?.[0])} />
              </label>
            </div>

            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              <div>
                <label className="label">Tambah URL Gambar</label>
                <div className="flex gap-2">
                  <input type="url" className="input" value={imageUrlInput} onChange={(event) => setImageUrlInput(event.target.value)} placeholder="https://.../gambar.jpg" />
                  <button type="button" onClick={addImageUrl} className="btn-secondary shrink-0 px-4" aria-label="Tambah URL gambar"><Plus size={17} /></button>
                </div>
              </div>
              <div>
                <label className="label">URL Video MP4/WEBM</label>
                <div className="flex gap-2">
                  <input type="url" className="input" value={videoUrlInput} onChange={(event) => setVideoUrlInput(event.target.value)} placeholder="https://.../video.mp4" />
                  <button type="button" onClick={addVideoUrl} className="btn-secondary shrink-0 px-4" aria-label="Tambah URL video"><Link2 size={17} /></button>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-900">Publikasi</h2>
            <div className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                <div><p className="text-sm font-bold text-slate-800">Produk aktif</p><p className="mt-1 text-xs leading-5 text-slate-500">Tampilkan produk pada storefront publik.</p></div>
                <input type="checkbox" checked={form.isActive} onChange={(event) => update('isActive', event.target.checked)} className="mt-1 h-5 w-5 accent-violet-600" />
              </label>
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                <div><p className="text-sm font-bold text-slate-800">Produk unggulan</p><p className="mt-1 text-xs leading-5 text-slate-500">Tampilkan badge pilihan dan prioritaskan urutan.</p></div>
                <input type="checkbox" checked={form.isFeatured} onChange={(event) => update('isFeatured', event.target.checked)} className="mt-1 h-5 w-5 accent-violet-600" />
              </label>
            </div>
          </section>

          <button type="submit" className="btn-primary w-full" disabled={saving || uploadingImages || uploadingVideo}>
            <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </div>
  );
}
