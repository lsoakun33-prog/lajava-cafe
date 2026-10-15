import React from 'react';
import { ShoppingBag, QrCode, Shield, Clock, Coffee } from 'lucide-react';

export default function Header({
  tableNumber,
  onOpenQRScanner,
  cartCount,
  onOpenCart,
  onOpenOrderHistory,
  hasActiveOrder,
  onSwitchToAdmin,
}) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black tracking-tighter text-sm shadow-md">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-widest uppercase text-white">
                NOIR F&B
              </span>
              <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Self-Order
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Artisan Coffee & Gourmet Kitchen
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Table Badge & Scanner Trigger */}
          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 transition-all text-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-white tracking-wide">{tableNumber}</span>
          </button>

          {/* Active Order Tracker Button (if exists) */}
          {hasActiveOrder && (
            <button
              onClick={onOpenOrderHistory}
              title="Cek Status Pesanan Anda"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-all text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span className="font-semibold hidden sm:inline">Status Pesanan</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-md flex items-center justify-center"
            title="Buka Keranjang"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold border-2 border-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Switch Portal */}
          <button
            onClick={onSwitchToAdmin}
            title="Masuk ke Dashboard Admin / Dapur"
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
