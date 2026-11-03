import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle2, Ban, Clock } from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import MenuInitialVisual from '../MenuInitialVisual';

export default function MenuTab({
  menuItems = [],
  categories = [],
  onOpenAddModal,
  onOpenEditModal,
  onToggleStock,
  onDeleteItem,
}) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredItems = menuItems.filter((item) => {
    const matchCat =
      selectedCat === 'all' || item.category_slug === selectedCat || item.category_id === selectedCat;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">Daftar Menu F&B</h2>
          <p className="text-xs text-zinc-400">
            Kelola ketersediaan stok, harga, dan item menu secara real-time
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu makanan atau minuman..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            Semua ({menuItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.slug)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === c.slug
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isAvailable = item.is_available === 1;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 flex flex-col justify-between gap-4 transition-all hover:border-zinc-700"
            >
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover filter contrast-105"
                    />
                  ) : (
                    <MenuInitialVisual item={item} size="sm" className="w-full h-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {item.category_name}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate mt-0.5">{item.name}</h3>
                  <p className="font-mono text-xs font-semibold text-zinc-200 mt-1">
                    {formatRupiah(item.price)}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>~{item.prep_time || 15} m</span>
                    </div>
                    <span>•</span>
                    <span className={item.stock !== null && item.stock <= 5 ? 'text-zinc-300 font-bold' : ''}>
                      Stok: {item.stock !== null && item.stock !== undefined ? `${item.stock} porsi` : 'Tak Terbatas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                {/* Stock Toggle */}
                <button
                  onClick={() => onToggleStock(item.id)}
                  title="Klik untuk ubah stok menu (sinkron instan ke pelanggan)"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isAvailable
                      ? 'bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Tersedia</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Habis</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEditModal(item)}
                    title="Edit Menu"
                    className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus menu "${item.name}"?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    title="Hapus Menu"
                    className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
