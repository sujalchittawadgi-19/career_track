import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bg = 'bg-dark-800 border-dark-600 text-slate-100';
          let icon = <Info className="w-5 h-5 text-accent-cyan flex-shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-dark-800 border-accent-emerald/40 text-slate-100';
            icon = <CheckCircle2 className="w-5 h-5 text-accent-emerald flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-dark-800 border-accent-rose/40 text-slate-100';
            icon = <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-dark-800 border-accent-amber/40 text-slate-100';
            icon = <AlertTriangle className="w-5 h-5 text-accent-amber flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${bg} animate-slide-up transition-all`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-dark-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
