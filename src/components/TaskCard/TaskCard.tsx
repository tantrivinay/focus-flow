import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Clock, Zap, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import type { Task } from '../../types';
import { priorityColor, priorityBg, formatDuration } from '../../utils';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onDelete, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`border rounded-xl overflow-hidden transition-all ${
        task.completed
          ? 'border-border-subtle bg-bg-elevated/50 opacity-60'
          : 'border-border-subtle bg-bg-elevated hover:border-border-bright'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox */}
        <motion.button
          onClick={() => onToggle(task.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-accent-lime border-accent-lime'
              : 'border-border-bright hover:border-accent-lime/50'
          }`}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3 h-3 text-bg-primary" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium truncate block ${
            task.completed ? 'line-through text-text-muted' : 'text-text-primary'
          }`}>
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${priorityBg(task.priority)} ${priorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-text-muted">
              <Clock className="w-3 h-3" />{formatDuration(task.estimatedMinutes)}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-accent-lime">
              <Zap className="w-3 h-3" />{task.xpReward} XP
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-text-dim hover:text-text-muted hover:bg-bg-primary/50 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 px-3 pb-3 border-t border-border-subtle pt-2">
              <button
                onClick={() => { onEdit(task); setExpanded(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-bg-primary/50 border border-border-subtle transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
