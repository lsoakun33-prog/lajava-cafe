import React from 'react';
import { Plus, Clock, Ban } from 'lucide-react';
import { formatRupiah } from '../utils/format';

export default function MenuItemCard({ item, onSelect, onQuickAdd }) {
  const isAvailable = item.is_available === 1;

  return (
    <div
      onClick={() => isAvailable && onSelect(item)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${
        isAvailable
          ? 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-500 hover:shadow-xl hover:shadow-black/60 cursor-pointer active:scale-[0.99]'
          : 'bg-zinc-950/40 border-zinc-900 opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[4/3] bg-zinc-900 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isAvailable ? 'group-hover:scale-105 filter contrast-105' : 'grayscale'
          }`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/75 text-zinc-300 border border-zinc-800 backdrop-blur-md flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {item.prep_time || 15} m
          </span>

          {!isAvailable ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <Ban className="w-2.5 h-2.5 text-zinc-400" />
              Habis
            </span>
          ) : item.stock !== null && item.stock !== undefined && item.stock <= 5 && item.stock > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white text-black border border-white">
              Sisa {item.stock}
            </span>
          ) : null}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {item.category_name}
          </span>
          <h3 className="text-sm font-bold text-white tracking-wide mt-0.5 line-clamp-1 group-hover:text-zinc-200 transition-colors">
            {item.name}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-900">
          <span className="font-mono text-xs sm:text-sm font-bold text-white">
            {formatRupiah(item.price)}
          </span>

          {isAvailable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(item);
              }}
              title="Tambah langsung 1"
              className="p-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all shadow"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-zinc-600 uppercase">Stok Habis</span>
          )}
        </div>
      </div>
    </div>
  );
}
