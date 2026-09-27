'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md w-11/12">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all text-xs sm:text-sm font-bold dir-rtl",
          isSuccess && "bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/30",
          isError && "bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/30",
          !isSuccess && !isError && "bg-slate-900/90 text-slate-100 border-slate-700 shadow-slate-950/30"
        )}
      >
        <div className="shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
        </div>

        <div className="flex-1 space-y-0.5 text-right">
          {toast.title && <div className="font-extrabold text-xs opacity-90">{toast.title}</div>}
          <div className="leading-relaxed whitespace-pre-line">{toast.message}</div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-opacity shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
