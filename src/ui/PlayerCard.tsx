import { m } from 'motion/react';
import type { ReactNode } from 'react';

import type { Me } from '@/api/types';
import { faDigits, num } from '@/lib/format';
import { media } from '@/lib/media';

import { Icon3D } from './Icon3D';

/** The player's identity: avatar, rank, points and progress to the next level. */
export function PlayerCard({ user, children }: { user: Me; children?: ReactNode }) {
  const name = user.username || user.fullName || 'گیمر تایتان';
  const avatar = media(user.avatar);
  const progress = user.maxXp ? Math.min(100, Math.round((user.xp / user.maxXp) * 100)) : 0;
  return (
    <div className="clay player">
      <div className="player__who">
        <span className="clay clay--red player__avatar">{avatar ? <img src={avatar} alt="" /> : name.trim()[0]?.toUpperCase()}</span>
        <div className="player__id">
          <strong>{name}</strong>
          <span className="player__tier">
            <Icon3D name="crown" size={18} />
            {user.rank?.name ?? 'بدون رنک'}، سطح {faDigits(user.level)}
          </span>
        </div>
        <div className="player__points">
          <span className="num">{num(user.points)}</span>
          <small>امتیاز</small>
        </div>
      </div>
      <div className="player__xp">
        <div className="well player__track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="پیشرفت سطح">
          <m.span initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }} />
        </div>
        <span className="num">
          {faDigits(user.xp)} از {faDigits(user.maxXp)}
        </span>
      </div>
      {children}
    </div>
  );
}
