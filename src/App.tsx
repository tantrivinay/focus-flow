import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { MobileNav } from './components/MobileNav/MobileNav';
import { Toast } from './components/Toast/Toast';
import { Confetti } from './components/Confetti/Confetti';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Analytics } from './pages/Analytics/Analytics';
import { Settings } from './pages/Settings/Settings';
import { useToast, useAutoRemoveToast } from './hooks/useToast';
import type { Page, Task, UserSettings, UserStats, TimerMode, FocusSession } from './types';
import {
  loadTasks, saveTasks,
  loadSettings, saveSettings,
  loadStats, saveStats,
  loadSessions, saveSessions,
  loadCompletedIds, saveCompletedIds,
  loadTotalXp, saveTotalXp,
  clearAllData,
  getDefaultSettings, getDefaultStats, getDefaultTasks,
  computeLevel,
  todayKey,
  generateId,
} from './utils';

export default function App() {
  // ─── Persisted state ─────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [stats, setStats] = useState<UserStats>(loadStats);
  const [sessions, setSessions] = useState<FocusSession[]>(loadSessions);
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadCompletedIds);
  const [totalXp, setTotalXp] = useState<number>(loadTotalXp);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const { toasts, addToast, removeToast } = useToast();
  useAutoRemoveToast(toasts, removeToast);

  // ─── Persistence effects ─────────────────────────────────────────────────
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveStats(stats); }, [stats]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { saveCompletedIds(completedIds); }, [completedIds]);
  useEffect(() => { saveTotalXp(totalXp); }, [totalXp]);

  // ─── Keyboard shortcut: Space = toggle timer (handled in FocusTimer via hook) ─
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        // Dispatch a custom event for the timer to pick up
        window.dispatchEvent(new CustomEvent('ff:timer-toggle'));
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // ─── Task handlers ────────────────────────────────────────────────────────
  const handleTasksChange = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    // Update today's activity
    const today = todayKey();
    const completedCount = newTasks.filter(t => t.completed).length;
    setStats(prev => ({
      ...prev,
      weeklyActivity: {
        ...prev.weeklyActivity,
        [today]: {
          ...(prev.weeklyActivity[today] ?? { date: today, focusMinutes: 0, sessionsCompleted: 0, xpEarned: 0 }),
          tasksCompleted: completedCount,
        },
      },
    }));
  }, []);

  // ─── XP handler ──────────────────────────────────────────────────────────
  const handleXpEarned = useCallback((amount: number, taskId?: string) => {
    // Prevent duplicate XP for same task
    if (taskId && completedIds.has(taskId)) return;

    const newCompletedIds = new Set(completedIds);
    if (taskId) newCompletedIds.add(taskId);
    setCompletedIds(newCompletedIds);

    const prevLevel = computeLevel(totalXp).level;
    const newTotalXp = totalXp + amount;
    const newLevel = computeLevel(newTotalXp).level;
    setTotalXp(newTotalXp);

    // Update stats
    const today = todayKey();
    setStats(prev => {
      const { level, xp, xpToNextLevel } = computeLevel(newTotalXp);
      return {
        ...prev,
        level,
        xp,
        xpToNextLevel,
        weeklyActivity: {
          ...prev.weeklyActivity,
          [today]: {
            ...(prev.weeklyActivity[today] ?? { date: today, focusMinutes: 0, tasksCompleted: 0, sessionsCompleted: 0 }),
            xpEarned: (prev.weeklyActivity[today]?.xpEarned ?? 0) + amount,
          },
        },
      };
    });

    // Level-up celebration
    if (newLevel > prevLevel) {
      setConfettiActive(true);
      addToast(`🎉 Level Up! You're now Level ${newLevel}!`, 'success');
      setTimeout(() => setConfettiActive(false), 100);
    }
  }, [completedIds, totalXp, addToast]);

  // ─── Session complete handler ─────────────────────────────────────────────
  const handleSessionComplete = useCallback((mode: TimerMode, durationMinutes: number) => {
    if (mode !== 'focus') return; // only award XP for focus sessions

    const session: FocusSession = {
      id: generateId(),
      startedAt: Date.now() - durationMinutes * 60000,
      duration: durationMinutes,
      mode,
      completed: true,
    };
    setSessions(prev => [...prev, session]);

    const sessionXp = Math.round(durationMinutes * 2); // 2 XP per focus minute
    handleXpEarned(sessionXp);

    const today = todayKey();
    setStats(prev => ({
      ...prev,
      totalFocusMinutes: prev.totalFocusMinutes + durationMinutes,
      totalSessions: prev.totalSessions + 1,
      weeklyActivity: {
        ...prev.weeklyActivity,
        [today]: {
          ...(prev.weeklyActivity[today] ?? { date: today, tasksCompleted: 0, xpEarned: 0 }),
          focusMinutes: (prev.weeklyActivity[today]?.focusMinutes ?? 0) + durationMinutes,
          sessionsCompleted: (prev.weeklyActivity[today]?.sessionsCompleted ?? 0) + 1,
        },
      },
    }));

    addToast(`🔥 Focus session done! +${sessionXp} XP`, 'success');
  }, [handleXpEarned, addToast]);

  // ─── Settings handler ─────────────────────────────────────────────────────
  const handleSettingsChange = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
  }, []);

  // ─── Reset handler ────────────────────────────────────────────────────────
  const handleResetData = useCallback(() => {
    clearAllData();
    setTasks(getDefaultTasks());
    setSettings(getDefaultSettings());
    setStats(getDefaultStats());
    setSessions([]);
    setCompletedIds(new Set());
    setTotalXp(0);
  }, []);

  const { level, xp, xpToNextLevel } = computeLevel(totalXp);
  const completedToday = tasks.filter(t => t.completed).length;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Sidebar (desktop) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        level={level}
        xp={xp}
        xpToNextLevel={xpToNextLevel}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          displayName={settings.displayName}
          currentPage={currentPage}
          completedToday={completedToday}
          totalToday={tasks.length}
          level={level}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              {currentPage === 'dashboard' && (
                <Dashboard
                  tasks={tasks}
                  settings={settings}
                  stats={stats}
                  completedIds={completedIds}
                  totalXp={totalXp}
                  onTasksChange={handleTasksChange}
                  onSessionComplete={handleSessionComplete}
                  onXpEarned={handleXpEarned}
                  addToast={addToast}
                />
              )}
              {currentPage === 'analytics' && (
                <Analytics stats={stats} />
              )}
              {currentPage === 'settings' && (
                <Settings
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  onResetData={handleResetData}
                  addToast={addToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile nav */}
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Global overlays */}
      <Toast toasts={toasts} onRemove={removeToast} />
      <Confetti active={confettiActive} />
    </div>
  );
}
