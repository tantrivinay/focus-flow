import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

const COLORS = ['#C8FF5D', '#A78BFA', '#F59E0B', '#34D399', '#F472B6', '#60A5FA'];

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 3500);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}
