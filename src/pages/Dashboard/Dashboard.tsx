import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, CheckCircle2, Timer, Zap, Trophy, Target, Star } from 'lucide-react';
import { FocusTimer } from '../../components/FocusTimer/FocusTimer';
import { TaskCard } from '../../components/TaskCard/TaskCard';
import { TaskModal } from '../../components/TaskModal/TaskModal';
import { ProgressCard } from '../../components/ProgressCard/ProgressCard';
import type { Task, UserSettings, UserStats, TimerMode } from '../../types';
import {
  computeLevel,
  todayKey,
  weekKeys,
  shortDayLabel,
  MOTIVATIONAL_MESSAGES,
} from '../../utils';

interface Props {
  tasks: Task[];
  settings: UserSettings;
  stats: UserStats;
  completedIds: Set<string>;
  totalXp: number;
  onTasksChange: (tasks: Task[]) => void;
  onSessionComplete: (mode: TimerMode, durationMinutes: number) => void;
  onXpEarned: (amount: number, taskId?: string) => void;
  addToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'xp') => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Dashboard({
  tasks, settings, stats, completedIds, totalXp,
  onTasksChange, onSessionComplete, onXpEarned, addToast,
}: Props) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const today = todayKey();
  const todayActivity = stats.weeklyActivity[today];
  const completedToday = tasks.filter(t => t.completed).length;
  const { level, xp, xpToNextLevel } = computeLevel(totalXp);
  const xpProgress = (xp / xpToNextLevel) * 100;
  const motivation = MOTIVATIONAL_MESSAGES[new Date().getDate() % MOTIVATIONAL_MESSAGES.length];
  const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const wasCompleted = task.completed;
    const updated = tasks.map(t => t.id === id
      ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
      : t
    );
    onTasksChange(updated);

    if (!wasCompleted && !completedIds.has(id)) {
      onXpEarned(task.xpReward, id);
      addToast(`+${task.xpReward} XP earned! 🎯`, 'xp');
    }
    if (wasCompleted) {
      addToast('Task uncompleted.', 'info');
    }
  };

  const handleDelete = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
    addToast('Mission deleted.', 'info');
  };

  const handleSaveTask = (task: Task) => {
    const exists = tasks.find(t => t.id === task.id);
    if (exists) {
      onTasksChange(tasks.map(t => t.id === task.id ? task : t));
      addToast('Mission updated!', 'success');
    } else {
      onTasksChange([task, ...tasks]);
      addToast('Mission added!', 'success');
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const weekDays = weekKeys();
  const focusMinutesToday = todayActivity?.focusMinutes ?? 0;
  const sessionsToday = todayActivity?.sessionsCompleted ?? 0;
  const xpToday = todayActivity?.xpEarned ?? 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 pb-24 md:pb-6"
    >
      {/* Welcome strip */}
      <motion.div variants={item} className="lg:col-span-3 bg-bg-card border border-border-subtle rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-lime/5 via-transparent to-accent-violet/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Hey, {settings.displayName}! 👋
            </h2>
            <p className="text-text-muted text-sm mt-1">"{motivation}"</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-lime">{completedToday}</div>
              <div className="text-xs text-text-muted">Tasks done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-violet">{stats.streak}</div>
              <div className="text-xs text-text-muted">Day streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">Lv.{level}</div>
              <div className="text-xs text-text-muted">Current level</div>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-text-muted">
            <span>Daily progress</span>
            <span>{tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-lime to-accent-violet rounded-full"
              animate={{ width: tasks.length > 0 ? `${(completedToday / tasks.length) * 100}%` : '0%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Focus Timer */}
      <motion.div variants={item} className="lg:col-span-1">
        <FocusTimer
          settings={settings}
          onSessionComplete={onSessionComplete}
          reducedMotion={settings.reducedMotion}
        />
      </motion.div>

      {/* Tasks panel */}
      <motion.div variants={item} className="lg:col-span-2 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-lime" />
              Today's Missions
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{completedToday} of {tasks.length} complete</p>
          </div>
          <motion.button
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-lime/10 border border-accent-lime/20 text-accent-lime text-sm font-medium hover:bg-accent-lime/15 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Mission
          </motion.button>
        </div>

        {/* Task list */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Star className="w-10 h-10 text-text-dim mb-3" />
                <p className="text-text-muted font-medium">No missions yet</p>
                <p className="text-text-dim text-sm mt-1">Add your first mission to get started</p>
              </motion.div>
            ) : allCompleted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-accent-lime" />
                </div>
                <p className="text-accent-lime font-bold text-lg">All Missions Complete!</p>
                <p className="text-text-muted text-sm mt-1">Outstanding work today. You're on a roll! 🎉</p>
              </motion.div>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ProgressCard value={focusMinutesToday} label="Focus Minutes" icon={<Timer className="w-4 h-4" />} color="lime" suffix="m" />
        <ProgressCard value={completedToday} label="Tasks Done" icon={<CheckCircle2 className="w-4 h-4" />} color="violet" />
        <ProgressCard value={sessionsToday} label="Sessions" icon={<Flame className="w-4 h-4" />} color="amber" />
        <ProgressCard value={xpToday} label="XP Today" icon={<Zap className="w-4 h-4" />} color="lime" />
      </motion.div>

      {/* XP Level card */}
      <motion.div variants={item} className="lg:col-span-2 bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Level {level} — Progress</h3>
            <p className="text-xs text-text-muted">{xp} / {xpToNextLevel} XP to next level</p>
          </div>
          <div className="ml-auto text-3xl font-black text-accent-violet">{level}</div>
        </div>
        <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-violet to-accent-lime rounded-full"
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-dim mt-2">
          <span>{xp} XP</span>
          <span>{xpToNextLevel} XP</span>
        </div>
      </motion.div>

      {/* Streak + Weekly calendar */}
      <motion.div variants={item} className="lg:col-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-text-primary">Streak</h3>
          <span className="ml-auto text-2xl font-black text-amber-400">{stats.streak}</span>
          <span className="text-xs text-text-muted">days</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const activity = stats.weeklyActivity[day];
            const hasActivity = activity && (activity.focusMinutes > 0 || activity.tasksCompleted > 0);
            const isToday = day === today;
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-dim">{shortDayLabel(day)}</span>
                <div
                  className={`w-6 h-6 rounded-md border transition-all ${
                    isToday
                      ? 'border-accent-lime/50 bg-accent-lime/20'
                      : hasActivity
                      ? 'border-amber-400/30 bg-amber-400/15'
                      : 'border-border-subtle bg-bg-elevated'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showTaskModal && (
          <TaskModal
            task={editingTask}
            onSave={handleSaveTask}
            onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
