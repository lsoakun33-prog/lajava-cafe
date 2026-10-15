import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/format';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">Struk Pembelian</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-zinc-300 print:text-black print:bg-white print:p-0">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-zinc-700">
            <h1 className="text-base font-bold tracking-widest uppercase text-white print:text-black">LA JAVA CAFE & RESTO</h1>
            <p className="text-[10px] text-zinc-500 print:text-zinc-700">ARTISAN COFFEE & INDONESIAN GOURMET</p>
            <p className="text-[10px] text-zinc-500 print:text-zinc-700">Jl. Malioboro No. 45, Yogyakarta</p>
            <p className="text-[10px] text-zinc-500 print:text-zinc-700">Tel: (0274) 555-890</p>
          </div>

          {/* Meta Info */}
          <div className="py-3 border-b border-dashed border-zinc-700 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">No. Pesanan:</span>
              <span className="font-semibold text-zinc-200 print:text-black">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Meja:</span>
              <span className="font-semibold text-zinc-200 print:text-black">{order.table_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Pelanggan:</span>
              <span className="font-semibold text-zinc-200 print:text-black">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Waktu:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Metode Bayar:</span>
              <span className="font-semibold text-white print:text-black">
                {order.payment_method === 'QRIS' ? 'QRIS Instant' : 'Kasir (Cash/Debit)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Status Pembayaran:</span>
              <span className={`font-semibold ${order.payment_status === 'PAID' ? 'text-zinc-200 print:text-black' : 'text-zinc-400'}`}>
                {order.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'BELUM DIBAYAR'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-zinc-700 space-y-2">
            <div className="flex justify-between text-zinc-500 print:text-zinc-700 text-[10px] uppercase font-bold">
              <span>Item Menu</span>
              <span>Subtotal</span>
            </div>
            {order.items &&
              order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-zinc-200 print:text-black">
                    <span className="font-medium">
                      {item.item_name || item.name} <span className="text-zinc-500 font-normal">x{item.quantity}</span>
                    </span>
                    <span>{formatRupiah((item.item_price || item.price) * item.quantity)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-zinc-500 italic pl-2">
                      * {item.notes}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Pricing Totals */}
          <div className="py-3 border-b border-dashed border-zinc-700 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Subtotal:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-zinc-700">Pajak Resto (PB1 10%):</span>
              <span>{formatRupiah(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white print:text-black pt-1">
              <span>TOTAL BAYAR:</span>
              <span>{formatRupiah(order.total_amount)}</span>
            </div>
          </div>

          {/* Barcode Mock */}
          <div className="pt-4 text-center space-y-2">
            <div className="inline-block py-1 tracking-widest text-zinc-600 font-mono text-[9px] select-none">
              ||| | ||||| || |||| ||| ||||| || ||| |||||
            </div>
            <p className="text-[10px] text-zinc-500 print:text-zinc-700">
              Terima kasih atas pesanan Anda!
            </p>
            <p className="text-[9px] text-zinc-600 print:text-zinc-700">
              Simpan struk ini sebagai bukti pemesanan yang sah.
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
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
}
