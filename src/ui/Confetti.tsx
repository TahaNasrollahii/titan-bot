import { m } from 'motion/react';
import { useMemo } from 'react';

const COLORS = ['#f0645a', '#fff0b3', '#ffcb5c', '#7a50e6', '#3ddc84', '#4cc3ff'];

/** A one-shot celebratory burst (purely decorative). */
export function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 340,
        y: -(140 + Math.random() * 220),
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.15,
        round: Math.random() > 0.6,
      })),
    [count],
  );
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {pieces.map(p => (
        <m.span
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            borderRadius: p.round ? '50%' : 2,
            background: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.15, 0.7, 0.4, 1] }}
        />
      ))}
    </div>
  );
}
