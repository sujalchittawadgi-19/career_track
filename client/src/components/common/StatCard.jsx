import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'brand',
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
      iconBg: 'bg-brand-500/20 text-brand-400',
    },
    emerald: {
      bg: 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald',
      iconBg: 'bg-accent-emerald/20 text-accent-emerald',
    },
    amber: {
      bg: 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber',
      iconBg: 'bg-accent-amber/20 text-accent-amber',
    },
    purple: {
      bg: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
      iconBg: 'bg-accent-purple/20 text-accent-purple',
    },
    rose: {
      bg: 'bg-accent-rose/10 border-accent-rose/20 text-accent-rose',
      iconBg: 'bg-accent-rose/20 text-accent-rose',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-500/5 blur-2xl group-hover:bg-brand-500/10 transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border border-white/5 ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trend > 0 ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
          {subtitle && !trend && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
