import {
  BarChart3,
  FolderTree,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/categories', label: 'Kategori', icon: FolderTree },
  { to: '/admin/profile', label: 'Profil Toko', icon: Settings },
  { to: '/admin/account', label: 'Akun Admin', icon: ShieldCheck },
];

function SidebarContent({ close }: { close?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <Store size={21} />
        </div>
        <div>
          <p className="font-extrabold text-slate-900">Affiliate Admin</p>
          <p className="text-xs text-slate-500">Storefront Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          <Store size={18} /> Lihat Store
        </a>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="truncate text-sm font-bold text-slate-800">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-slate-200 hover:bg-rose-50"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-100 bg-white lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          />
          <aside className="relative h-full w-72 bg-white shadow-2xl">
            <button
              className="absolute right-4 top-4 z-10 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
            <SidebarContent close={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-100 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>
          <p className="ml-3 font-extrabold text-slate-900">Affiliate Admin</p>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
