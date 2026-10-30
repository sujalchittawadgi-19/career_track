import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      className = '',
      id,
      required,
      placeholder,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            {label}
            {required && <span className="text-accent-rose">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={`w-full rounded-xl glass-input px-3.5 py-2.5 text-sm appearance-none bg-dark-800 text-slate-200 cursor-pointer pr-10 transition duration-150 ${
              error ? '!border-accent-rose !ring-accent-rose/20' : ''
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-dark-800 text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const label = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={value} value={value} className="bg-dark-800 text-slate-200">
                  {label}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-accent-rose font-medium mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
