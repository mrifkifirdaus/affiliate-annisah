import { ArrowLeft, Eye, EyeOff, LockKeyhole, Store } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      const destination = (location.state as { from?: string } | null)?.from || '/admin';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-400" />
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-slate-950/30 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-14 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur"><Store /></div>
            <p className="text-lg font-extrabold">Affiliate Storefront</p>
          </div>
          <div className="max-w-xl">
            <p className="text-5xl font-black leading-tight">Kelola katalog affiliate dari satu dashboard.</p>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">Tambahkan produk, atur kategori, pantau klik, lalu arahkan pengunjung ke Shopee, Tokopedia, atau TikTok Shop.</p>
          </div>
          <p className="text-sm text-white/60">Secure administrator access</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600">
            <ArrowLeft size={17} /> Kembali ke storefront
          </Link>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200"><LockKeyhole size={25} /></div>
          <h1 className="mt-6 text-3xl font-black text-slate-950">Masuk Administrator</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan akun administrator yang dibuat melalui seed database.</p>

          {error && <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} className="input pr-12" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Tampilkan password">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Memproses...' : 'Masuk ke Dashboard'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
