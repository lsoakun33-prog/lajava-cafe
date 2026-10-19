import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  Receipt,
  Sparkles,
  AlertCircle,
  RefreshCw,
  PartyPopper,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { socket, joinOrderRoom } from '../socket';
import { api } from '../api';
import { formatRupiah } from '../utils/format';

const STATUS_STEPS = [
  { key: 'PENDING',   label: 'Diterima',       desc: 'Pesanan sudah diterima dapur, sedang dikonfirmasi...', icon: Clock },
  { key: 'PREPARING', label: 'Dimasak',         desc: 'Chef sedang menyiapkan pesanan Anda dengan penuh cinta! 🍳', icon: ChefHat },
  { key: 'READY',     label: 'Siap Disajikan',  desc: 'Pesanan siap! Pelayan sedang menuju meja Anda 🏃', icon: Bell },
  { key: 'COMPLETED', label: 'Selesai',          desc: 'Pesanan sudah selesai. Selamat menikmati! 😊', icon: CheckCircle2 },
];

function getStepIndex(status) {
  if (!status || status === 'PENDING') return 0;
  if (status === 'CONFIRMED' || status === 'PREPARING') return 1;
  if (status === 'READY') return 2;
  if (status === 'COMPLETED') return 3;
  return 0;
}

export default function OrderStatusModal({ order: initialOrder, isOpen, onClose, onViewReceipt, onOrderUpdated, onCustomerConfirm, autoCloseDeadline }) {
  const [order, setOrder] = useState(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasShownCompletedConfetti, setHasShownCompletedConfetti] = useState(false);
  const [countdown, setCountdown] = useState(''); // "4:32" countdown text

  // ─── Fetch latest status from API ──────────────────────────────────────────
  const fetchLatestOrder = useCallback(async (orderId) => {
    if (!orderId) return;
    try {
      setIsRefreshing(true);
      const res = await api.getOrder(orderId);
      if (res.success && res.data) {
        const freshOrder = res.data;
        setOrder(freshOrder);
        // Sync back to parent (CustomerView) so localStorage is updated too
        if (onOrderUpdated) onOrderUpdated(freshOrder);
      }
    } catch (err) {
      console.warn('[OrderStatusModal] Gagal refresh status pesanan:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [onOrderUpdated]);

  // ─── On open: always fetch fresh data + join socket room ───────────────────
  useEffect(() => {
    if (!isOpen || !initialOrder?.id) return;

    // 1. Update local state with what we already have (may be stale)
    setOrder(initialOrder);

    // 2. Immediately fetch the real current status from server
    fetchLatestOrder(initialOrder.id);

    // 3. Join socket room so we get live updates going forward
    joinOrderRoom(initialOrder.id);

    // 4. Wire up socket listeners
    const handleStatusUpdate = (updatedOrder) => {
      if (updatedOrder.id !== initialOrder.id) return;
      setOrder(updatedOrder);
      if (onOrderUpdated) onOrderUpdated(updatedOrder);

      if (updatedOrder.status === 'READY' || updatedOrder.status === 'COMPLETED') {
        triggerConfetti();
      }
    };

    const handlePaymentUpdate = (updatedOrder) => {
      if (updatedOrder.id !== initialOrder.id) return;
      setOrder(updatedOrder);
      if (onOrderUpdated) onOrderUpdated(updatedOrder);
    };

    socket.on('order:status_updated', handleStatusUpdate);
    socket.on('order:payment_updated', handlePaymentUpdate);

    return () => {
      socket.off('order:status_updated', handleStatusUpdate);
      socket.off('order:payment_updated', handlePaymentUpdate);
    };
  }, [isOpen, initialOrder?.id]);

  // ─── Fire confetti when order reaches READY/COMPLETED ──────────────────────
  useEffect(() => {
    if (!order) return;
    if (
      (order.status === 'READY' || order.status === 'COMPLETED') &&
      !hasShownCompletedConfetti
    ) {
      triggerConfetti();
      setHasShownCompletedConfetti(true);
    }
  }, [order?.status]);

  // Reset confetti flag when a new order is loaded
  useEffect(() => {
    setHasShownCompletedConfetti(false);
  }, [initialOrder?.id]);

  function triggerConfetti() {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#ffffff', '#a1a1aa', '#52525b', '#d4d4d4'],
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#ffffff', '#e4e4e7'],
      });
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#ffffff', '#e4e4e7'],
      });
    }, 350);
  }

  // ─── Live countdown from autoCloseDeadline ──────────────────────────────────
  // Ticks every second while admin's 5-min grace period is running
  useEffect(() => {
    if (!autoCloseDeadline) {
      setCountdown('');
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, autoCloseDeadline - Date.now());
      if (remaining === 0) { setCountdown(''); return; }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [autoCloseDeadline]);

  if (!isOpen || !order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';
  const activeIndex = getStepIndex(order.status);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <PartyPopper className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                {isCompleted ? 'Pesanan Selesai 🎉' : 'Live Status Pesanan'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">{order.order_number}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Manual refresh button */}
            <button
              onClick={() => fetchLatestOrder(order.id)}
              disabled={isRefreshing}
              title="Perbarui Status"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Table / Customer Banner */}
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

          {/* ── CANCELLED State ─────────────────────────────────────────── */}
          {isCancelled ? (
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
              <AlertCircle className="w-10 h-10 text-zinc-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">Pesanan Dibatalkan</h3>
              <p className="text-xs text-zinc-400">Pesanan ini telah dibatalkan. Silakan hubungi pelayan untuk informasi lebih lanjut.</p>
            </div>

          /* ── COMPLETED State (full celebratory) ─────────────────────── */
          ) : isCompleted ? (
            <div className="space-y-4">
              {/* All steps filled */}
              <div className="relative flex justify-between">
                <div className="absolute top-5 left-5 right-5 h-[2px] bg-white -z-0" />
                {STATUS_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 w-20">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white text-black border-white shadow-lg">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] mt-2 font-semibold text-center tracking-tight text-white">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Completed call-to-action banner */}
              <div className="p-5 rounded-2xl bg-white text-black text-center shadow-xl space-y-1">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-1" />
                <p className="text-sm font-black tracking-wide">Pesanan Selesai!</p>
                <p className="text-xs font-medium text-zinc-700">
                  Terima kasih telah makan di La Java Cafe &amp; Resto 🙌
                </p>
                {/* Countdown: only shown when admin triggered completion (5-min grace) */}
                {countdown && (
                  <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200 mt-2">
                    Info pesanan tertutup otomatis dalam{' '}
                    <span className="font-black text-black tabular-nums">{countdown}</span>
                  </p>
                )}
              </div>
            </div>

          /* ── IN-PROGRESS Stepper ────────────────────────────────────── */
          ) : (
            <div className="space-y-4">
              <div className="relative flex justify-between">
                {/* Track */}
                <div className="absolute top-5 left-5 right-5 h-[2px] bg-zinc-800 -z-0">
                  <div
                    className="h-full bg-white transition-all duration-700 ease-in-out"
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
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

              {/* Description */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    {STATUS_STEPS[activeIndex]?.desc || 'Memproses...'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Status diperbarui otomatis secara <span className="text-white font-semibold">real-time</span>. Tidak perlu refresh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Items Detail ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Rincian Pesanan</h4>
            <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-2xl bg-zinc-900/30 overflow-hidden">
              {order.items &&
                order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-white">
                        {item.item_name || item.name}{' '}
                        <span className="text-zinc-400 font-normal">x{item.quantity}</span>
                      </p>
                      {item.notes && (
                        <p className="text-[11px] text-zinc-400 italic mt-0.5">Catatan: {item.notes}</p>
                      )}
                    </div>
                    <span className="font-mono text-zinc-300">
                      {formatRupiah((item.item_price || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
            </div>

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

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/60 flex gap-3">
          <button
            onClick={() => onViewReceipt(order)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-700 bg-zinc-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-zinc-800 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            Lihat Struk
          </button>
          {isCompleted ? (
            /* Customer confirms done → immediate clear of active order */
            <button
              onClick={onCustomerConfirm || onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors"
            >
              Selesai ✓
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
