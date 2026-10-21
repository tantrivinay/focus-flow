import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode } from '../types';

interface UseTimerOptions {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  onSessionComplete: (mode: TimerMode, durationMinutes: number) => void;
  soundEnabled: boolean;
}

interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  totalDuration: number;
}

export function useTimer({
  focusDuration,
  shortBreakDuration,
  longBreakDuration,
  onSessionComplete,
  soundEnabled,
}: UseTimerOptions) {
  const durationForMode = useCallback(
    (mode: TimerMode): number => {
      if (mode === 'focus') return focusDuration * 60;
      if (mode === 'short-break') return shortBreakDuration * 60;
      return longBreakDuration * 60;
    },
    [focusDuration, shortBreakDuration, longBreakDuration]
  );

  const [state, setState] = useState<TimerState>(() => ({
    mode: 'focus',
    secondsLeft: focusDuration * 60,
    isRunning: false,
    sessionsCompleted: 0,
    totalDuration: focusDuration * 60,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
    } catch { /* Web Audio not supported */ }
  }, [soundEnabled]);

  // Tick effect — single interval, properly cleaned up
  useEffect(() => {
    clearTimer();
    completedRef.current = false;

    if (!state.isRunning) return;

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (!prev.isRunning) return prev;
        if (prev.secondsLeft <= 1) {
          if (!completedRef.current) {
            completedRef.current = true;
            const durationMinutes = Math.round(prev.totalDuration / 60);
            onSessionComplete(prev.mode, durationMinutes);
            playCompletionSound();
          }
          // Move to next mode
          const newSessions = prev.mode === 'focus' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
          const nextMode: TimerMode =
            prev.mode !== 'focus' ? 'focus' :
            newSessions % 4 === 0 ? 'long-break' : 'short-break';
          const nextDuration = durationForMode(nextMode);
          return {
            mode: nextMode,
            secondsLeft: nextDuration,
            isRunning: false,
            sessionsCompleted: newSessions,
            totalDuration: nextDuration,
          };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [state.isRunning, clearTimer, durationForMode, onSessionComplete, playCompletionSound]);

  // Update duration when settings change (only when not running)
  useEffect(() => {
    if (!state.isRunning) {
      const newDuration = durationForMode(state.mode);
      setState(prev => ({
        ...prev,
        secondsLeft: newDuration,
        totalDuration: newDuration,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDuration, shortBreakDuration, longBreakDuration]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState(prev => {
      const dur = durationForMode(prev.mode);
      return { ...prev, secondsLeft: dur, totalDuration: dur, isRunning: false };
    });
  }, [clearTimer, durationForMode]);

  const switchMode = useCallback((mode: TimerMode) => {
    clearTimer();
    const dur = durationForMode(mode);
    setState(prev => ({
      ...prev,
      mode,
      secondsLeft: dur,
      totalDuration: dur,
      isRunning: false,
    }));
  }, [clearTimer, durationForMode]);

  const minutes = Math.floor(state.secondsLeft / 60);
  const seconds = state.secondsLeft % 60;
  const progress = 1 - state.secondsLeft / state.totalDuration;

  return {
    mode: state.mode,
    secondsLeft: state.secondsLeft,
    isRunning: state.isRunning,
    sessionsCompleted: state.sessionsCompleted,
    minutes,
    seconds,
    progress,
    start,
    pause,
    reset,
    switchMode,
  };
}
