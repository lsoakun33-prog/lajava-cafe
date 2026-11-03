import React from 'react';
import { Coffee, Flame, Utensils, Sparkles, CupSoda, Beer, Salad, Soup } from 'lucide-react';

export function getMenuInitials(name) {
  if (!name) return 'LJ';
  // Strip content in parentheses
  const clean = name.replace(/\([^)]*\)/g, '').trim();
  const words = clean.split(/[\s\/-]+/).filter((w) => w.length > 0);

  if (words.length === 0) return 'LJ';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0][0] + words[1][0] + (words[2] ? words[2][0] : '')).slice(0, 3).toUpperCase();
}

const CATEGORY_THEMES = {
  cat_signature_coffee: {
    bg: 'from-amber-950/70 via-stone-900 to-zinc-950',
    border: 'border-amber-500/20 group-hover:border-amber-400/40',
    accent: 'text-amber-200',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.12)',
    icon: Sparkles,
    label: 'Signature',
  },
  cat_classic_coffee: {
    bg: 'from-orange-950/60 via-stone-900 to-zinc-950',
    border: 'border-orange-500/20 group-hover:border-orange-400/40',
    accent: 'text-orange-200',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    glow: 'rgba(249, 115, 22, 0.12)',
    icon: Coffee,
    label: 'Espresso & Brew',
  },
  cat_milk_blended: {
    bg: 'from-purple-950/60 via-zinc-900 to-zinc-950',
    border: 'border-purple-500/20 group-hover:border-purple-400/40',
    accent: 'text-purple-200',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.12)',
    icon: CupSoda,
    label: 'Milk & Blend',
  },
  cat_tea_refresher: {
    bg: 'from-emerald-950/60 via-zinc-900 to-zinc-950',
    border: 'border-emerald-500/20 group-hover:border-emerald-400/40',
    accent: 'text-emerald-200',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.12)',
    icon: Sparkles,
    label: 'Tea & Refresher',
  },
  cat_rice_main: {
    bg: 'from-red-950/60 via-zinc-900 to-zinc-950',
    border: 'border-rose-500/20 group-hover:border-rose-400/40',
    accent: 'text-rose-200',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.12)',
    icon: Flame,
    label: 'Rice & Main',
  },
  cat_chinese_noodle: {
    bg: 'from-yellow-950/60 via-zinc-900 to-zinc-950',
    border: 'border-yellow-500/20 group-hover:border-yellow-400/40',
    accent: 'text-yellow-200',
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    glow: 'rgba(234, 179, 8, 0.12)',
    icon: Utensils,
    label: 'Noodles & Wok',
  },
  cat_family_style: {
    bg: 'from-pink-950/60 via-zinc-900 to-zinc-950',
    border: 'border-pink-500/20 group-hover:border-pink-400/40',
    accent: 'text-pink-200',
    badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    glow: 'rgba(236, 72, 153, 0.12)',
    icon: Soup,
    label: 'Family Sharing',
  },
  cat_snack_salad: {
    bg: 'from-teal-950/60 via-zinc-900 to-zinc-950',
    border: 'border-teal-500/20 group-hover:border-teal-400/40',
    accent: 'text-teal-200',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    glow: 'rgba(20, 184, 166, 0.12)',
    icon: Salad,
    label: 'Snacks & Salad',
  },
  cat_dessert_beer: {
    bg: 'from-blue-950/60 via-zinc-900 to-zinc-950',
    border: 'border-blue-500/20 group-hover:border-blue-400/40',
    accent: 'text-blue-200',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    glow: 'rgba(59, 130, 246, 0.12)',
    icon: Beer,
    label: 'Dessert & Beer',
  },
};

const DEFAULT_THEME = {
  bg: 'from-zinc-900 via-stone-900 to-zinc-950',
  border: 'border-zinc-700/30 group-hover:border-zinc-500/40',
  accent: 'text-zinc-200',
  badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  glow: 'rgba(255, 255, 255, 0.05)',
  icon: Utensils,
  label: 'Artisan Menu',
};

export default function MenuInitialVisual({ item, size = 'md', className = '' }) {
  const name = item?.name || '';
  const initials = getMenuInitials(name);
  const theme = CATEGORY_THEMES[item?.category_id] || DEFAULT_THEME;
  const CategoryIcon = theme.icon;

  if (size === 'sm') {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br ${theme.bg} border ${theme.border} select-none transition-transform duration-300 ${className}`}
      >
        <span className="font-mono text-sm font-black tracking-widest text-white drop-shadow-sm">
          {initials}
        </span>
      </div>
    );
  }

  const isLg = size === 'lg';

  return (
    <div
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br ${theme.bg} select-none border-b border-zinc-800/80 transition-all duration-500 ${className}`}
      style={{
        boxShadow: `inset 0 0 50px -10px ${theme.glow}`,
      }}
    >
      {/* Background Watermark Initials */}
      <span className="absolute -bottom-4 -right-2 text-7xl sm:text-9xl font-black font-mono text-white/[0.03] select-none pointer-events-none transform -rotate-6">
        {initials}
      </span>

      {/* Subtle Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Noir Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20 pointer-events-none" />

      {/* Architectural Corner Crosshairs */}
      <div className="absolute top-2.5 left-2.5 text-white/10 text-[10px] font-mono pointer-events-none">⌜</div>
      <div className="absolute top-2.5 right-2.5 text-white/10 text-[10px] font-mono pointer-events-none">⌝</div>
      <div className="absolute bottom-2.5 left-2.5 text-white/10 text-[10px] font-mono pointer-events-none">⌞</div>
      <div className="absolute bottom-2.5 right-2.5 text-white/10 text-[10px] font-mono pointer-events-none">⌟</div>

      {/* Centerpiece Emblem Badge */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-950/70 border ${theme.border} backdrop-blur-md shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
          isLg ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-16 h-16 sm:w-20 sm:h-20'
        }`}
        style={{
          boxShadow: `0 8px 30px -4px ${theme.glow}, inset 0 1px 0 0 rgba(255,255,255,0.1)`,
        }}
      >
        <span
          className={`font-mono font-black tracking-widest text-white leading-none ${
            isLg ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {initials}
        </span>

        {/* Micro Subtitle */}
        <span className="text-[7px] sm:text-[8px] font-mono tracking-[0.2em] uppercase text-zinc-400 mt-1 font-semibold">
          LA JAVA
        </span>
      </div>

      {/* Bottom Category Pill Indicator */}
      <div className="absolute bottom-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/5 backdrop-blur-sm pointer-events-none">
        <CategoryIcon className="w-2.5 h-2.5 text-zinc-400" />
        <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-medium">
          {theme.label}
        </span>
      </div>
    </div>
  );
}
