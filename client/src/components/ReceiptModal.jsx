import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ChefHat, Coffee, Receipt, FileText } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/format';

export default function ReceiptModal({ order, onClose, isAdmin = false }) {
  if (!order) return null;

  // Slide tabs for Admin: 'all' (default 4 slides), 'cashier' (1), 'kitchen' (2), 'bar' (3), 'customer' (4)
  const [activeTab, setActiveTab] = useState('all');

  // Activate body class on mount so CSS print styles isolate the modal and hide #root completely
  useEffect(() => {
    document.body.classList.add('modal-receipt-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-receipt-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const items = order.items || [];

  // Determine which slides to render:
  // - Customer view (!isAdmin): strictly customer slide only (single receipt)
  // - Admin view (isAdmin): supports all 4 slides or individual tabs
  const showCashier = isAdmin && (activeTab === 'all' || activeTab === 'cashier');
  const showKitchen = isAdmin && (activeTab === 'all' || activeTab === 'kitchen');
  const showBar = isAdmin && (activeTab === 'all' || activeTab === 'bar');
  const showCustomer = !isAdmin || (isAdmin && (activeTab === 'all' || activeTab === 'customer'));

  // Dynamic print button title
  const getPrintButtonText = () => {
    if (!isAdmin) return 'Cetak Struk (1 Lembar)';
    if (activeTab === 'all') return 'Cetak Semua Struk (4 Slide)';
    if (activeTab === 'cashier') return 'Cetak Lembar Kasir (1 Slide)';
    if (activeTab === 'kitchen') return 'Cetak Lembar Dapur (1 Slide)';
    if (activeTab === 'bar') return 'Cetak Lembar Barista (1 Slide)';
    return 'Cetak Lembar Pelanggan (1 Slide)';
  };

  // -------------------------------------------------------------
  // SLIDE 1: LEMBAR KASIR & KEUANGAN (Merchant Financial Copy)
  // -------------------------------------------------------------
  const renderCashierSlide = (isMulti) => (
    <div
      key="slide-cashier"
      className={`receipt-page font-mono text-[11px] text-zinc-300 print:text-black ${
        isMulti ? 'receipt-page-break' : 'receipt-page-no-break'
      }`}
    >
      {/* Slide Badge (Visible in Admin preview & print) */}
      <div className="mb-2 pb-1.5 border-b border-zinc-700 print:border-black text-center">
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 print:bg-black print:text-white uppercase">
          SLIDE 1/4 • LEMBAR KASIR & KEUANGAN
        </span>
      </div>

      {/* Header */}
      <div className="text-center pb-2.5 border-b border-dashed border-zinc-700 print:border-black">
        <h1 className="text-sm font-bold tracking-widest uppercase text-white print:text-black">
          LA JAVA CAFE & RESTO
        </h1>
        <p className="text-[9px] text-zinc-400 print:text-zinc-700 tracking-wider">
          ARTISAN COFFEE & INDONESIAN GOURMET
        </p>
        <p className="text-[9px] text-zinc-500 print:text-zinc-600">
          Jl. Malioboro No. 45, Yogyakarta • Tel: (0274) 555-890
        </p>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">No. Pesanan:</span>
          <span className="font-bold text-zinc-200 print:text-black">{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Meja:</span>
          <span className="font-bold text-zinc-200 print:text-black">{order.table_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Pelanggan:</span>
          <span className="font-semibold text-zinc-200 print:text-black">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Waktu Order:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Metode Bayar:</span>
          <span className="font-semibold text-white print:text-black">
            {order.payment_method === 'QRIS' ? 'QRIS Kasir' : 'Kasir (Tunai / Debit / QRIS)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Status Pembayaran:</span>
          <span className="font-bold text-white print:text-black">
            {order.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'BELUM BAYAR (UNPAID)'}
          </span>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-1.5">
        <div className="flex justify-between text-zinc-500 print:text-zinc-600 text-[9px] uppercase font-bold">
          <span>Item Menu</span>
          <span>Subtotal</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="space-y-0.5 text-[10px]">
            <div className="flex justify-between text-zinc-200 print:text-black">
              <span className="font-medium">
                {item.item_name || item.name}{' '}
                <span className="text-zinc-400 print:text-zinc-600 font-bold">x{item.quantity}</span>
              </span>
              <span>{formatRupiah((item.item_price || item.price) * item.quantity)}</span>
            </div>
            {item.notes && (
              <div className="text-[9px] text-zinc-400 print:text-zinc-600 italic pl-2">
                * {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pricing Totals */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-400 print:text-zinc-600">Subtotal:</span>
          <span>{formatRupiah(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400 print:text-zinc-600">Pajak Resto (PB1 10%):</span>
          <span>{formatRupiah(order.tax)}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-white print:text-black pt-1">
          <span>TOTAL BAYAR:</span>
          <span>{formatRupiah(order.total_amount)}</span>
        </div>
      </div>

      {/* Cashier Footer - Pure System Printout */}
      <div className="pt-2 text-[9px] text-center space-y-1 text-zinc-400 print:text-zinc-700">
        <p className="text-[9px] text-zinc-500 print:text-zinc-600">
          * Arsip Pembukuan Kasir & Rekonsiliasi Harian *
        </p>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SLIDE 2: LEMBAR DAPUR / KITCHEN TICKET (KOT)
  // -------------------------------------------------------------
  const renderKitchenSlide = (isMulti) => (
    <div
      key="slide-kitchen"
      className={`receipt-page font-mono text-[11px] text-zinc-300 print:text-black ${
        isMulti ? 'receipt-page-break' : 'receipt-page-no-break'
      }`}
    >
      {/* Slide Badge */}
      <div className="mb-2 pb-1.5 border-b border-zinc-700 print:border-black text-center">
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 print:bg-black print:text-white uppercase">
          SLIDE 2/4 • LEMBAR DAPUR (KITCHEN TICKET)
        </span>
      </div>

      {/* Big Kitchen Header */}
      <div className="text-center pb-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5">
        <h2 className="text-xs font-black tracking-widest uppercase text-white print:text-black">
          *** KITCHEN ORDER TICKET (KOT) ***
        </h2>
        <div className="flex justify-center items-center gap-3 pt-1">
          <div className="px-3 py-1 rounded-lg border-2 border-white print:border-black">
            <span className="text-sm font-black text-white print:text-black">
              MEJA: {order.table_number}
            </span>
          </div>
          <span className="text-[11px] font-bold text-zinc-300 print:text-black">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Pelanggan:</span>
          <span className="font-bold text-white print:text-black">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Waktu Masuk:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        {order.customer_notes && (
          <div className="p-1 rounded bg-zinc-900 print:bg-zinc-100 text-amber-300 print:text-black font-semibold text-[10px]">
            Catatan Meja: {order.customer_notes}
          </div>
        )}
      </div>

      {/* Kitchen Items - Full Unified Order List */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-2">
        <div className="text-[9px] uppercase font-bold text-zinc-400 print:text-zinc-700 border-b border-zinc-800 print:border-zinc-300 pb-0.5">
          DAFTAR PESANAN:
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="space-y-0.5 pb-1">
            <div className="flex items-start justify-between text-xs font-bold text-white print:text-black">
              <span className="tracking-wide">
                [{item.quantity}x] {item.item_name || item.name}
              </span>
            </div>
            {item.notes ? (
              <div className="text-[10px] font-bold text-amber-400 print:text-black pl-3 bg-zinc-900/60 print:bg-zinc-100 py-0.5 rounded">
                &gt;&gt; CATATAN: {item.notes}
              </div>
            ) : (
              <div className="text-[9px] text-zinc-500 print:text-zinc-600 pl-3">
                (Standar / Normal)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Kitchen Footer - Pure System Printout */}
      <div className="pt-2 text-[9px] text-center text-zinc-500 print:text-zinc-600 italic">
        * Tiket otomatis dapur — Segera siapkan pesanan *
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SLIDE 3: LEMBAR BARISTA / BAR (BOT)
  // -------------------------------------------------------------
  const renderBarSlide = (isMulti) => (
    <div
      key="slide-bar"
      className={`receipt-page font-mono text-[11px] text-zinc-300 print:text-black ${
        isMulti ? 'receipt-page-break' : 'receipt-page-no-break'
      }`}
    >
      {/* Slide Badge */}
      <div className="mb-2 pb-1.5 border-b border-zinc-700 print:border-black text-center">
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 print:bg-black print:text-white uppercase">
          SLIDE 3/4 • LEMBAR BARISTA / BAR
        </span>
      </div>

      {/* Big Bar Header */}
      <div className="text-center pb-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5">
        <h2 className="text-xs font-black tracking-widest uppercase text-white print:text-black">
          *** BEVERAGE ORDER TICKET (BOT) ***
        </h2>
        <div className="flex justify-center items-center gap-3 pt-1">
          <div className="px-3 py-1 rounded-lg border-2 border-white print:border-black">
            <span className="text-sm font-black text-white print:text-black">
              MEJA: {order.table_number}
            </span>
          </div>
          <span className="text-[11px] font-bold text-zinc-300 print:text-black">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Pelanggan:</span>
          <span className="font-bold text-white print:text-black">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Waktu Masuk:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        {order.customer_notes && (
          <div className="p-1 rounded bg-zinc-900 print:bg-zinc-100 text-sky-300 print:text-black font-semibold text-[10px]">
            Catatan Meja: {order.customer_notes}
          </div>
        )}
      </div>

      {/* Bar Items - Full Unified Order List */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-2">
        <div className="text-[9px] uppercase font-bold text-zinc-400 print:text-zinc-700 border-b border-zinc-800 print:border-zinc-300 pb-0.5">
          DAFTAR PESANAN:
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="space-y-0.5 pb-1">
            <div className="flex items-start justify-between text-xs font-bold text-white print:text-black">
              <span className="tracking-wide">
                [{item.quantity}x] {item.item_name || item.name}
              </span>
            </div>
            {item.notes ? (
              <div className="text-[10px] font-bold text-sky-400 print:text-black pl-3 bg-zinc-900/60 print:bg-zinc-100 py-0.5 rounded">
                &gt;&gt; CATATAN: {item.notes}
              </div>
            ) : (
              <div className="text-[9px] text-zinc-500 print:text-zinc-600 pl-3">
                (Standar / Normal)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bar Footer - Pure System Printout */}
      <div className="pt-2 text-[9px] text-center text-zinc-500 print:text-zinc-600 italic">
        * Tiket otomatis bar — Segera racik & sajikan *
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SLIDE 4 / CUSTOMER SLIDE: LEMBAR PELANGGAN (Customer Bill)
  // -------------------------------------------------------------
  const renderCustomerSlide = (isMulti) => (
    <div
      key="slide-customer"
      className={`receipt-page font-mono text-[11px] text-zinc-300 print:text-black receipt-page-no-break`}
    >
      {/* Slide Badge if Admin */}
      {isAdmin && (
        <div className="mb-2 pb-1.5 border-b border-zinc-700 print:border-black text-center">
          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 print:bg-black print:text-white uppercase">
            SLIDE 4/4 • LEMBAR PELANGGAN / MEJA
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center pb-2.5 border-b border-dashed border-zinc-700 print:border-black">
        <h1 className="text-sm font-bold tracking-widest uppercase text-white print:text-black">
          LA JAVA CAFE & RESTO
        </h1>
        <p className="text-[9px] text-zinc-400 print:text-zinc-700 tracking-wider">
          ARTISAN COFFEE & INDONESIAN GOURMET
        </p>
        <p className="text-[9px] text-zinc-500 print:text-zinc-600">
          Jl. Malioboro No. 45, Yogyakarta • Tel: (0274) 555-890
        </p>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">No. Pesanan:</span>
          <span className="font-bold text-zinc-200 print:text-black">{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Meja:</span>
          <span className="font-bold text-zinc-200 print:text-black">{order.table_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Pelanggan:</span>
          <span className="font-semibold text-zinc-200 print:text-black">{order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Waktu:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Metode Bayar:</span>
          <span className="font-semibold text-white print:text-black">
            {order.payment_method === 'QRIS' ? 'QRIS Kasir' : 'Kasir (Tunai / Debit / QRIS)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 print:text-zinc-600">Status Pembayaran:</span>
          <span className="font-bold text-white print:text-black">
            {order.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'BELUM DIBAYAR'}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-1.5">
        <div className="flex justify-between text-zinc-500 print:text-zinc-600 text-[9px] uppercase font-bold">
          <span>Item Menu</span>
          <span>Subtotal</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="space-y-0.5 text-[10px]">
            <div className="flex justify-between text-zinc-200 print:text-black">
              <span className="font-medium">
                {item.item_name || item.name}{' '}
                <span className="text-zinc-400 print:text-zinc-600 font-bold">x{item.quantity}</span>
              </span>
              <span>{formatRupiah((item.item_price || item.price) * item.quantity)}</span>
            </div>
            {item.notes && (
              <div className="text-[9px] text-zinc-400 print:text-zinc-600 italic pl-2">
                * {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pricing Totals */}
      <div className="py-2 border-b border-dashed border-zinc-700 print:border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-400 print:text-zinc-600">Subtotal:</span>
          <span>{formatRupiah(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400 print:text-zinc-600">Pajak Resto (PB1 10%):</span>
          <span>{formatRupiah(order.tax)}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-white print:text-black pt-1">
          <span>TOTAL BAYAR:</span>
          <span>{formatRupiah(order.total_amount)}</span>
        </div>
      </div>

      {/* WiFi, Barcode & Friendly Closing */}
      <div className="pt-2 text-center space-y-1 text-zinc-400 print:text-zinc-700">
        <div className="p-1 rounded bg-zinc-900 print:bg-zinc-100 text-[9px] font-semibold text-zinc-300 print:text-black">
          Wi-Fi: <span className="font-bold">La java</span> | Pass: <span className="font-bold">solobaru</span>
        </div>
        <div className="inline-block py-0.5 tracking-widest text-zinc-500 print:text-black font-mono text-[9px] select-none">
          ||| | ||||| || |||| ||| ||||| || ||| |||||
        </div>
        <p className="text-[9px] text-zinc-400 print:text-zinc-700 font-medium">
          Terima kasih atas kunjungan Anda di La Java!
        </p>
        <p className="text-[8px] text-zinc-500 print:text-zinc-600">
          Simpan struk ini sebagai bukti pemesanan yang sah.
        </p>
      </div>
    </div>
  );

  // Content to render into portal
  const modalContent = (
    <div
      className="receipt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="receipt-modal-box relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-zinc-300" />
            <div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-100">
                {isAdmin ? 'Cetak Struk Pesanan (Admin Multi-Slide)' : 'Struk Pembelian Pelanggan'}
              </h3>
              <p className="text-[10px] text-zinc-400">
                {isAdmin ? '4 Slide Terpisah: Kasir, Dapur, Bar & Pelanggan' : 'Format 1 Lembar Thermal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Slide Selector Tabs (Hidden on print) */}
        {isAdmin && (
          <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center gap-1.5 overflow-x-auto no-print text-[11px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Semua (4 Slide)</span>
            </button>
            <button
              onClick={() => setActiveTab('cashier')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'cashier'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>1. Kasir</span>
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'kitchen'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>2. Dapur</span>
            </button>
            <button
              onClick={() => setActiveTab('bar')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'bar'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>3. Bar</span>
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'customer'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>4. Pelanggan</span>
            </button>
          </div>
        )}

        {/* Printable Receipt Slides Container */}
        <div className="receipt-printable p-5 overflow-y-auto space-y-6 flex-1 print:p-0 print:m-0 print:space-y-0">
          {/* Cashier Slide */}
          {showCashier && renderCashierSlide(isAdmin && activeTab === 'all')}

          {/* Kitchen Slide */}
          {showKitchen && renderKitchenSlide(isAdmin && activeTab === 'all')}

          {/* Bar Slide */}
          {showBar && renderBarSlide(isAdmin && activeTab === 'all')}

          {/* Customer Slide */}
          {showCustomer && renderCustomerSlide(false)}
        </div>

        {/* Modal Action Footer (Hidden on print) */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors shadow-lg active:scale-[0.99]"
          >
            <Printer className="w-4 h-4" />
            <span>{getPrintButtonText()}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-xs hover:bg-zinc-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  // Portal into #print-portal if available, otherwise document.body
  const portalTarget = document.getElementById('print-portal') || document.body;
  return createPortal(modalContent, portalTarget);
}
