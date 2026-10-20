import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatRupiah, formatDate } from '../../utils/format';

export default function ZReportModal({ isOpen, onClose, stats, orders = [] }) {
  const printRef = useRef(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Laporan Kasir (Z-Report)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Printable Content */}
        <div ref={printRef} className="overflow-y-auto space-y-4 font-mono text-xs text-zinc-300 print:text-black">
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
          <div className="space-y-1 pb-3 border-b border-dashed border-zinc-700 print:border-black text-[11px]">
            <div className="flex justify-between">
              <span>Total Pesanan Hari Ini:</span>
              <span className="font-bold text-white print:text-black">{todayOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan Selesai (Completed):</span>
              <span>{completedOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan Masih Aktif:</span>
              <span>{activeOrdersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan Belum Lunas:</span>
              <span>{unpaidCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Pesanan Dibatalkan:</span>
              <span>{cancelledCount}</span>
            </div>
          </div>

          {/* Top 5 Items */}
          {topItems && topItems.length > 0 && (
            <div className="space-y-1.5 pb-3 border-b border-dashed border-zinc-700 print:border-black">
              <span className="font-bold text-white print:text-black block text-[11px]">MENU TERLARIS (TOP 5):</span>
              {topItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate pr-2">{idx + 1}. {item.item_name}</span>
                  <span className="shrink-0">{item.total_sold}x</span>
                </div>
              ))}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-4 text-center space-y-8 text-[10px] text-zinc-400 print:text-black">
            <div className="flex justify-between px-4">
              <div>
                <p>Kasir / Operator,</p>
                <div className="h-10"></div>
                <p className="border-t border-zinc-700 print:border-black pt-1">( .................... )</p>
              </div>
              <div>
                <p>Supervisor / Owner,</p>
                <div className="h-10"></div>
                <p className="border-t border-zinc-700 print:border-black pt-1">( .................... )</p>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 print:text-black">-- Akhir Laporan Transaksi --</p>
          </div>
        </div>

        {/* Buttons - Hidden on print */}
        <div className="pt-3 border-t border-zinc-800 flex gap-2 print:hidden">
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
            <span>Cetak Thermal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
