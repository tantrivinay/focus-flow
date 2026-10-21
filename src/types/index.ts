// ─── Core Types ─────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high';
export type TimerMode = 'focus' | 'short-break' | 'long-break';
export type Page = 'dashboard' | 'analytics' | 'settings';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  estimatedMinutes: number;
  xpReward: number;
  completed: boolean;
  completedAt?: number; // timestamp
  createdAt: number;
}

export interface UserSettings {
  displayName: string;
  focusDuration: number;    // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalFocusMinutes: number;
  totalSessions: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  weeklyActivity: Record<string, DayActivity>; // key: YYYY-MM-DD
}

export interface DayActivity {
  date: string;
  focusMinutes: number;
  tasksCompleted: number;
  sessionsCompleted: number;
  xpEarned: number;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  duration: number; // minutes
  mode: TimerMode;
  completed: boolean;
}

export interface AppState {
  tasks: Task[];
  settings: UserSettings;
  stats: UserStats;
  sessions: FocusSession[];
  completedTaskIds: Set<string>; // prevent duplicate XP
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'xp';
  message: string;
  duration?: number;
}
