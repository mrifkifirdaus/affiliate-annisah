import { KeyRound, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function AccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak sama.');
      return;
    }

    setSaving(true);
    try {
      const result = await api<{ message: string }>('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password gagal diperbarui.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Akun Administrator" description="Kelola keamanan akun yang digunakan untuk masuk dashboard." />
      {error && <div className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
      {message && <div className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="card h-fit p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-700"><KeyRound size={22} /></div>
          <h2 className="mt-5 text-lg font-extrabold text-slate-900">Informasi Akun</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="font-semibold text-slate-400">Nama</dt><dd className="mt-1 font-bold text-slate-800">{user?.name}</dd></div>
            <div><dt className="font-semibold text-slate-400">Email</dt><dd className="mt-1 font-bold text-slate-800">{user?.email}</dd></div>
            <div><dt className="font-semibold text-slate-400">Role</dt><dd className="mt-1 font-bold text-slate-800">Administrator</dd></div>
          </dl>
        </section>

        <form onSubmit={submit} className="card p-6 sm:p-7">
          <h2 className="text-lg font-extrabold text-slate-900">Ganti Password</h2>
          <p className="mt-1 text-sm text-slate-500">Gunakan minimal 10 karakter dan hindari password yang mudah ditebak.</p>
          <div className="mt-6 space-y-5">
            <div><label className="label">Password Saat Ini</label><input type="password" className="input" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required minLength={8} autoComplete="current-password" /></div>
            <div><label className="label">Password Baru</label><input type="password" className="input" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={10} autoComplete="new-password" /></div>
            <div><label className="label">Konfirmasi Password Baru</label><input type="password" className="input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={10} autoComplete="new-password" /></div>
            <button className="btn-primary" disabled={saving}><Save size={17} />{saving ? 'Menyimpan...' : 'Perbarui Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
