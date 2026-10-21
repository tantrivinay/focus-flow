import type { Task, UserSettings, UserStats, FocusSession, DayActivity } from '../types';

// ─── XP / Leveling ──────────────────────────────────────────────────────────

/** XP required to reach the next level from level N */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level - 1));
}

/** Given cumulative XP, return { level, xp (within current level), xpToNextLevel } */
export function computeLevel(totalXp: number): { level: number; xp: number; xpToNextLevel: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, xp: remaining, xpToNextLevel: xpForLevel(level) };
}

// ─── Date helpers ────────────────────────────────────────────────────────────

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function weekKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function shortDayLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

export function computeStreak(weeklyActivity: Record<string, DayActivity>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const activity = weeklyActivity[key];
    if (activity && (activity.focusMinutes > 0 || activity.tasksCompleted > 0)) {
      streak++;
    } else if (i > 0) {
      break; // gap found
    }
  }
  return streak;
}

// ─── LocalStorage helpers ────────────────────────────────────────────────────

const KEYS = {
  TASKS: 'ff_tasks',
  SETTINGS: 'ff_settings',
  STATS: 'ff_stats',
  SESSIONS: 'ff_sessions',
  COMPLETED_IDS: 'ff_completed_ids',
  TOTAL_XP: 'ff_total_xp',
};

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    return raw ? JSON.parse(raw) : getDefaultTasks();
  } catch {
    return getDefaultTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch { /* ignore quota errors */ }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...getDefaultSettings(), ...JSON.parse(raw) } : getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    if (!raw) return getDefaultStats();
    const parsed = JSON.parse(raw) as UserStats;
    // Ensure streak is recomputed on load
    parsed.streak = computeStreak(parsed.weeklyActivity || {});
    return { ...getDefaultStats(), ...parsed };
  } catch {
    return getDefaultStats();
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch { /* ignore */ }
}

export function loadSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions.slice(-100)));
  } catch { /* ignore */ }
}

export function loadCompletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEYS.COMPLETED_IDS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveCompletedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(KEYS.COMPLETED_IDS, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function loadTotalXp(): number {
  try {
    return parseInt(localStorage.getItem(KEYS.TOTAL_XP) || '0', 10);
  } catch {
    return 0;
  }
}

export function saveTotalXp(xp: number): void {
  try {
    localStorage.setItem(KEYS.TOTAL_XP, xp.toString());
  } catch { /* ignore */ }
}

export function clearAllData(): void {
  Object.values(KEYS).forEach(k => {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  });
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export function getDefaultSettings(): UserSettings {
  return {
    displayName: 'Student',
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    soundEnabled: true,
    reducedMotion: false,
  };
}

export function getDefaultStats(): UserStats {
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: xpForLevel(1),
    totalFocusMinutes: 0,
    totalSessions: 0,
    streak: 0,
    lastActiveDate: todayKey(),
    weeklyActivity: getMockWeeklyActivity(),
  };
}

export function getDefaultTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: 'task-1',
      title: 'Revise Differential Equations',
      priority: 'high',
      estimatedMinutes: 60,
      xpReward: 80,
      completed: false,
      createdAt: now - 3600000,
    },
    {
      id: 'task-2',
      title: 'Complete Digital Logic Assignment',
      priority: 'high',
      estimatedMinutes: 45,
      xpReward: 60,
      completed: false,
      createdAt: now - 7200000,
    },
    {
      id: 'task-3',
      title: 'Review Python Project',
      priority: 'medium',
      estimatedMinutes: 30,
      xpReward: 40,
      completed: false,
      createdAt: now - 10800000,
    },
    {
      id: 'task-4',
      title: 'Read Research Paper on ML',
      priority: 'medium',
      estimatedMinutes: 45,
      xpReward: 50,
      completed: false,
      createdAt: now - 14400000,
    },
    {
      id: 'task-5',
      title: 'Prepare Presentation Slides',
      priority: 'low',
      estimatedMinutes: 20,
      xpReward: 25,
      completed: false,
      createdAt: now - 18000000,
    },
  ];
}

// ─── Mock historical data ────────────────────────────────────────────────────

/** Realistic sample data for the past 7 days (before today) */
export function getMockWeeklyActivity(): Record<string, DayActivity> {
  const activity: Record<string, DayActivity> = {};
  const today = new Date();
  const mockData = [
    { offsetDays: 6, focusMinutes: 95, tasksCompleted: 4, sessions: 4, xp: 210 },
    { offsetDays: 5, focusMinutes: 50, tasksCompleted: 2, sessions: 2, xp: 110 },
    { offsetDays: 4, focusMinutes: 120, tasksCompleted: 5, sessions: 5, xp: 280 },
    { offsetDays: 3, focusMinutes: 0,  tasksCompleted: 0, sessions: 0, xp: 0   },
    { offsetDays: 2, focusMinutes: 75, tasksCompleted: 3, sessions: 3, xp: 160 },
    { offsetDays: 1, focusMinutes: 100, tasksCompleted: 4, sessions: 4, xp: 220 },
  ];
  for (const d of mockData) {
    const date = new Date(today);
    date.setDate(today.getDate() - d.offsetDays);
    const key = date.toISOString().split('T')[0];
    activity[key] = {
      date: key,
      focusMinutes: d.focusMinutes,
      tasksCompleted: d.tasksCompleted,
      sessionsCompleted: d.sessions,
      xpEarned: d.xp,
    };
  }
  return activity;
}

// ─── Misc ─────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-amber-400';
    default: return 'text-text-muted';
  }
}

export function priorityBg(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-500/10 border-red-500/20';
    case 'medium': return 'bg-amber-500/10 border-amber-500/20';
    default: return 'bg-text-muted/10 border-text-muted/20';
  }
}

export const MOTIVATIONAL_MESSAGES = [
  "Deep work is the superpower of the 21st century.",
  "Progress, not perfection.",
  "Every study session is an investment in your future.",
  "Stay focused. The grind is worth it.",
  "Small steps every day lead to big results.",
  "You're building knowledge that no one can take away.",
  "Discipline is the bridge between goals and accomplishment.",
  "Your future self will thank today's effort.",
  "One focused hour beats three distracted ones.",
  "Keep going — you're closer than you think.",
];
