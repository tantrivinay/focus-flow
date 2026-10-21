import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, Volume2, Zap, RefreshCw, Save, VolumeX, Minimize2 } from 'lucide-react';
import type { UserSettings } from '../../types';
import { ConfirmationDialog } from '../../components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onResetData: () => void;
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

export function Settings({ settings, onSettingsChange, onResetData, addToast }: Props) {
  const [local, setLocal] = useState<UserSettings>(settings);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync local form state when settings prop changes externally (e.g. after data reset)
  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const update = (patch: Partial<UserSettings>) => {
    setLocal(prev => ({ ...prev, ...patch }));
  };

  // Immediately persist boolean toggles so they survive a refresh without
  // requiring the user to click "Save Settings".
  const updateToggle = (patch: Partial<UserSettings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSettingsChange(next);
  };

  const handleSave = () => {
    onSettingsChange(local);
    setSaved(true);
    addToast('Settings saved!', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-border-subtle last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 pb-24 md:pb-6 space-y-4 max-w-2xl mx-auto"
    >
      {/* Profile */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-accent-lime" />
          <h3 className="font-semibold text-text-primary">Profile</h3>
        </div>
        <SettingRow label="Display Name" description="How we address you in the app">
          <input
            type="text"
            value={local.displayName}
            onChange={e => update({ displayName: e.target.value })}
            className="w-40"
            maxLength={30}
          />
        </SettingRow>
      </motion.div>

      {/* Timer */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-accent-violet" />
          <h3 className="font-semibold text-text-primary">Timer Durations</h3>
        </div>

        <SettingRow label="Focus Session" description="Length of each focus block">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={local.focusDuration}
              onChange={e => update({ focusDuration: Math.max(1, Math.min(120, parseInt(e.target.value) || 25)) })}
              className="w-20 text-center"
              min={1}
              max={120}
            />
            <span className="text-xs text-text-muted">min</span>
          </div>
        </SettingRow>

        <SettingRow label="Short Break" description="Break after each focus session">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={local.shortBreakDuration}
              onChange={e => update({ shortBreakDuration: Math.max(1, Math.min(30, parseInt(e.target.value) || 5)) })}
              className="w-20 text-center"
              min={1}
              max={30}
            />
            <span className="text-xs text-text-muted">min</span>
          </div>
        </SettingRow>

        <SettingRow label="Long Break" description="Break after 4 focus sessions">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={local.longBreakDuration}
              onChange={e => update({ longBreakDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || 15)) })}
              className="w-20 text-center"
              min={1}
              max={60}
            />
            <span className="text-xs text-text-muted">min</span>
          </div>
        </SettingRow>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-text-primary">Preferences</h3>
        </div>

        <SettingRow
          label="Sound Effects"
          description="Play a chime when a session completes"
        >
          <div className="flex items-center gap-2">
            {local.soundEnabled ? <Volume2 className="w-4 h-4 text-accent-lime" /> : <VolumeX className="w-4 h-4 text-text-muted" />}
            <input
              type="checkbox"
              checked={local.soundEnabled}
              onChange={e => updateToggle({ soundEnabled: e.target.checked })}
              className="toggle-switch"
            />
          </div>
        </SettingRow>

        <SettingRow
          label="Reduced Motion"
          description="Minimizes animations throughout the app"
        >
          <div className="flex items-center gap-2">
            <Minimize2 className="w-4 h-4 text-text-muted" />
            <input
              type="checkbox"
              checked={local.reducedMotion}
              onChange={e => updateToggle({ reducedMotion: e.target.checked })}
              className="toggle-switch"
            />
          </div>
        </SettingRow>
      </motion.div>

      {/* Save button */}
      <motion.div variants={item}>
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-semibold text-bg-primary bg-accent-lime hover:bg-accent-limeDim transition-all flex items-center justify-center gap-2 shadow-lime"
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                ✓ Saved!
              </motion.span>
            ) : (
              <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={item} className="bg-bg-card border border-red-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-red-400">Danger Zone</h3>
        </div>
        <p className="text-sm text-text-muted mb-4">
          This will permanently delete all your tasks, progress, XP, and settings. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
        >
          Reset All Data
        </button>
      </motion.div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmationDialog
            title="Reset All Data?"
            message="This will permanently delete all your tasks, XP, sessions, and settings. You'll start fresh. This cannot be undone."
            confirmLabel="Yes, Reset Everything"
            onConfirm={() => {
              onResetData();
              setLocal(settings); // reset local form too
              addToast('All data has been reset.', 'warning');
            }}
            onClose={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
