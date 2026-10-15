import React, { useState } from 'react';
import { X, Plus, Minus, Clock, Utensils } from 'lucide-react';
import { formatRupiah } from '../utils/format';

export default function ItemModal({ item, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAdd = () => {
    onAddToCart({
      ...item,
      quantity,
      notes: notes.trim(),
    });
    setQuantity(1);
    setNotes('');
    onClose();
  };

  const totalPrice = item.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-56 bg-zinc-900 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover filter contrast-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />
          
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/80 text-white border border-zinc-700 backdrop-blur-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{item.prep_time || 15} Menit
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white text-black">
              {item.category_name || 'Artisan F&B'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-bold text-white tracking-wide">{item.name}</h2>
              <span className="text-lg font-mono font-bold text-white">{formatRupiah(item.price)}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.description}</p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Catatan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Less sugar, es terpisah, jangan terlalu manis..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Jumlah Pesanan</span>
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-sm text-white w-6 text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-900/60">
          <button
            onClick={handleAdd}
            className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold text-xs tracking-wider uppercase flex items-center justify-between hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.99]"
          >
            <span>Tambahkan ke Pesanan</span>
            <span className="font-mono text-sm">{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
