'use client';

/**
 * Lightweight toast system — no dependencies.
 * Usage: const { toast } = useToast(); toast('Saved!', 'success');
 */

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const TYPE_STYLES: Record<ToastType, { border: string; text: string; Icon: typeof Info }> = {
  success: { border: 'border-secondary/50', text: 'text-secondary', Icon: CheckCircle2 },
  error: { border: 'border-destructive/50', text: 'text-destructive', Icon: AlertCircle },
  info: { border: 'border-accent/50', text: 'text-accent', Icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]); // max 4 visible
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* aria-live region so screen readers announce toasts */}
      <div
        aria-live="polite"
        role="status"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm"
      >
        {toasts.map(({ id, message, type }) => {
          const { border, text, Icon } = TYPE_STYLES[type];
          return (
            <div
              key={id}
              className={`glass-effect ${border} border rounded-xl px-4 py-3 flex items-start gap-3 shadow-lg animate-slide-in-from-top`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${text}`} aria-hidden />
              <p className="text-sm flex-1 leading-snug">{message}</p>
              <button
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="p-0.5 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
