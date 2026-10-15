import React from 'react';
import {
  Bell,
  BellOff,
  LogOut,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  ExternalLink,
  Radio,
  Layers,
} from 'lucide-react';

export default function AdminHeader({
  activeTab,
  onSelectTab,
  pendingCount = 0,
  isSoundEnabled,
  onToggleSound,
  onSwitchToCustomer,
  onLogout,
  user,
}) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Brand & Socket status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm shadow-md">
              LJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                  LA JAVA KITCHEN & ADMIN
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span className="font-mono">LIVE REAL-TIME</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400">
                Logged in as: <span className="text-zinc-200 font-semibold">{user?.name || 'Administrator'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800 scrollbar-none">
          <button
            onClick={() => onSelectTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Pesanan Masuk</span>
            {pendingCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'menu'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kelola Menu</span>
          </button>

          <button
            onClick={() => onSelectTab('tables')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'tables'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Meja</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analitik</span>
          </button>
        </div>

        {/* Right: Sound toggle, view client, logout */}
        <div className="flex items-center gap-2">
          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundEnabled ? 'Suara notifikasi aktif' : 'Suara notifikasi nonaktif'}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              isSoundEnabled
                ? 'bg-white text-black border-white shadow'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            {isSoundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-semibold">
              {isSoundEnabled ? 'Audio Aktif' : 'Audio Mute'}
            </span>
          </button>

          {/* View customer mode */}
          <button
            onClick={onSwitchToCustomer}
            title="Buka Halaman Pemesanan Tamu"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Pelanggan</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Keluar dari Admin"
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
