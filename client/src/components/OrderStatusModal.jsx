import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle2, ChefHat, Bell, Receipt, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { socket, joinOrderRoom } from '../socket';
import { formatRupiah, formatDate } from '../utils/format';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Menunggu', desc: 'Dapur telah menerima pesanan Anda', icon: Clock },
  { key: 'PREPARING', label: 'Dimasak', desc: 'Chef sedang menyiapkan pesanan Anda', icon: ChefHat },
  { key: 'READY', label: 'Siap Disajikan', desc: 'Pesanan siap diantar ke meja Anda!', icon: Bell },
  { key: 'COMPLETED', label: 'Selesai', desc: 'Pesanan telah selesai dinikmati', icon: CheckCircle2 },
];

export default function OrderStatusModal({ order: initialOrder, isOpen, onClose, onViewReceipt }) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    setOrder(initialOrder);
    if (!initialOrder?.id) return;

    joinOrderRoom(initialOrder.id);

    const handleStatusUpdate = (updatedOrder) => {
      if (updatedOrder.id === initialOrder.id) {
        setOrder(updatedOrder);

        if (updatedOrder.status === 'READY' || updatedOrder.status === 'COMPLETED') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#a1a1aa', '#52525b', '#000000'],
          });
        }
      }
    };

    const handlePaymentUpdate = (updatedOrder) => {
      if (updatedOrder.id === initialOrder.id) {
        setOrder(updatedOrder);
      }
    };

    socket.on('order:status_updated', handleStatusUpdate);
    socket.on('order:payment_updated', handlePaymentUpdate);

    return () => {
      socket.off('order:status_updated', handleStatusUpdate);
      socket.off('order:payment_updated', handlePaymentUpdate);
    };
  }, [initialOrder]);

  if (!isOpen || !order) return null;

  const currentStepIndex = () => {
    if (order.status === 'CANCELLED') return -1;
    if (order.status === 'PENDING') return 0;
    if (order.status === 'CONFIRMED' || order.status === 'PREPARING') return 1;
    if (order.status === 'READY') return 2;
    if (order.status === 'COMPLETED') return 3;
    return 0;
  };

  const activeIndex = currentStepIndex();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Live Status Pesanan</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">{order.order_number}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Table & Date Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <div>
              <p className="text-xs text-zinc-400">Nomor Meja</p>
              <p className="text-lg font-extrabold text-white tracking-wider">{order.table_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400">Pelanggan</p>
              <p className="text-sm font-semibold text-zinc-200">{order.customer_name}</p>
            </div>
          </div>

          {/* Stepper Status Progress */}
          {order.status === 'CANCELLED' ? (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
              <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Pesanan Dibatalkan</h3>
              <p className="text-xs text-zinc-400">Pesanan ini telah dibatalkan oleh pihak resto.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative flex justify-between">
                {/* Connecting track */}
                <div className="absolute top-5 left-5 right-5 h-[2px] bg-zinc-800 -z-0">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx < activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 w-20">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCurrent
                            ? 'bg-white text-black border-white shadow-lg ring-4 ring-white/20 scale-110'
                            : isDone
                            ? 'bg-zinc-800 text-white border-white'
                            : 'bg-zinc-950 text-zinc-600 border-zinc-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] mt-2 font-semibold text-center tracking-tight ${
                          isCurrent ? 'text-white' : isDone ? 'text-zinc-300' : 'text-zinc-600'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status explanation alert */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    {STATUS_STEPS[activeIndex]?.desc || 'Memproses...'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Halaman ini diperbarui secara otomatis secara real-time tanpa perlu refresh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Rincian Menu Pesanan</h4>
            <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-2xl bg-zinc-900/30 overflow-hidden">
              {order.items &&
                order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-white">
                        {item.item_name || item.name} <span className="text-zinc-400 font-normal">x{item.quantity}</span>
                      </p>
                      {item.notes && <p className="text-[11px] text-zinc-400 italic mt-0.5">Catatan: {item.notes}</p>}
                    </div>
                    <span className="font-mono text-zinc-300">
                      {formatRupiah((item.item_price || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
            </div>

            {/* Total */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Pajak Restoran (10%)</span>
                <span className="font-mono">{formatRupiah(order.tax)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-zinc-800">
                <span>Total Bayar</span>
                <span className="font-mono text-base">{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 flex gap-3">
          <button
            onClick={() => onViewReceipt(order)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-700 bg-zinc-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-zinc-800 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            Lihat Struk
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
