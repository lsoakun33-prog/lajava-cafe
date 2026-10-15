import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Espresso', url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Latte / Cappuccino', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80' },
  { label: 'Cold Brew', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80' },
  { label: 'Matcha', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Cheesecake', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80' },
  { label: 'Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80' },
  { label: 'French Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80' },
];

export default function MenuItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  editingItem = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    category_id: categories[0]?.id || '',
    price: '',
    prep_time: 15,
    description: '',
    image: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category_id: editingItem.category_id,
        price: editingItem.price,
        prep_time: editingItem.prep_time || 15,
        description: editingItem.description || '',
        image: editingItem.image || '',
      });
    } else {
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        price: '',
        prep_time: 15,
        description: '',
        image: PRESET_IMAGES[0].url,
      });
    }
    setError('');
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.price) {
      setError('Nama, kategori, dan harga menu wajib diisi.');
      return;
    }

    onSubmit({
      ...formData,
      price: Number(formData.price),
      prep_time: Number(formData.prep_time) || 15,
      image: formData.image || PRESET_IMAGES[0].url,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/60">
          <h2 className="text-base font-bold text-white tracking-wide">
            {editingItem ? 'Edit Data Menu' : 'Tambah Menu Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Nama Menu <span className="text-white">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Charcoal Latte"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Kategori <span className="text-white">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Harga (Rp) <span className="text-white">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="35000"
                min="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Estimasi Masak (Menit)
              </label>
              <input
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                placeholder="15"
                min="1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Deskripsi Menu
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan cita rasa, komposisi, atau keunggulan menu ini..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>

          {/* Image URL & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              URL Foto Menu
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-zinc-400" />
                Pilih Foto Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      formData.image === preset.url
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {formData.image && (
              <div className="mt-2 w-full h-24 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover filter contrast-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-zinc-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
