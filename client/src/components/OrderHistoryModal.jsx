import React from 'react';
import { X, History, Receipt, Clock, CheckCircle2, ChefHat, Bell, XCircle } from 'lucide-react';
import { formatRupiah, formatTimeAgo } from '../utils/format';

export default function OrderHistoryModal({ isOpen, onClose, orders = [], onViewReceipt, onViewStatus }) {
  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white text-black flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 'CONFIRMED':
      case 'PREPARING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-800 text-white border border-zinc-700 flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            Dimasak
          </span>
        );
      case 'READY':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white text-black font-extrabold flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Siap Saji
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900 text-zinc-500 border border-zinc-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Batal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white text-black rounded-xl">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Riwayat Pesanan Meja</h3>
              <p className="text-[11px] text-zinc-400">{orders.length} pesanan tercatat sesi ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders list */}
        <div className="overflow-y-auto py-4 space-y-3 flex-1">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <History className="w-10 h-10 mx-auto stroke-[1.5]" />
              <p className="text-xs">Belum ada riwayat pesanan.</p>
              <p className="text-[11px] text-zinc-600">Pesanan yang Anda buat akan muncul di sini.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-white">{ord.order_number}</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{formatTimeAgo(ord.created_at)}</p>
                  </div>
                  <div>{getStatusBadge(ord.status)}</div>
                </div>

                {/* Items summary */}
                <div className="space-y-1 text-xs text-zinc-300">
                  {ord.items &&
                    ord.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">
                          {it.quantity}x {it.item_name || it.name}
                        </span>
                        <span className="font-mono text-zinc-300">
                          {formatRupiah((it.item_price || it.price) * it.quantity)}
                        </span>
                      </div>
                    ))}
                  {ord.items && ord.items.length > 3 && (
                    <p className="text-[10px] text-zinc-500 italic">+{ord.items.length - 3} menu lainnya...</p>
                  )}
                </div>

                {ord.cancel_reason && ord.status === 'CANCELLED' && (
                  <p className="text-[11px] text-zinc-400 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                    Alasan batal: <span className="text-zinc-200">{ord.cancel_reason}</span>
                  </p>
                )}

                {/* Total & Action Buttons */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Total:</span>
                    <span className="font-mono font-bold text-xs text-white">
                      {formatRupiah(ord.total_amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onViewStatus && ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          onViewStatus(ord);
                          onClose();
                        }}
                        className="py-1.5 px-3 rounded-xl bg-white text-black text-[11px] font-bold tracking-wider uppercase hover:bg-zinc-200 transition-colors"
                      >
                        Pantau
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onViewReceipt(ord);
                        onClose();
                      }}
                      className="py-1.5 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Struk</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
