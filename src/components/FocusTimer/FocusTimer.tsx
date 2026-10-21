import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Moon } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import type { TimerMode, UserSettings } from '../../types';

interface Props {
  settings: UserSettings;
  onSessionComplete: (mode: TimerMode, durationMinutes: number) => void;
  reducedMotion: boolean;
}

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const modeIcons: Record<TimerMode, React.ReactNode> = {
  focus: <Zap className="w-4 h-4" />,
  'short-break': <Coffee className="w-4 h-4" />,
  'long-break': <Moon className="w-4 h-4" />,
};

const SIZE = 220;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FocusTimer({ settings, onSessionComplete, reducedMotion }: Props) {
  const timer = useTimer({
    focusDuration: settings.focusDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    onSessionComplete,
    soundEnabled: settings.soundEnabled,
  });

  const isBreak = timer.mode !== 'focus';
  const accentColor = isBreak ? '#A78BFA' : '#C8FF5D';

  const strokeDashoffset = CIRCUMFERENCE * (1 - timer.progress);

  return (
    <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 card-glow-lime">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-bg-elevated rounded-xl mb-6">
        {(['focus', 'short-break', 'long-break'] as TimerMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => timer.switchMode(mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              timer.mode === mode
                ? 'bg-bg-card text-text-primary shadow-sm border border-border-bright'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {modeIcons[mode]}
            <span className="hidden sm:inline">{modeLabels[mode]}</span>
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              className="timer-circle-bg"
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <circle
              className={`timer-circle-progress ${isBreak ? 'timer-circle-break' : ''}`}
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={reducedMotion ? strokeDashoffset : strokeDashoffset}
              style={{
                strokeDashoffset,
                transition: timer.isRunning && !reducedMotion ? 'stroke-dashoffset 1s linear' : 'none',
              }}
            />
          </svg>

          {/* Center display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={`${timer.minutes}:${timer.seconds}`}
              initial={reducedMotion ? {} : { scale: 1.05, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-5xl font-bold tabular-nums tracking-tight"
              style={{ color: accentColor }}
            >
              {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
            </motion.span>
            <span className="text-xs text-text-muted mt-1 font-medium">{modeLabels[timer.mode]}</span>
            {timer.sessionsCompleted > 0 && (
              <div className="flex gap-1 mt-2">
                {Array.from({ length: Math.min(timer.sessionsCompleted, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: accentColor }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={timer.reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-bright text-text-muted hover:text-text-primary hover:border-border-bright transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={timer.isRunning ? timer.pause : timer.start}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-medium text-bg-primary transition-all shadow-lime"
            style={{ background: accentColor }}
          >
            {timer.isRunning
              ? <Pause className="w-6 h-6" />
              : <Play className="w-6 h-6 ml-0.5" />
            }
          </motion.button>

          <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-bright flex items-center justify-center">
            <span className="text-xs font-bold text-text-muted">{timer.sessionsCompleted}</span>
          </div>
        </div>

        <p className="text-xs text-text-dim text-center">
          {timer.sessionsCompleted} session{timer.sessionsCompleted !== 1 ? 's' : ''} completed today
          {' · '}Press <kbd className="px-1 py-0.5 rounded text-[10px] bg-bg-elevated border border-border-bright font-mono">Space</kbd> to toggle
        </p>
      </div>
    </div>
  );
}
