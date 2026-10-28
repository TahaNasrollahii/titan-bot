import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import type { Me } from '@/api/types';
import { useSession } from '@/auth/session';
import { faDigits, num } from '@/lib/format';
import { getTierByScore } from '@/lib/ranks';

import { Icon3D } from './Icon3D';
import { RankAvatar } from './RankAvatar';

/** The player's identity: avatar inside rank frame, rank, points and progress to the next level. */
export function PlayerCard({ user, children }: { user: Me; children?: ReactNode }) {
  const session = useSession();
  const tg = session.status === 'ready' ? session.telegram : null;
  // The player's real name, never a made-up label: Game ID, then their name, then Telegram's, then the phone.
  const name =
    user.username || user.fullName || `${tg?.firstName ?? ''} ${tg?.lastName ?? ''}`.trim() || faDigits(user.phone);
  const progress = user.maxXp ? Math.min(100, Math.round((user.xp / user.maxXp) * 100)) : 0;
  const rankName = user.rank?.name ?? getTierByScore(user.points).name;
  return (
    <div className="clay player">
      <div className="player__who">
        <RankAvatar user={user} size={64} />
        <div className="player__id">
          <strong>{name}</strong>
          <span className="player__tier">
            <Icon3D name="crown" size={18} />
            {rankName}، سطح {faDigits(user.level)}
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
      {!user.username && (
        <Link to="/me/edit" className="clay clay--cream player__nudge">
          <Icon3D name="video-game" size={18} />
          آیدی بازی‌ات را تنظیم کن تا دوستانت پیدایت کنند
        </Link>
      )}
      {children}
    </div>
  );
}
