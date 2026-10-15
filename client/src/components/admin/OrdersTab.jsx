import React, { useState } from 'react';
import {
  Clock,
  ChefHat,
  Bell,
  CheckCircle2,
  Printer,
  XCircle,
  Volume2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { formatRupiah, formatTimeAgo, formatDate } from '../../utils/format';
import { playNotificationSound } from '../../utils/sound';

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Semua Pesanan' },
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'PREPARING', label: 'Dimasak' },
  { key: 'READY', label: 'Siap Disajikan' },
  { key: 'COMPLETED', label: 'Selesai' },
  { key: 'CANCELLED', label: 'Dibatalkan' },
];

export default function OrdersTab({
  orders = [],
  onUpdateStatus,
  onTogglePayment,
  onPrintReceipt,
  onRefresh,
}) {
  const [filter, setFilter] = useState('ALL');

  const filteredOrders = orders.filter((ord) => {
    if (filter === 'ALL') return true;
    if (filter === 'PREPARING') return ord.status === 'PREPARING' || ord.status === 'CONFIRMED';
    return ord.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white text-black animate-pulse flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 'CONFIRMED':
      case 'PREPARING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-800 text-white border border-zinc-700 flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            Sedang Dimasak
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white text-black font-extrabold flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Siap Disajikan
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900 text-zinc-600 border border-zinc-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Batal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((sf) => {
            const count =
              sf.key === 'ALL'
                ? orders.length
                : orders.filter((o) =>
                    sf.key === 'PREPARING'
                      ? o.status === 'PREPARING' || o.status === 'CONFIRMED'
                      : o.status === sf.key
                  ).length;

            return (
              <button
                key={sf.key}
                onClick={() => setFilter(sf.key)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                  filter === sf.key
                    ? 'bg-white text-black shadow-md'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                <span>{sf.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === sf.key ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action utility buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => playNotificationSound()}
            title="Tes Suara Notifikasi Pesanan"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tes Audio</span>
          </button>
          <button
            onClick={onRefresh}
            title="Muat Ulang Pesanan"
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-3">
          <Clock className="w-12 h-12 text-zinc-600 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-white tracking-wide">Belum Ada Pesanan</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Saat ini tidak ada pesanan dengan filter status ini. Pesanan baru dari pelanggan akan muncul secara otomatis secara real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                ord.status === 'PENDING'
                  ? 'bg-zinc-950 border-white/40 shadow-xl shadow-black/80 ring-1 ring-white/20'
                  : ord.status === 'PREPARING'
                  ? 'bg-zinc-950 border-zinc-700'
                  : ord.status === 'READY'
                  ? 'bg-zinc-950 border-zinc-400'
                  : 'bg-zinc-950/60 border-zinc-900 opacity-75'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-white text-black font-black text-xs tracking-wider">
                      {ord.table_number}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-300">
                      {ord.order_number}
                    </span>
                  </div>
                  {getStatusBadge(ord.status)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <div>
                    Pelanggan: <span className="text-white font-semibold">{ord.customer_name}</span>
                  </div>
                  <span>{formatTimeAgo(ord.created_at)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 flex-1 space-y-2.5">
                {ord.customer_notes && (
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Catatan: {ord.customer_notes}</span>
                  </div>
                )}

                <div className="space-y-2 divide-y divide-zinc-900">
                  {ord.items &&
                    ord.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 text-center font-mono font-bold leading-5 text-[11px]">
                              {item.quantity}x
                            </span>
                            <span>{item.item_name || item.name}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-zinc-400 italic pl-6 mt-0.5">
                              * {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-zinc-400 text-[11px]">
                          {formatRupiah((item.item_price || item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {/* Payment toggle badge */}
                  <button
                    onClick={() =>
                      onTogglePayment(ord.id, ord.payment_status === 'PAID' ? 'UNPAID' : 'PAID')
                    }
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors ${
                      ord.payment_status === 'PAID'
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {ord.payment_status === 'PAID' ? '✓ Lunas' : 'Belum Lunas'}
                  </button>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Total Bayar:</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {formatRupiah(ord.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  {ord.status === 'PENDING' && (
                    <button
                      onClick={() => onUpdateStatus(ord.id, 'PREPARING')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      Terima & Masak
                    </button>
                  )}

                  {(ord.status === 'PREPARING' || ord.status === 'CONFIRMED') && (
                    <button
                      onClick={() => onUpdateStatus(ord.id, 'READY')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Tandai Siap
                    </button>
                  )}

                  {ord.status === 'READY' && (
                    <button
                      onClick={() => onUpdateStatus(ord.id, 'COMPLETED')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selesaikan
                    </button>
                  )}

                  <button
                    onClick={() => onPrintReceipt(ord)}
                    title="Cetak Struk Pesanan"
                    className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {ord.status !== 'CANCELLED' && ord.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        if (confirm(`Batalkan pesanan #${ord.order_number}?`)) {
                          onUpdateStatus(ord.id, 'CANCELLED');
                        }
                      }}
                      title="Batalkan Pesanan"
                      className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
