import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { Timer, CheckCircle2, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import type { UserStats } from '../../types';
import { weekKeys, shortDayLabel, formatDuration } from '../../utils';

interface Props {
  stats: UserStats;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string; color: string}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border-bright rounded-xl p-3 shadow-card text-xs">
      <p className="text-text-muted mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name === 'Focus (min)' ? 'm' : ''}
        </p>
      ))}
    </div>
  );
}

export function Analytics({ stats }: Props) {
  const days = weekKeys();

  const chartData = days.map(day => {
    const a = stats.weeklyActivity[day] ?? { focusMinutes: 0, tasksCompleted: 0, sessionsCompleted: 0, xpEarned: 0 };
    return {
      day: shortDayLabel(day),
      'Focus (min)': a.focusMinutes,
      'Tasks': a.tasksCompleted,
      'Sessions': a.sessionsCompleted,
      'XP': a.xpEarned,
    };
  });

  const totalFocusMin = days.reduce((sum, d) => sum + (stats.weeklyActivity[d]?.focusMinutes ?? 0), 0);
  const totalTasks = days.reduce((sum, d) => sum + (stats.weeklyActivity[d]?.tasksCompleted ?? 0), 0);
  const totalSessions = days.reduce((sum, d) => sum + (stats.weeklyActivity[d]?.sessionsCompleted ?? 0), 0);
  const totalXpWeek = days.reduce((sum, d) => sum + (stats.weeklyActivity[d]?.xpEarned ?? 0), 0);

  const completionRate = Math.round(
    days.filter(d => (stats.weeklyActivity[d]?.tasksCompleted ?? 0) > 0).length / 7 * 100
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 pb-24 md:pb-6 space-y-4"
    >
      {/* Summary cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Focus Time', value: formatDuration(totalFocusMin), icon: <Timer className="w-4 h-4" />, color: 'text-accent-lime' },
          { label: 'Tasks Done', value: totalTasks, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-accent-violet' },
          { label: 'Sessions', value: totalSessions, icon: <BarChart2 className="w-4 h-4" />, color: 'text-amber-400' },
          { label: 'XP Earned', value: totalXpWeek, icon: <Zap className="w-4 h-4" />, color: 'text-accent-lime' },
        ].map(card => (
          <div key={card.label} className="bg-bg-card border border-border-subtle rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wide">{card.label}</span>
              <div className={`${card.color}`}>{card.icon}</div>
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-text-dim mt-1">This week</div>
          </div>
        ))}
      </motion.div>

      {/* Weekly focus chart */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Timer className="w-4 h-4 text-accent-lime" />
          <h3 className="font-semibold text-text-primary">Weekly Focus Time</h3>
          <span className="ml-auto text-xs text-text-muted">Minutes per day</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#9299A8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9299A8', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,255,93,0.04)' }} />
            <Bar dataKey="Focus (min)" fill="#C8FF5D" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tasks & Sessions combined chart */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-accent-violet" />
          <h3 className="font-semibold text-text-primary">Tasks & Sessions</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#9299A8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9299A8', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2A3245' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9299A8' }} />
            <Line
              type="monotone"
              dataKey="Tasks"
              stroke="#A78BFA"
              strokeWidth={2.5}
              dot={{ fill: '#A78BFA', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Sessions"
              stroke="#C8FF5D"
              strokeWidth={2.5}
              dot={{ fill: '#C8FF5D', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* XP chart */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-text-primary">XP Earned Per Day</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#9299A8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9299A8', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(167,139,250,0.04)' }} />
            <Bar dataKey="XP" fill="#A78BFA" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Completion rate */}
      <motion.div variants={item} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Weekly Completion Rate</h3>
          <span className="text-2xl font-black text-accent-lime">{completionRate}%</span>
        </div>
        <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-lime to-accent-violet rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          You had productive activity on {Math.round(completionRate / 100 * 7)} out of 7 days this week.
        </p>
      </motion.div>
    </motion.div>
  );
}
