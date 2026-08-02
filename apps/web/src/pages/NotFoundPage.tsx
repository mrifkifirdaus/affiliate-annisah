import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
      <div><p className="text-7xl font-black text-violet-600">404</p><h1 className="mt-4 text-2xl font-black text-slate-900">Halaman tidak ditemukan</h1><p className="mt-2 text-slate-500">Alamat yang dibuka tidak tersedia.</p><Link to="/" className="btn-primary mt-6"><ArrowLeft size={17} /> Kembali</Link></div>
    </div>
  );
}
