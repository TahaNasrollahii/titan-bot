import { Crown, Sparkles } from 'lucide-react';
import { m } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

import type { Me } from '@/api/types';
import { faDigits, num } from '@/lib/format';

import { Avatar } from './Avatar';

/** The gamer identity card: avatar in the rank's colors, level and XP progress. */
export function PlayerCard({ user, children }: { user: Me; children?: ReactNode }) {
  const rank = user.rank;
  const ring = rank ? `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` : undefined;
  const progress = user.maxXp ? Math.min(100, Math.round((user.xp / user.maxXp) * 100)) : 0;
  const name = user.username || user.fullName || 'گیمر تایتان';
  return (
    <div className="player" style={{ '--rank-a': rank?.colorFrom ?? '#f0645a', '--rank-b': rank?.colorTo ?? '#7a50e6' } as CSSProperties}>
      <div className="player__glow" aria-hidden />
      <div className="row" style={{ '--gap': '14px' } as CSSProperties}>
        <Avatar name={name} src={user.avatar} seed={user.avatarSeed} size={62} ring={ring} />
        <div className="player__id">
          <strong className="ltr">{name}</strong>
          <div className="row" style={{ '--gap': '6px' } as CSSProperties}>
            <span className="player__rank">
              <Crown size={12} /> {rank?.name ?? 'بدون رنک'}
            </span>
            <span className="player__level num">سطح {faDigits(user.level)}</span>
          </div>
        </div>
        <div className="player__points">
          <Sparkles size={14} />
          <span className="num">{num(user.points)}</span>
          <small>امتیاز</small>
        </div>
      </div>
      <div className="player__xp" aria-label={`پیشرفت سطح ${progress} درصد`}>
        <div className="player__xp-bar">
          <m.span initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }} />
        </div>
        <span className="text-xs muted num ltr">
          {faDigits(user.xp)} / {faDigits(user.maxXp)} XP
        </span>
      </div>
      {children}
    </div>
  );
}
