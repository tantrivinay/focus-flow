import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, X, CheckCircle, Zap, Timer } from 'lucide-react';
import type { Page } from '../../types';

interface Props {
  displayName: string;
  currentPage: Page;
  completedToday: number;
  totalToday: number;
  level: number;
}

const notifications = [
  { id: '1', icon: <Zap className="w-4 h-4 text-accent-lime" />, text: 'You earned 80 XP for completing a task!', time: '5m ago' },
  { id: '2', icon: <Timer className="w-4 h-4 text-accent-violet" />, text: 'Focus session completed. Take a break!', time: '32m ago' },
  { id: '3', icon: <CheckCircle className="w-4 h-4 text-green-400" />, text: '3 tasks completed today. Great work!', time: '1h ago' },
];

const pageLabels: Record<Page, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  settings: 'Settings',
};

const motivations = [
  "Ready to make today count?",
  "Let's crush those study goals!",
  "Another day, another level up.",
  "Focus mode: engaged. Let's go!",
];

export function Header({ displayName, currentPage, completedToday, totalToday, level }: Props) {
  const [showNotifs, setShowNotifs] = useState(false);
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const motivation = motivations[new Date().getDay() % motivations.length];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-text-primary">
            {pageLabels[currentPage]}
          </h1>
          {currentPage === 'dashboard' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-lime/10 text-accent-lime border border-accent-lime/20">
              Lv.{level}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-0.5">{today}</p>
        {currentPage === 'dashboard' && (
          <p className="text-xs text-text-muted mt-0.5 italic">"{motivation}"</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Progress pill */}
        {currentPage === 'dashboard' && totalToday > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-bg-card border border-border-subtle rounded-full px-3 py-1.5">
            <div className="w-20 h-1.5 bg-border-subtle rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent-lime rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap">
              {completedToday}/{totalToday} done
            </span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifs(v => !v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent-lime/30 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-lime rounded-full" />
          </motion.button>

          <AnimatePresence>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifs(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-72 bg-bg-card border border-border-bright rounded-2xl shadow-card z-20 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                    <span className="text-sm font-semibold text-text-primary">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-text-muted hover:text-text-primary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-border-subtle">
                    {notifications.map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors">
                        <div className="mt-0.5 shrink-0">{n.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-text-primary leading-relaxed">{n.text}</p>
                          <p className="text-xs text-text-dim mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center">
          <User className="w-4 h-4 text-accent-violet" />
        </div>
        <span className="hidden sm:block text-sm font-medium text-text-primary">{displayName}</span>
      </div>
    </header>
  );
}
