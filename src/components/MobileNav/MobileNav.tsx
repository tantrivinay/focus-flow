import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart2, Settings } from 'lucide-react';
import type { Page } from '../../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
  { page: 'analytics', label: 'Stats', icon: <BarChart2 className="w-5 h-5" /> },
  { page: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function MobileNav({ currentPage, onNavigate }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-bg-card border-t border-border-subtle">
      <div className="flex">
        {navItems.map(item => {
          const active = currentPage === item.page;
          return (
            <motion.button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              whileTap={{ scale: 0.9 }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-accent-lime' : 'text-text-muted'
              }`}
            >
              {item.icon}
              {item.label}
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 w-1 h-1 rounded-full bg-accent-lime"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
