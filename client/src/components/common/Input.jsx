import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            {label}
            {required && <span className="text-accent-rose">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            className={`w-full rounded-xl glass-input px-3.5 py-2.5 text-sm placeholder:text-slate-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              Icon ? 'pl-10' : ''
            } ${error ? '!border-accent-rose !ring-accent-rose/20' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-accent-rose font-medium mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
