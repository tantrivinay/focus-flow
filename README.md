## 🚀 Live Demo

**Try Focus Flow:** [Open the live website]https://focus-flow-lyart-six.vercel.app/

**Source Code:** https://github.com/tantrivinay/focus-flow





# Focus Flow 🎯

> **A gamified productivity dashboard for college students** — built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.

---

## Problem Statement

College students often struggle with focus and motivation during self-study sessions. Traditional to-do apps are dull — they track tasks but don't reward effort or create momentum. Focus Flow combines a Pomodoro-style focus timer, task management, and a progression system (XP + levels) to make studying feel like a game you actually want to play.

---

## Features

### ✅ Core
- **Pomodoro Focus Timer** — 25/5/15 min sessions (fully configurable). Start, pause, resume, reset. Smooth circular SVG progress ring.
- **Task Missions** — Add, edit, complete, and delete tasks with priority labels, estimated durations, and XP rewards.
- **Gamification** — Earn XP for completing tasks and focus sessions. Level up with a confetti celebration.
- **Daily Streak** — Tracks consecutive productive days. Shown in a weekly activity calendar.
- **Productivity Insights** — Focus minutes, tasks done, sessions completed, and XP earned today.

### 📊 Analytics
- Weekly focus time bar chart
- Tasks & sessions line chart
- XP earned per day chart
- Weekly completion rate

### ⚙️ Settings
- Display name
- Focus / short break / long break durations
- Sound effects (Web Audio API chime on session complete)
- Reduced motion toggle
- Full data reset with confirmation dialog

### 🎨 Design
- Deep midnight dark theme (`#0B0D12`)
- Electric lime (`#C8FF5D`) + soft violet (`#A78BFA`) accents
- Smooth page transitions and staggered card animations
- Collapsible sidebar (desktop) + bottom nav (mobile)
- Responsive on desktop, tablet, and mobile
- Custom recharts tooltips and axis styling

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Charts | Recharts 2 |
| Persistence | LocalStorage |
| Audio | Web Audio API |

---

## Installation

```bash
# 1. Clone or download the project
git clone https://github.com/YOUR_USERNAME/focus-flow.git
cd focus-flow

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check and bundle for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Architecture

```
src/
├── components/
│   ├── Sidebar/          # Collapsible desktop sidebar
│   ├── Header/           # Sticky header with notifications
│   ├── MobileNav/        # Fixed bottom navigation for mobile
│   ├── FocusTimer/       # Circular Pomodoro timer
│   ├── TaskCard/         # Expandable task row
│   ├── TaskModal/        # Add/edit task modal
│   ├── ProgressCard/     # Stat card for insights row
│   ├── Toast/            # Animated toast notifications
│   ├── ConfirmationDialog/ # Destructive action dialog
│   └── Confetti/         # Level-up celebration particle burst
├── pages/
│   ├── Dashboard/        # Main view
│   ├── Analytics/        # Charts and summaries
│   └── Settings/         # User preferences
├── hooks/
│   ├── useTimer.ts       # Pomodoro timer logic (safe interval cleanup)
│   └── useToast.ts       # Toast queue management
├── utils/
│   └── index.ts          # XP math, date helpers, LocalStorage, defaults
├── types/
│   └── index.ts          # TypeScript types
├── App.tsx               # Root — wires all state together
└── main.tsx              # ReactDOM entry point
```

---

## Design Decisions

**Why Tailwind + custom CSS?**  
Tailwind handles most utility work. Custom CSS (in `index.css`) adds things Tailwind can't easily express — SVG filter glows, the toggle switch, scrollbar styling, and confetti keyframes.

**XP / Leveling formula**  
`XP required for level N = floor(100 × 1.35^(N−1))`  
This gives a gentle early curve that steepens at higher levels, creating long-term engagement without making early levels feel pointless.

**Timer interval safety**  
The `useTimer` hook stores a single `intervalRef` and always clears it before starting a new one. Session completion fires only once per countdown via a `completedRef` guard, preventing duplicate XP awards on React StrictMode double-invocations.

**Duplicate XP prevention**  
Each task's `id` is stored in `completedIds` (a `Set` persisted to LocalStorage). Even if a user unchecks and rechecks a task, XP is only awarded the first time.

**Mock vs. real data**  
`getMockWeeklyActivity()` in `utils/index.ts` generates believable historical data for the 6 days before today. Today's data is always recorded fresh from real user activity.

---

## LocalStorage Persistence

| Key | Contents |
|---|---|
| `ff_tasks` | Array of task objects |
| `ff_settings` | User settings object |
| `ff_stats` | UserStats (level, XP, streak, weekly activity) |
| `ff_sessions` | Array of completed focus sessions (capped at 100) |
| `ff_completed_ids` | Array of task IDs that have already awarded XP |
| `ff_total_xp` | Cumulative total XP integer |

All reads are wrapped in try/catch to handle quota errors or corrupt data gracefully.

---

## Known Limitations

- The timer state is not persisted between page refreshes (intentional — starting the timer on page load would be disorienting).
- Streak calculation looks back 30 days in LocalStorage activity data. If the browser storage is cleared, the streak resets.
- Charts use local activity data only. There is no backend or cross-device sync.
- The Web Audio API chime requires at least one user interaction before it can play (browser security requirement).
- The app does not support multiple user accounts.
- Boolean settings (Sound Effects, Reduced Motion) save **immediately** when toggled. Text and number settings (Display Name, timer durations) require clicking **Save Settings**.

---

## Screenshots

> Add screenshots by placing PNG files in the `screenshots/` folder and linking them here.

```
screenshots/
  dashboard.png
  analytics.png
  settings.png
  mobile.png
```

---

## Publishing on GitHub

```bash
# 1. Initialize git (if not already)
git init
git add .
git commit -m "feat: initial Focus Flow release"

# 2. Create a new repository on GitHub (no README), then:
git remote add origin https://github.com/YOUR_USERNAME/focus-flow.git
git branch -M main
git push -u origin main
```

---

## License

MIT — use freely for personal or educational projects.
