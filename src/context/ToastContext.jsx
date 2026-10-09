import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import ToastHost from '../components/ToastHost';

const ToastContext = createContext(null);

const DEFAULT_SUCCESS_MS = 2500;
const DEFAULT_ERROR_MS = 3000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, variant = 'success', durationMs) => {
      const text = String(message || '').trim();
      if (!text) return;
      const ms =
        durationMs ??
        (variant === 'error' ? DEFAULT_ERROR_MS : DEFAULT_SUCCESS_MS);
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message: text, variant });
      timerRef.current = setTimeout(hide, ms);
    },
    [hide]
  );

  const showSuccess = useCallback(
    (message, durationMs) => showToast(message, 'success', durationMs),
    [showToast]
  );

  const showError = useCallback(
    (message, durationMs) => showToast(message, 'error', durationMs),
    [showToast]
  );

  const value = useMemo(
    () => ({ showToast, showSuccess, showError, hideToast: hide }),
    [showToast, showSuccess, showError, hide]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toast={toast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
