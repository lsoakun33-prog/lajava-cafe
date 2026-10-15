import React from 'react';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, TrendingUp, Trophy } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

export default function AnalyticsTab({ stats = null, onRefresh }) {
  if (!stats) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs">
        Memuat data analitik restoran...
      </div>
    );
  }

  const {
    totalRevenue = 0,
    todayOrdersCount = 0,
    activeOrdersCount = 0,
    completedOrdersCount = 0,
    topItems = [],
  } = stats;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-base font-bold text-white tracking-wide">
          Ringkasan & Analitik Restoran
        </h2>
        <p className="text-xs text-zinc-400">
          Statistik performa penjualan dan pesanan real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pendapatan</span>
            <div className="p-2 rounded-xl bg-white text-black">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {formatRupiah(totalRevenue)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Akumulasi seluruh pesanan valid</p>
          </div>
        </div>

        {/* Today Orders */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pesanan Hari Ini</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {todayOrdersCount}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Transaksi masuk hari ini</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pesanan Aktif</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {activeOrdersCount}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Sedang menunggu atau dimasak</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pesanan Selesai</span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {completedOrdersCount}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Berhasil disajikan & dibayar</p>
          </div>
        </div>
      </div>

      {/* Top 5 Items Leaderboard */}
      <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Top 5 Menu Paling Laris
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Peringkat berdasarkan porsi terjual</span>
        </div>

        {topItems.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            Belum ada data penjualan tercatat. Buat pesanan pertama untuk melihat leaderboard!
          </p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, idx) => {
              const maxSold = topItems[0]?.total_sold || 1;
              const percentage = Math.round((item.total_sold / maxSold) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-center leading-5 text-zinc-300">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white">{item.item_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {item.total_sold} porsi
                      </span>
                      <span className="font-mono font-bold text-white text-[11px]">
                        {formatRupiah(item.total_revenue)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
