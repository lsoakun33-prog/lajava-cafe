import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, TrendingUp, Trophy, Download, Printer, Calendar, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import { api } from '../../api';
import ZReportModal from './ZReportModal';

export default function AnalyticsTab({ stats: initialStats = null, orders = [], onRefresh }) {
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [period, setPeriod] = useState('today'); // 'today' (default, reset 24:00) | 'all'
  const [currentStats, setCurrentStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialStats) {
      setCurrentStats(initialStats);
    }
  }, [initialStats]);

  const loadStats = async (selectedPeriod = period) => {
    setIsLoading(true);
    try {
      const res = await api.getStats(selectedPeriod);
      if (res.data) {
        setCurrentStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats for period:', selectedPeriod, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    loadStats(newPeriod);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await api.downloadOrdersCsv();
    } catch (err) {
      alert(err.message || 'Gagal mengekspor data.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentStats && !initialStats) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs">
        Memuat data analitik restoran...
      </div>
    );
  }

  const activeData = currentStats || initialStats || {};
  const {
    totalRevenue = 0,
    todayOrdersCount = 0,
    displayedOrdersCount = todayOrdersCount,
    activeOrdersCount = 0,
    completedOrdersCount = 0,
    topItems = [],
    timezone = 'WIB (UTC+7)',
    currentDateWib = '',
  } = activeData;

  const isToday = period === 'today';

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Buttons & Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950 border border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-wide">
              Ringkasan & Analitik Restoran
            </h2>
            {isToday && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Reset 24:00 WIB
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {isToday
              ? `Statistik penjualan harian (00:00 - 23:59 WIB) • Otomatis reset setiap tengah malam`
              : `Statistik akumulasi seluruh transaksi valid sepanjang masa`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => handlePeriodChange('today')}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isToday
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hari Ini (Harian)
            </button>
            <button
              onClick={() => handlePeriodChange('all')}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !isToday
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Semua Waktu
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Mengekspor...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsZReportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-lg"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Laporan Kasir (Z-Report)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total / Daily Revenue */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isToday ? 'Pendapatan Hari Ini' : 'Total Pendapatan'}
            </span>
            <div className="p-2 rounded-xl bg-white text-black">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {formatRupiah(totalRevenue)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {isToday ? 'Reset otomatis setiap pukul 24.00 WIB' : 'Akumulasi seluruh pesanan valid'}
            </p>
          </div>
        </div>

        {/* Orders Count */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isToday ? 'Pesanan Hari Ini' : 'Total Pesanan'}
            </span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {isToday ? todayOrdersCount : displayedOrdersCount}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {isToday ? 'Transaksi masuk hari ini' : 'Seluruh transaksi tercatat'}
            </p>
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
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isToday ? 'Pesanan Selesai Hari Ini' : 'Pesanan Selesai'}
            </span>
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {completedOrdersCount}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {isToday ? 'Berhasil disajikan & dibayar hari ini' : 'Seluruh pesanan berhasil disajikan'}
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Items Leaderboard */}
      <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Top 5 Menu Paling Laris {isToday ? '(Hari Ini)' : '(Semua Waktu)'}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">
            {isToday ? 'Peringkat porsi terjual hari ini' : 'Peringkat porsi terjual sepanjang masa'}
          </span>
        </div>

        {topItems.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            {isToday
              ? 'Belum ada data penjualan tercatat hari ini. Pesanan baru hari ini akan otomatis muncul di sini!'
              : 'Belum ada data penjualan tercatat.'}
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

      {/* Z-Report Printable Modal */}
      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
        stats={activeData}
        orders={orders}
      />
    </div>
  );
}
