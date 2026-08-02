import { ImagePlus, Save, UploadCloud } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import type { StoreProfile } from '../types';

type ProfileForm = Omit<StoreProfile, 'id'>;

const empty: ProfileForm = {
  displayName: '',
  username: '',
  bio: '',
  avatarUrl: '',
  coverUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  whatsappUrl: '',
  themeColor: '#7c3aed',
};

export function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'avatarUrl' | 'coverUrl' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<StoreProfile | null>('/admin/profile')
      .then((profile) => {
        if (!profile) return;
        const { id: _id, ...rest } = profile;
        setForm(rest);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function upload(key: 'avatarUrl' | 'coverUrl', file?: File) {
    if (!file) return;
    setUploading(key);
    setError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const result = await api<{ url: string }>('/admin/upload', { method: 'POST', body: data });
      update(key, result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal.');
    } finally {
      setUploading(null);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value || null]));
      payload.displayName = form.displayName;
      payload.username = form.username;
      payload.themeColor = form.themeColor;
      const updated = await api<StoreProfile>('/admin/profile', { method: 'PUT', body: JSON.stringify(payload) });
      const { id: _id, ...rest } = updated;
      setForm(rest);
      setMessage('Profil storefront berhasil disimpan.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil gagal disimpan.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen label="Memuat profil toko..." />;

  return (
    <div>
      <PageHeader title="Profil Toko" description="Atur identitas, cover, sosial media, dan warna storefront." />
      {error && <div className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
      {message && <div className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div>}

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Identitas Storefront</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div><label className="label">Nama Tampilan *</label><input className="input" value={form.displayName} onChange={(event) => update('displayName', event.target.value)} required /></div>
              <div><label className="label">Username *</label><input className="input" value={form.username} onChange={(event) => update('username', event.target.value)} required /></div>
              <div className="sm:col-span-2"><label className="label">Bio</label><textarea className="input min-h-28" value={form.bio || ''} onChange={(event) => update('bio', event.target.value)} maxLength={300} /></div>
              <div><label className="label">Warna Tema</label><div className="flex gap-3"><input type="color" className="h-12 w-16 rounded-xl border border-slate-200 bg-white p-1" value={form.themeColor} onChange={(event) => update('themeColor', event.target.value)} /><input className="input" value={form.themeColor} onChange={(event) => update('themeColor', event.target.value)} /></div></div>
            </div>
          </section>

          <section className="card p-5 sm:p-7">
            <h2 className="text-lg font-extrabold text-slate-900">Sosial Media</h2>
            <div className="mt-6 space-y-5">
              <div><label className="label">Instagram URL</label><input type="url" className="input" value={form.instagramUrl || ''} onChange={(event) => update('instagramUrl', event.target.value)} placeholder="https://instagram.com/username" /></div>
              <div><label className="label">TikTok URL</label><input type="url" className="input" value={form.tiktokUrl || ''} onChange={(event) => update('tiktokUrl', event.target.value)} placeholder="https://tiktok.com/@username" /></div>
              <div><label className="label">WhatsApp URL</label><input type="url" className="input" value={form.whatsappUrl || ''} onChange={(event) => update('whatsappUrl', event.target.value)} placeholder="https://wa.me/628..." /></div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-900">Foto Profil</h2>
            <div className="mx-auto mt-5 h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl">
              {form.avatarUrl ? <img src={form.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><ImagePlus size={40} /></div>}
            </div>
            <label className="btn-secondary mt-5 w-full cursor-pointer"><UploadCloud size={17} />{uploading === 'avatarUrl' ? 'Mengupload...' : 'Upload Avatar'}<input type="file" accept="image/*" className="hidden" disabled={Boolean(uploading)} onChange={(event) => void upload('avatarUrl', event.target.files?.[0])} /></label>
            <input type="url" className="input mt-3" value={form.avatarUrl || ''} onChange={(event) => update('avatarUrl', event.target.value)} placeholder="Atau URL avatar" />
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-900">Cover</h2>
            <div className="mt-5 aspect-[16/7] overflow-hidden rounded-2xl bg-slate-100">
              {form.coverUrl ? <img src={form.coverUrl} alt="Cover" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><ImagePlus size={40} /></div>}
            </div>
            <label className="btn-secondary mt-4 w-full cursor-pointer"><UploadCloud size={17} />{uploading === 'coverUrl' ? 'Mengupload...' : 'Upload Cover'}<input type="file" accept="image/*" className="hidden" disabled={Boolean(uploading)} onChange={(event) => void upload('coverUrl', event.target.files?.[0])} /></label>
            <input type="url" className="input mt-3" value={form.coverUrl || ''} onChange={(event) => update('coverUrl', event.target.value)} placeholder="Atau URL cover" />
          </section>

          <button type="submit" className="btn-primary w-full" disabled={saving || Boolean(uploading)}><Save size={18} />{saving ? 'Menyimpan...' : 'Simpan Profil'}</button>
        </div>
      </form>
    </div>
  );
}
