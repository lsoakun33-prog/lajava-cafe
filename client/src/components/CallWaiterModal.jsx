import React, { useState } from 'react';
import { X, Bell, CheckCircle2, Utensils, Receipt, Droplet, HelpCircle, Send } from 'lucide-react';
import { api } from '../api';
import { emitCallWaiter } from '../socket';

const CALL_TYPES = [
  { id: 'BANTUAN', label: 'Panggil Kasir / Bantuan', icon: HelpCircle, desc: 'Perlu bantuan pelayan ke meja' },
  { id: 'BILL', label: 'Minta Bill / Bayar Tunai', icon: Receipt, desc: 'Pelayan membawa bill ke meja' },
  { id: 'ALAT_MAKAN', label: 'Alat Makan & Tisu', icon: Utensils, desc: 'Minta sendok, garpu, atau tisu tambahan' },
  { id: 'AIR_MINUM', label: 'Tambah Air Minum', icon: Droplet, desc: 'Refill air putih / es batu' },
];

export default function CallWaiterModal({ isOpen, onClose, tableNumber }) {
  const [selectedType, setSelectedType] = useState('BANTUAN');
  const [customNote, setCustomNote] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendCall = async () => {
    setIsLoading(true);
    try {
      // 1. Emit via websocket for instant response
      emitCallWaiter(tableNumber, selectedType, customNote);
      // 2. Persist to API
      await api.callWaiter(tableNumber, selectedType, customNote).catch(() => {});

      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setCustomNote('');
        onClose();
      }, 2500);
    } catch (err) {
      alert('Gagal mengirim panggilan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white text-black rounded-xl">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Panggil Pelayan</h3>
              <p className="text-[11px] text-zinc-400">Untuk {tableNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {isSent ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Pelayan Sudah Diberitahu!</h4>
              <p className="text-xs text-zinc-400">
                Staff La Java Cafe & Resto segera menghampiri {tableNumber}.
              </p>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Pilih Kebutuhan Anda:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CALL_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{type.label}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400">Catatan Tambahan (Opsional):</label>
              <input
                type="text"
                placeholder="Contoh: Tolong tisu 3 lembar..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                maxLength={80}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSendCall}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Mengirim...' : 'Kirim Panggilan Pelayan'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
