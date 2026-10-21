import { motion, AnimatePresence } from 'framer-motion';
import { Timer, LayoutDashboard, CheckSquare, BarChart2, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import type { Page } from '../../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { page: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { page: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ currentPage, onNavigate, isCollapsed, onToggle, level, xp, xpToNextLevel }: Props) {
  const progress = Math.min((xp / xpToNextLevel) * 100, 100);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col bg-bg-card border-r border-border-subtle relative z-20 shrink-0"
      style={{ overflow: 'hidden' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border-subtle">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-accent-lime/10 border border-accent-lime/30 flex items-center justify-center">
            <Timer className="w-5 h-5 text-accent-lime" />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-accent-lime/10 blur-sm -z-10" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-lg text-text-primary tracking-tight whitespace-nowrap">Focus</span>
              <span className="font-bold text-lg text-accent-lime tracking-tight">Flow</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => {
          const active = currentPage === item.page;
          return (
            <motion.button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                active
                  ? 'bg-accent-lime/10 text-accent-lime border border-accent-lime/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`shrink-0 ${active ? 'text-accent-lime' : 'text-text-muted group-hover:text-text-primary'}`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Level badge */}
      <div className="p-3 border-t border-border-subtle">
        <div className={`rounded-xl p-3 ${isCollapsed ? 'flex items-center justify-center' : 'bg-bg-elevated'}`}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-violet" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-violet" />
                  <span className="text-xs text-text-muted">Level {level}</span>
                </div>
                <span className="text-xs text-text-muted">{xp}/{xpToNextLevel} XP</span>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-violet rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-bg-elevated border border-border-bright rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent-lime/30 transition-all z-30"
      >
        {isCollapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />
        }
      </button>
    </motion.aside>
  );
}
