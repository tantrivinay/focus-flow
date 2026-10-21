import { useState, useEffect, useCallback } from 'react';
import type { ToastMessage } from '../types';
import { generateId } from '../utils';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    message: string,
    type: ToastMessage['type'] = 'info',
    duration = 3500
  ) => {
    const id = generateId();
    const toast: ToastMessage = { id, message, type, duration };
    setToasts(prev => [...prev.slice(-4), toast]); // max 5 toasts
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function useAutoRemoveToast(
  toasts: ToastMessage[],
  removeToast: (id: string) => void
) {
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 3500);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);
}
