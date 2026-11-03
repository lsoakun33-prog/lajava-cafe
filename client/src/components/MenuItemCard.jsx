import React from 'react';
import { Plus, Clock, Ban } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import MenuInitialVisual from './MenuInitialVisual';

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
      {/* Top Visual Section with Monogram / Initials */}
      <div className="relative w-full aspect-[4/3] bg-zinc-900 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out ${
              isAvailable ? 'group-hover:scale-105 filter contrast-[1.03]' : 'grayscale opacity-60'
            }`}
          />
        ) : (
          <MenuInitialVisual
            item={item}
            className={`w-full h-full ${!isAvailable ? 'grayscale opacity-60' : ''}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/80 text-zinc-200 border border-zinc-800/90 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Clock className="w-2.5 h-2.5 text-zinc-400" />
            {item.prep_time || 15}m
          </span>

          {!isAvailable ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-zinc-900/90 text-zinc-400 border border-zinc-700/80 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Ban className="w-2.5 h-2.5 text-zinc-500" />
              Habis
            </span>
          ) : item.stock !== null && item.stock !== undefined && item.stock <= 5 && item.stock > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-white text-black border border-white shadow-sm">
              Sisa {item.stock}
            </span>
          ) : null}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
            {item.category_name}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight sm:tracking-wide mt-0.5 line-clamp-2 h-8 sm:h-10 leading-snug group-hover:text-zinc-200 transition-colors">
            {item.name}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed h-8 sm:h-9 overflow-hidden">
            {item.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-zinc-900/90">
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
              className="p-1.5 sm:p-2 rounded-xl bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all shadow-md flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Habis</span>
          )}
        </div>
      </div>
    </div>
  );
}
