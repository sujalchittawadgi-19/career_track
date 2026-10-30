import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
    icon: 'p-2.5',
  };

  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 focus:ring-brand-500 border border-brand-500/30',
    secondary:
      'bg-dark-750 hover:bg-dark-700 text-slate-200 border border-slate-700/60 focus:ring-slate-500',
    danger:
      'bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose border border-accent-rose/30 focus:ring-accent-rose',
    success:
      'bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 focus:ring-accent-emerald',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-100 focus:ring-slate-500',
    glass:
      'glass-panel hover:bg-white/10 text-slate-200 border border-white/10 shadow-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
};

export default Button;
