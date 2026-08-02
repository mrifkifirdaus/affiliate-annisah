import { Edit3, FolderPlus, Save, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingScreen } from '../components/LoadingScreen';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import type { Category } from '../types';

type CategoryForm = {
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm: CategoryForm = { name: '', slug: '', sortOrder: 0, isActive: true };

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    try {
      setCategories(await api<Category[]>('/admin/categories'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function beginEdit(category: Category) {
    setEditing(category);
    setForm({ name: category.name, slug: category.slug, sortOrder: category.sortOrder, isActive: category.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api<Category>(editing ? `/admin/categories/${editing.id}` : '/admin/categories', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori gagal disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    try {
      await api<void>(`/admin/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori gagal dihapus.');
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <PageHeader title="Kategori" description="Kelompokkan produk agar pengunjung lebih mudah mencari katalog." />
      {error && <div className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submit} className="card h-fit p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-extrabold text-slate-900">{editing ? 'Edit Kategori' : 'Tambah Kategori'}</h2><p className="text-xs text-slate-500">Slug dapat dibuat otomatis dari nama.</p></div>
            {editing && <button type="button" onClick={reset} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button>}
          </div>
          <div className="mt-6 space-y-5">
            <div><label className="label">Nama *</label><input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Fashion" required /></div>
            <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="fashion" /></div>
            <div><label className="label">Urutan</label><input type="number" className="input" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 p-4"><span className="text-sm font-bold text-slate-700">Kategori aktif</span><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-5 w-5 accent-violet-600" /></label>
            <button className="btn-primary w-full" disabled={saving}>{editing ? <Edit3 size={17} /> : <FolderPlus size={17} />}{saving ? 'Menyimpan...' : editing ? 'Update Kategori' : 'Tambah Kategori'}</button>
          </div>
        </form>

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft">
          {loading ? <LoadingScreen label="Memuat kategori..." /> : categories.length === 0 ? (
            <div className="p-12 text-center"><p className="font-bold text-slate-800">Belum ada kategori.</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-4 p-5 hover:bg-slate-50/60">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-700"><FolderPlus size={19} /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-extrabold text-slate-900">{category.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{category.isActive ? 'Aktif' : 'Nonaktif'}</span></div><p className="mt-1 text-xs text-slate-400">/{category.slug} • {category._count?.products || 0} produk • urutan {category.sortOrder}</p></div>
                  <button onClick={() => beginEdit(category)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-violet-600" aria-label="Edit kategori"><Edit3 size={16} /></button>
                  <button onClick={() => setDeleteTarget(category)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600" aria-label="Hapus kategori"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus kategori?" description={`Kategori “${deleteTarget?.name || ''}” hanya dapat dihapus jika tidak digunakan oleh produk.`} onClose={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
    </div>
  );
}
