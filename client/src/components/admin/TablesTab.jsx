import React, { useState } from 'react';
import { Plus, Printer, Download, ExternalLink, Trash2, QrCode } from 'lucide-react';

export default function TablesTab({
  tables = [],
  onOpenAddTable,
  onDeleteTable,
}) {
  const handlePrintAll = () => {
    window.print();
  };

  const downloadQR = (table) => {
    const link = document.createElement('a');
    link.download = `QR-${table.table_number.replace(/\s+/g, '_')}.png`;
    link.href = table.qrCodeImage;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            QR Code Meja Restoran
          </h2>
          <p className="text-xs text-zinc-400">
            Cetak atau download kode QR untuk ditempel di meja pelanggan. Scan otomatis membuka menu meja tersebut.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs font-semibold hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Semua QR Meja</span>
          </button>

          <button
            onClick={onOpenAddTable}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Meja</span>
          </button>
        </div>
      </div>

      {/* Grid of Tables & QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/70 flex flex-col items-center text-center justify-between gap-5 transition-all hover:border-zinc-700 print:border-black print:bg-white print:p-4 print:mb-4"
          >
            {/* Card Content Top */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 print:text-zinc-700">
                NOIR F&B • SELF ORDER
              </span>
              <h3 className="text-xl font-black tracking-wider text-white print:text-black">
                {table.table_number}
              </h3>
              <p className="text-[11px] text-zinc-400 print:text-zinc-600">
                Kapasitas {table.capacity} Orang
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              {table.qrCodeImage ? (
                <img
                  src={table.qrCodeImage}
                  alt={`QR ${table.table_number}`}
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-zinc-100">
                  <QrCode className="w-12 h-12 text-zinc-400" />
                </div>
              )}
            </div>

            {/* Scan Prompt Instruction */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-300 print:text-black">
                Pindai untuk Mulai Memesan
              </p>
              <p className="text-[10px] text-zinc-400 print:text-zinc-700">
                Buka kamera HP Anda dan arahkan ke kode QR ini
              </p>
            </div>

            {/* Actions (Hidden on Print) */}
            <div className="w-full pt-4 border-t border-zinc-900 flex items-center justify-between gap-2 no-print">
              <a
                href={table.orderUrl}
                target="_blank"
                rel="noreferrer"
                title="Buka Halaman Pemesanan Meja Ini"
                className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => downloadQR(table)}
                title="Download QR PNG"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold hover:border-zinc-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PNG</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus ${table.table_number}?`)) {
                    onDeleteTable(table.id);
                  }
                }}
                title="Hapus Meja"
                className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
