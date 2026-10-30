import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
    success: 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30',
    warning: 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
    danger: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30',
    purple: 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30',
    cyan: 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg tracking-wide ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
