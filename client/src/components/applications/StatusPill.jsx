import React from 'react';

export const STATUS_CONFIG = {
  Wishlist: {
    label: 'Wishlist',
    bg: 'bg-slate-800/80',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  },
  Applied: {
    label: 'Applied',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  Screening: {
    label: 'Screening',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
  Shortlisted: {
    label: 'Shortlisted',
    bg: 'bg-brand-500/15',
    text: 'text-brand-400',
    border: 'border-brand-500/30',
    dot: 'bg-brand-400',
  },
  Interviewing: {
    label: 'Interviewing',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400 animate-pulse',
  },
  Offer: {
    label: 'Offer',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300 font-bold',
    border: 'border-emerald-500/40 shadow-sm shadow-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  Accepted: {
    label: 'Accepted',
    bg: 'bg-emerald-600/30',
    text: 'text-emerald-200 font-bold',
    border: 'border-emerald-500/50',
    dot: 'bg-emerald-300',
  },
  Rejected: {
    label: 'Rejected',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
  },
  Withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-slate-700/40',
    text: 'text-slate-400',
    border: 'border-slate-700/50',
    dot: 'bg-slate-500',
  },
  Archived: {
    label: 'Archived',
    bg: 'bg-slate-800/40',
    text: 'text-slate-500',
    border: 'border-slate-800',
    dot: 'bg-slate-600',
  },
};

const StatusPill = ({ status = 'Applied', size = 'sm', showDot = true, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${config.bg} ${config.text} ${config.border} ${sizes[size]} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};

export default StatusPill;
