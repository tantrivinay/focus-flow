import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock, Flag } from 'lucide-react';
import type { Task, Priority } from '../../types';
import { generateId } from '../../utils';

interface Props {
  task?: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes ?? 30);
  const [xpReward, setXpReward] = useState(task?.xpReward ?? 40);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setEstimatedMinutes(task.estimatedMinutes);
      setXpReward(task.xpReward);
    }
  }, [task]);

  // Auto-compute XP based on priority and duration
  useEffect(() => {
    if (!task) { // only auto-compute for new tasks
      const base = priority === 'high' ? 80 : priority === 'medium' ? 50 : 25;
      const timeBonus = Math.floor(estimatedMinutes / 15) * 5;
      setXpReward(base + timeBonus);
    }
  }, [priority, estimatedMinutes, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const saved: Task = {
      id: task?.id ?? generateId(),
      title: title.trim(),
      priority,
      estimatedMinutes,
      xpReward,
      completed: task?.completed ?? false,
      createdAt: task?.createdAt ?? Date.now(),
      completedAt: task?.completedAt,
    };
    onSave(saved);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-bg-card border border-border-bright rounded-2xl shadow-card p-6 z-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              {task ? 'Edit Mission' : 'New Mission'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">Mission Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Revise Chapter 5..."
                className="w-full"
                autoFocus
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      priority === p
                        ? p === 'high' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                          : p === 'medium' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-text-muted/10 border-text-muted/30 text-text-muted'
                        : 'border-border-subtle text-text-dim hover:border-border-bright hover:text-text-muted'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Estimated Duration (minutes)
              </label>
              <div className="flex gap-2">
                {[15, 30, 45, 60, 90].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEstimatedMinutes(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${
                      estimatedMinutes === m
                        ? 'bg-accent-lime/10 border-accent-lime/30 text-accent-lime'
                        : 'border-border-subtle text-text-dim hover:border-border-bright hover:text-text-muted'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={240}
                className="w-full mt-2"
                placeholder="Custom minutes..."
              />
            </div>

            {/* XP */}
            <div className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl border border-border-subtle">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-lime" />
                <span className="text-sm text-text-primary font-medium">XP Reward</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={xpReward}
                  onChange={e => setXpReward(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={500}
                  className="w-20 text-center text-accent-lime font-bold"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm text-text-muted border border-border-subtle hover:border-border-bright hover:text-text-primary transition-all"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-bg-primary bg-accent-lime hover:bg-accent-limeDim transition-all shadow-lime"
              >
                {task ? 'Save Changes' : 'Add Mission'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
