import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatRupiah } from '../utils/format';

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  tableNumber,
  customerName,
  setCustomerName,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onClearCart,
  onSubmitOrder,
  isSubmitting,
}) {
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASHIER'); // 'CASHIER' | 'QRIS'
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [nameError, setNameError] = useState('');

  // Inline Note Editing State
  const [editingKey, setEditingKey] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const startEditingNote = (item) => {
    const key = `${item.id}_${item.notes || ''}`;
    setEditingKey(key);
    setEditingNoteValue(item.notes || '');
  };

  const handleSaveNote = (item) => {
    if (onUpdateNotes) {
      onUpdateNotes(item.id, item.notes, editingNoteValue);
    }
    setEditingKey(null);
    setEditingNoteValue('');
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingNoteValue('');
  };

  const handleProceed = () => {
    if (!customerName || customerName.trim() === '') {
      setNameError('Nama pemesan wajib diisi agar pesanan tidak tertukar.');
      return;
    }
    setNameError('');

    if (paymentMethod === 'QRIS') {
      setShowQRISModal(true);
    } else {
      executeOrderSubmission('UNPAID');
    }
  };

  const executeOrderSubmission = async (paymentStatus = 'UNPAID') => {
    const payload = {
      tableNumber,
      customerName: customerName.trim(),
      customerNotes: customerNotes.trim(),
      paymentMethod,
      items: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        notes: item.notes || '',
      })),
    };

    setShowQRISModal(false);
    await onSubmitOrder(payload, paymentStatus);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white text-black rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Pesanan Anda</h2>
                <p className="text-xs text-zinc-400">
                  {tableNumber} • {totalItems} item
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {cart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
                <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                <p className="text-xs">Keranjang Anda masih kosong.<br />Silakan pilih menu favorit Anda.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => {
                    const itemKey = `${item.id}_${item.notes || ''}`;
                    const isEditing = editingKey === itemKey;

                    return (
                      <div
                        key={itemKey}
                        className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5 transition-all"
                      >
                        {/* Main Item Row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            <p className="font-mono text-xs text-zinc-300 mt-0.5">
                              {formatRupiah(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Qty changer */}
                          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shrink-0">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.notes, item.quantity - 1)}
                              className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs font-bold text-white w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.notes, item.quantity + 1)}
                              className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id, item.notes)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Hapus menu dari keranjang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Note Section: Display or Inline Edit Form */}
                        {isEditing ? (
                          <div className="pt-2 border-t border-zinc-800/80 space-y-2 animate-fade-in">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingNoteValue}
                                onChange={(e) => setEditingNoteValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveNote(item);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                                placeholder="Tulis catatan (e.g. less ice, gula pisah)..."
                                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveNote(item)}
                                className="px-2.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1 shrink-0 shadow"
                                title="Simpan Catatan"
                              >
                                <Check className="w-3 h-3" />
                                <span>Simpan</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
                                title="Batal"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Quick Preset Chips */}
                            <div className="flex flex-wrap gap-1">
                              {['Less ice', 'No sugar', 'Less sugar', 'Gula pisah', 'Hangat / Panas', 'Pedas'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteValue((prev) => {
                                      const trimmed = prev.trim();
                                      if (!trimmed) return preset;
                                      if (trimmed.includes(preset)) return trimmed;
                                      return `${trimmed}, ${preset}`;
                                    });
                                  }}
                                  className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                                >
                                  +{preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs pt-0.5">
                            {item.notes ? (
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="text-[11px] text-zinc-300 italic bg-zinc-950/80 px-2 py-0.5 rounded-md border border-zinc-800/80 truncate max-w-[210px]">
                                  * {item.notes}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditingNote(item)}
                                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800 shrink-0"
                                  title="Ubah Catatan"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                  <span>Ubah</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditingNote(item)}
                                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors py-0.5 rounded hover:bg-zinc-900/80 px-1"
                                title="Tambahkan catatan khusus untuk menu ini"
                              >
                                <Pencil className="w-2.5 h-2.5 text-zinc-400" />
                                <span>+ Tambah Catatan</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Customer Details Form */}
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Nama Pemesan <span className="text-white">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      placeholder="Masukkan nama Anda (e.g. Budi / Sarah)"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                        nameError ? 'border-red-500' : 'border-zinc-800 focus:border-white'
                      }`}
                    />
                    {nameError && (
                      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Catatan Tambahan untuk Kasir / Dapur (Opsional)
                    </label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Contoh: Tolong tisu & sendok ekstra..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-zinc-300 block mb-2">
                      Pilihan Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASHIER')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          paymentMethod === 'CASHIER'
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <Banknote className="w-4 h-4 mb-2" />
                        <div>
                          <div className="text-xs font-bold">Bayar di Kasir</div>
                          <div className={`text-[10px] ${paymentMethod === 'CASHIER' ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            Cash / Kartu Debit
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          paymentMethod === 'QRIS'
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <QrCode className="w-4 h-4 mb-2" />
                        <div>
                          <div className="text-xs font-bold">QRIS Instant</div>
                          <div className={`text-[10px] ${paymentMethod === 'QRIS' ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            Scan e-Wallet / BCA
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pricing & Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/60 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Pajak Resto (PB1 10%)</span>
                  <span className="font-mono">{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-zinc-800">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-base">{formatRupiah(total)}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Mengirim Pesanan...</span>
                ) : (
                  <>
                    <span>Kirim Pesanan Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QRIS Instant Modal Preview */}
      {showQRISModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Pembayaran Real-Time
              </span>
              <button
                onClick={() => setShowQRISModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">QRIS Standar Nasional</h3>
              <p className="text-xs text-zinc-400">Scan via BCA, Mandiri, GoPay, OVO, Dana, ShopeePay</p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
              <QRCodeSVG
                value={`https://qris.noir-cafe.test/pay?amount=${total}&ref=ORD-${Date.now()}`}
                size={200}
                level="M"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Total Tagihan:</p>
              <p className="text-xl font-bold font-mono text-white">{formatRupiah(total)}</p>
            </div>

            {/* Simulated instant confirmation buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => executeOrderSubmission('PAID')}
                className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                Simulasikan Pembayaran Sukses
              </button>
              <button
                onClick={() => executeOrderSubmission('UNPAID')}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium"
              >
                Bayar Nanti di Kasir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
