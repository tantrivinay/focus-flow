import { motion } from 'framer-motion';

interface Props {
  value: number;
  label: string;
  icon: React.ReactNode;
  color?: 'lime' | 'violet' | 'amber' | 'default';
  suffix?: string;
}

const colorMap = {
  lime: 'text-accent-lime',
  violet: 'text-accent-violet',
  amber: 'text-amber-400',
  default: 'text-text-primary',
};

export function ProgressCard({ value, label, icon, color = 'default', suffix = '' }: Props) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-4 flex flex-col gap-3 card-glow-lime"
    >
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs font-medium uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted">
          {icon}
        </div>
      </div>
      <div className={`text-3xl font-bold tabular-nums ${colorMap[color]}`}>
        {value.toLocaleString()}{suffix}
      </div>
    </motion.div>
  );
}
