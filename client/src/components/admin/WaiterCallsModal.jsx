import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Utensils,
  Receipt,
  Droplet,
  HelpCircle,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/format';

const CALL_TYPE_CONFIG = {
  BANTUAN: {
    label: 'Bantuan Kasir / Pelayan',
    icon: HelpCircle,
    badgeBg: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  },
  BILL: {
    label: 'Minta Bill / Bayar Tunai',
    icon: Receipt,
    badgeBg: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  },
  ALAT_MAKAN: {
    label: 'Alat Makan & Tisu',
    icon: Utensils,
    badgeBg: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
  },
  AIR_MINUM: {
    label: 'Tambah Air Minum / Es',
    icon: Droplet,
    badgeBg: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  },
};

export default function WaiterCallsModal({
  isOpen,
  onClose,
  calls = [],
  onResolveCall,
  onResolveAll,
}) {
  const [resolvingId, setResolvingId] = useState(null);
  const [isResolvingAll, setIsResolvingAll] = useState(false);

  if (!isOpen) return null;

  const handleResolveSingle = async (callId) => {
    try {
      setResolvingId(callId);
      await onResolveCall(callId);
    } finally {
      setResolvingId(null);
    }
  };

  const handleResolveAllCalls = async () => {
    if (!window.confirm('Tandai semua panggilan pelayan sebagai sudah ditangani?')) return;
    try {
      setIsResolvingAll(true);
      await onResolveAll();
      onClose();
    } finally {
      setIsResolvingAll(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-black rounded-2xl shadow-md">
              <Bell className="w-5 h-5 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Antrean Panggilan Pelayan
                </h3>
                {calls.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-white text-black">
                    {calls.length} Meja
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Diurutkan berdasarkan antrean pertama masuk (First-In, First-Out)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {calls.length > 1 && (
              <button
                onClick={handleResolveAllCalls}
                disabled={isResolvingAll}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5 text-white" />
                <span>Selesaikan Semua</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {calls.length === 0 ? (
            <div className="py-14 text-center space-y-3 text-zinc-500">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Semua Meja Telah Terlayani</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Tidak ada meja yang sedang memanggil pelayan saat ini. Panggilan baru akan muncul otomatis secara real-time.
                </p>
              </div>
            </div>
          ) : (
            calls.map((call, idx) => {
              const typeCfg = CALL_TYPE_CONFIG[call.call_type] || {
                label: call.call_type ? call.call_type.replace(/_/g, ' ') : 'Panggilan',
                icon: HelpCircle,
                badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
              };
              const TypeIcon = typeCfg.icon;
              const isFirstPriority = idx === 0;

              return (
                <div
                  key={call.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isFirstPriority
                      ? 'bg-zinc-900/90 border-white/40 ring-1 ring-white/10 shadow-lg'
                      : 'bg-zinc-900/40 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Tag */}
                      {isFirstPriority ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-black shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                          #1 PRIORITAS UTAMA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Antrean #{idx + 1}
                        </span>
                      )}

                      {/* Table Number */}
                      <span className="text-base font-black text-white tracking-wide">
                        {call.table_number}
                      </span>

                      {/* Call Type Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${typeCfg.badgeBg}`}
                      >
                        <TypeIcon className="w-3.5 h-3.5" />
                        <span>{typeCfg.label}</span>
                      </span>
                    </div>

                    {/* Customer custom note if provided */}
                    {call.note && (
                      <div className="text-xs text-zinc-300 bg-zinc-950/80 border border-zinc-800/80 px-3 py-1.5 rounded-xl font-mono">
                        <span className="text-zinc-500 font-sans text-[11px] mr-1.5">Catatan:</span>
                        "{call.note}"
                      </div>
                    )}

                    {/* Time waiting */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>
                        Menunggu sejak {formatTimeAgo(call.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleResolveSingle(call.id)}
                      disabled={resolvingId === call.id}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isFirstPriority
                          ? 'bg-white text-black hover:bg-zinc-200 shadow-md active:scale-95'
                          : 'bg-zinc-800 text-white hover:bg-white hover:text-black border border-zinc-700'
                      } disabled:opacity-50`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{resolvingId === call.id ? 'Memproses...' : 'Tandai Selesai'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {calls.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <span>
              💡 Layani meja dengan status <strong>#1 Prioritas Utama</strong> terlebih dahulu untuk menjaga kepuasan pelanggan.
            </span>
            {calls.length > 1 && (
              <button
                onClick={handleResolveAllCalls}
                disabled={isResolvingAll}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                Selesaikan Semua Panggilan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
