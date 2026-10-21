import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, Zap, X } from 'lucide-react';
import type { ToastMessage } from '../../types';

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-accent-lime" />,
  info: <Info className="w-4 h-4 text-accent-violet" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  xp: <Zap className="w-4 h-4 text-accent-lime" />,
};

const borders = {
  success: 'border-accent-lime/30',
  info: 'border-accent-violet/30',
  warning: 'border-amber-400/30',
  xp: 'border-accent-lime/50',
};

export function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border bg-bg-card shadow-card max-w-xs ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="text-sm text-text-primary flex-1">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-text-muted hover:text-text-primary transition-colors ml-1 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
