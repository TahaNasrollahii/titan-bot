import { useId, type CSSProperties } from 'react';

import type { RankTier } from '@/api/types';
import { media } from '@/lib/media';
import { DefaultAvatar, getOrnamentSVGWrapper, getRingSVG, getTierByScore, rankFromApi } from '@/lib/ranks';

export interface RankAvatarProps {
  user?: {
    avatar?: string | null;
    avatarSeed?: number | null;
    points?: number;
    rank?: RankTier | string | null;
  } | null;
  score?: number;
  size?: number;
  avatar?: string | null;
  avatarSeed?: number | null;
  tuckOrnament?: boolean;
  className?: string;
}

/**
 * The user's picture (or generated helmet avatar) inside their rank frame (ring + ornament),
 * matching titan-front/src/components/RankAvatar.tsx.
 */
export function RankAvatar({
  user,
  score,
  size = 64,
  avatar,
  avatarSeed,
  tuckOrnament = false,
  className = '',
}: RankAvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const points = score !== undefined ? score : (user?.points ?? 0);
  const rank =
    user?.rank && typeof user.rank === 'object' ? rankFromApi(user.rank) : getTierByScore(points);
  const imgUrl = media(avatar !== undefined ? avatar : user?.avatar);
  const seed = avatarSeed !== undefined ? (avatarSeed ?? 5) : (user?.avatarSeed ?? 5);

  return (
    <span
      className={`rank-avatar ${className}`.trim()}
      style={{ '--size': `${size}px`, '--scale': size / 68 } as CSSProperties}
    >
      <span
        className={`rank-frame-wrap ${tuckOrnament ? 'rank-frame-wrap--tuck' : ''}`.trim()}
        data-tier={rank.id}
        style={{ '--tier-glow': rank.glow } as CSSProperties}
        aria-hidden
      >
        <span className="rank-frame-glow" />
        <span className="rank-frame-ring">{getRingSVG(rank, uid)}</span>
        <span className="rank-avatar__picture">
          {imgUrl ? <img src={imgUrl} alt="" decoding="async" /> : <DefaultAvatar seed={seed} />}
        </span>
        <span className="rank-frame-ornament">{getOrnamentSVGWrapper(rank, uid)}</span>
      </span>
    </span>
  );
}
