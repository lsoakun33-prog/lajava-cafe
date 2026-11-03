import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, CheckCircle2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatRupiah, formatDate } from '../../utils/format';

export default function ZReportModal({ isOpen, onClose, stats, orders = [] }) {
  const printRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('modal-zreport-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-zreport-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !stats) return null;

  const {
    totalRevenue = 0,
    todayOrdersCount = 0,
    activeOrdersCount = 0,
    completedOrdersCount = 0,
    topItems = [],
  } = stats;

  // Breakdown payment methods for completed orders
  const paidQris = orders
    .filter((o) => o.payment_method === 'QRIS' && o.payment_status === 'PAID')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const paidCash = orders
    .filter((o) => o.payment_method === 'CASHIER' && o.payment_status === 'PAID')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const unpaidCount = orders.filter((o) => o.payment_status === 'UNPAID' && o.status !== 'CANCELLED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      className="receipt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="receipt-modal-box relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Laporan Kasir (Z-Report)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Printable Content */}
        <div ref={printRef} className="receipt-printable receipt-page receipt-page-no-break overflow-y-auto space-y-4 font-mono text-xs text-zinc-300 print:text-black">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-700 print:border-black">
            <h2 className="text-base font-black tracking-widest uppercase text-white print:text-black">LA JAVA CAFE & RESTO</h2>
            <p className="text-[10px] text-zinc-400 print:text-black">Artisan Coffee & Self-Order System</p>
            <p className="text-[10px] text-zinc-500 print:text-black">*** LAPORAN TUTUP KASIR (Z-REPORT) ***</p>
            <p className="text-[10px] text-zinc-400 print:text-black pt-1">
              Waktu: {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-zinc-700 print:border-black">
            <div className="flex justify-between font-bold text-white print:text-black">
              <span>TOTAL OMZET:</span>
              <span>{formatRupiah(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 print:text-black text-[11px]">
              <span>- QRIS (Digital):</span>
              <span>{formatRupiah(paidQris)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 print:text-black text-[11px]">
              <span>- Kasir (Tunai/Card):</span>
              <span>{formatRupiah(paidCash)}</span>
            </div>
          </div>

          {/* Volume Summary */}
          <div className="space-y-1.5 pb-3 border-b border-dashed border-zinc-700 print:border-black text-[11px]">
            <div className="flex justify-between">
              <span>Total Pesanan Hari Ini:</span>
              <span className="font-bold text-white print:text-black">{todayOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan Selesai:</span>
              <span className="font-bold text-white print:text-black">{completedOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan Aktif / Antrean:</span>
              <span className="text-amber-400 print:text-black">{activeOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Belum Dibayar:</span>
              <span className="text-rose-400 print:text-black">{unpaidCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Dibatalkan:</span>
              <span className="text-zinc-500 print:text-black">{cancelledCount}</span>
            </div>
          </div>

          {/* Top 5 Items */}
          {topItems.length > 0 && (
            <div className="space-y-1.5 pb-3 border-b border-dashed border-zinc-700 print:border-black text-[11px]">
              <p className="font-bold uppercase text-[10px] text-zinc-400 print:text-black">Menu Terlaris:</p>
              {topItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{idx + 1}. {item.item_name}</span>
                  <span className="font-bold">{item.total_sold} terjual</span>
                </div>
              ))}
            </div>
          )}

          {/* Automated System Report Footer */}
          <div className="pt-2 text-center space-y-1">
            <p className="text-[10px] text-zinc-400 print:text-black">
              * Dicetak Otomatis oleh Sistem Kasir La Java *
            </p>
            <p className="text-[9px] text-zinc-500 print:text-black">-- Akhir Laporan Transaksi --</p>
          </div>
        </div>

        {/* Buttons - Hidden on print */}
        <div className="pt-3 border-t border-zinc-800 flex gap-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Thermal (1 Slide)</span>
          </button>
        </div>
      </div>
    </div>
  );

  const portalTarget = document.getElementById('print-portal') || document.body;
  return createPortal(modalContent, portalTarget);
}
