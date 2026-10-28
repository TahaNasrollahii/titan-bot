import { useId } from 'react';

import type { RankTier } from '@/api/types';

import { faDigits } from './format';

/** Visual description of a rank tier (ring colours and ornament), matching titan-front/src/utils/ranks.tsx. */
export interface RankVisual {
  id: string;
  name: string;
  pts: string;
  desc: string;
  from: string;
  to: string;
  glow: string;
  ornament: string;
}

export const RANKS: RankVisual[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    pts: '۰ امتیاز',
    desc: 'تولد یک جنگجو در میدان',
    from: '#c97a3d',
    to: '#7a4118',
    glow: 'rgba(201,122,61,.55)',
    ornament: 'lozenge',
  },
  {
    id: 'silver',
    name: 'Silver',
    pts: '+۱,۵۰۰ امتیاز',
    desc: 'خروج از سایه‌ها و شکار رقبا',
    from: '#e7ebf0',
    to: '#9aa0aa',
    glow: 'rgba(200,208,220,.55)',
    ornament: 'star',
  },
  {
    id: 'gold',
    name: 'Gold',
    pts: '+۵,۰۰۰ امتیاز',
    desc: 'کابوس حریفان؛ درخشش در اوج',
    from: '#ffe07a',
    to: '#c9932c',
    glow: 'rgba(255,205,90,.6)',
    ornament: 'crown',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    pts: '+۱۰,۰۰۰ امتیاز',
    desc: 'ارباب بی‌نقص مسابقات؛ تشنه‌ی جاودانگی',
    from: '#c9a6ff',
    to: '#6b3fa0',
    glow: 'rgba(157,110,224,.6)',
    ornament: 'gem',
  },
  {
    id: 'titan',
    name: 'Titan',
    pts: '+۲۰,۰۰۰ امتیاز',
    desc: 'خدای بی‌رقیب میدان؛ اسطوره تایتان‌ها',
    from: '#ff3b30',
    to: '#3a0000',
    glow: 'rgba(255,40,30,.75)',
    ornament: 'titan',
  },
];

const RANK_MIN_POINTS = [0, 1500, 5000, 10000, 20000];

export const rankFromApi = (tier: RankTier): RankVisual => ({
  id: tier.slug,
  name: tier.name,
  pts: tier.minPoints ? `+${faDigits(tier.minPoints.toLocaleString('en-US'))} امتیاز` : '۰ امتیاز',
  desc: tier.description,
  from: tier.colorFrom,
  to: tier.colorTo,
  glow: tier.glow,
  ornament: tier.ornament,
});

export const getTierByScore = (score: number): RankVisual => {
  for (let i = RANK_MIN_POINTS.length - 1; i > 0; i--) {
    if (score >= RANK_MIN_POINTS[i]) return RANKS[i];
  }
  return RANKS[0];
};

export const getRankProgress = (score: number) => {
  const index = RANKS.indexOf(getTierByScore(score));
  const next = RANKS[index + 1] ?? null;
  if (!next) return { next, progress: 1, remaining: 0 };
  const from = RANK_MIN_POINTS[index];
  const to = RANK_MIN_POINTS[index + 1];
  return { next, progress: (score - from) / (to - from), remaining: to - score };
};

export const getOrnamentSVG = (kind: string, uid = '') => {
  if (kind === 'lozenge')
    return (
      <>
        <path d="M13 1 18.5 13 13 25 7.5 13Z" />
        <path d="M7.5 13H18.5" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth=".7" />
      </>
    );
  if (kind === 'star')
    return <path d="M13 2 15.64 9.36 23.46 9.6 17.28 14.39 19.47 21.9 13 17.5 6.53 21.9 8.72 14.39 2.54 9.6 10.36 9.36Z" />;
  if (kind === 'crown') return <path d="M1 18l2-9 6 4.5L13 3l4 10.5 6-4.5 2 9z" />;
  if (kind === 'gem')
    return (
      <>
        <path d="M9 4H17L22 10 13 25 4 10Z" />
        <path d="M4 10H22M9 4 13 25M17 4 13 25" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth=".7" />
        <path d="M9 4H17L19.5 7H6.5Z" fill="rgba(255,255,255,.35)" stroke="none" />
      </>
    );
  if (kind === 'titan')
    return (
      <>
        <defs>
          <filter id={`titanGlow${uid}`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation=".9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M15 16C19 17 25 14 26 8 26.5 4.5 24 2 21 2.5 23 4 23.5 6.5 22 8.5 20.5 10.5 17.5 11.5 15 11Z" />
        <path d="M11 16C7 17 1 14 0 8-.5 4.5 2 2 5 2.5 3 4 2.5 6.5 4 8.5 5.5 10.5 8.5 11.5 11 11Z" />
        <path d="M13 9.5 18.6 12.8 18 19.2 15 23.6 13 25 11 23.6 8 19.2 7.4 12.8Z" />
        <g className="rank-eye-blink" filter={`url(#titanGlow${uid})`}>
          <path d="M7.9 13.3 12.2 16.7 9.2 17.7Z" fill="#ff2a1f" stroke="none" />
          <path d="M9 14.9 11.5 16.5 9.6 17.1Z" fill="#ffe3da" stroke="none" />
          <rect x="10.2" y="15.3" width=".55" height="1.9" rx=".27" fill="#3a0000" stroke="none" transform="rotate(-28 10.475 16.25)" />
        </g>
        <g className="rank-eye-blink e2" filter={`url(#titanGlow${uid})`}>
          <path d="M18.1 13.3 13.8 16.7 16.8 17.7Z" fill="#ff2a1f" stroke="none" />
          <path d="M17 14.9 14.5 16.5 16.4 17.1Z" fill="#ffe3da" stroke="none" />
          <rect x="15.25" y="15.3" width=".55" height="1.9" rx=".27" fill="#3a0000" stroke="none" transform="rotate(28 15.525 16.25)" />
        </g>
        <path d="M12.2 21.6H13.8" stroke="rgba(0,0,0,.6)" strokeWidth=".7" fill="none" strokeLinecap="round" />
      </>
    );
  return <path d="M13 1 18.5 13 13 25 7.5 13Z" />;
};

export const getRingSVG = (r: RankVisual, uid = '') => (
  <svg viewBox="0 0 100 100">
    <defs>
      <linearGradient id={`ringGrad-${r.id}${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={r.from} />
        <stop offset="1" stopColor={r.to} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48.5" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="1.4" />
    <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#ringGrad-${r.id}${uid})`} strokeWidth="5.5" />
    <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1" />

    <g className="rank-frame-sweep">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity=".95" strokeWidth="2.6" strokeDasharray="2.5 289" strokeLinecap="round" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.2" strokeDasharray="2.5 289" strokeLinecap="round" transform="rotate(-9 50 50)" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.8" strokeDasharray="2.5 289" strokeLinecap="round" transform="rotate(-18 50 50)" />
    </g>

    <g className="rank-frame-sweep2">
      <circle cx="50" cy="50" r="46" fill="none" stroke={r.from} strokeOpacity=".9" strokeWidth="2.4" strokeDasharray="1.8 289" strokeLinecap="round" />
    </g>

    <g className="frame-sparkles">
      <circle className="rank-spark s1" cx="50" cy="3.2" r="1.7" fill="#fff" />
      <circle className="rank-spark s2" cx="94" cy="62" r="1.3" fill="#fff" />
      <circle className="rank-spark s3" cx="16" cy="80" r="1.5" fill="#fff" />
      <circle className="rank-spark s4" cx="80" cy="18" r="1.1" fill="#fff" />
    </g>
  </svg>
);

export const getOrnamentSVGWrapper = (r: RankVisual, uid = '') => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill={`url(#ornFill-${r.id}${uid})`} stroke="rgba(0,0,0,.35)" strokeWidth=".6">
    <defs>
      <linearGradient id={`ornFill-${r.id}${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={r.from} />
        <stop offset="1" stopColor={r.to} />
      </linearGradient>
    </defs>
    <g transform="translate(0,1)">{getOrnamentSVG(r.ornament, uid)}</g>
  </svg>
);

const AVATAR_PALETTE = {
  bg: ['#36200a', '#7a4c12'],
  shell: ['#fff6e2', '#d6b67a'],
  accent: '#ffc23d',
  suit: '#1f1305',
};

/**
 * Default picture for users without an upload: the website's gold visored esports helmet
 * (titan-front/src/components/Icons.tsx Avatar), its visor and gear picked by ``seed``.
 */
export function DefaultAvatar({ seed = 5 }: { seed?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const s = Math.abs(seed | 0);
  const { bg, shell, accent, suit } = AVATAR_PALETTE;
  const visor = (s * 7 + 1) % 3;
  const gear = (s * 5 + 2) % 4;
  const id = (name: string) => `av${name}${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg[1]} />
          <stop offset="1" stopColor={bg[0]} />
        </linearGradient>
        <radialGradient id={id('glow')} cx="0.5" cy="0.42" r="0.5">
          <stop offset="0" stopColor={accent} stopOpacity="0.55" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('shell')} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={shell[0]} />
          <stop offset="1" stopColor={shell[1]} />
        </linearGradient>
        <linearGradient id={id('visor')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor={accent} />
          <stop offset="1" stopColor={accent} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" fill={url('bg')} />
      <path d="M-4 30 30-4M4 42 42 4M14 48 48 14" stroke="#fff" strokeOpacity="0.06" strokeWidth="3" />
      <circle cx="20" cy="17" r="17" fill={url('glow')} />

      <path d="M3.5 41c0-8.5 7-13.5 16.5-13.5S36.5 32.5 36.5 41z" fill={suit} />
      <path d="M3.5 41c0-8.5 7-13.5 16.5-13.5S36.5 32.5 36.5 41" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="0.9" />
      <path d="M20 32.6l2.2 2.2-2.2 2.2-2.2-2.2z" fill={accent} />
      <rect x="16.6" y="24.5" width="6.8" height="4.5" rx="1.6" fill={shell[1]} />

      {gear === 3 && <path d="M8.6 20.5a11.4 11.4 0 0 1 22.8 0" fill="none" stroke={suit} strokeWidth="2.2" />}

      <path d="M10.4 18.6a9.6 9.6 0 0 1 19.2 0v4a5.2 5.2 0 0 1-5.2 5.2h-8.8a5.2 5.2 0 0 1-5.2-5.2z" fill={url('shell')} />
      <path d="M13.6 12.6a7.6 7.6 0 0 1 6.4-3.2" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round" />

      {visor === 0 && (
        <>
          <rect x="11" y="16.4" width="18" height="7.4" rx="3.7" fill={accent} opacity="0.35" />
          <rect x="12" y="17.1" width="16" height="6" rx="3" fill={url('visor')} />
        </>
      )}
      {visor === 1 && (
        <>
          <path d="M11.6 17h16.8l-3.3 7h-10.2z" fill={accent} opacity="0.35" transform="translate(0 -.4) scale(1 1.04)" />
          <path d="M12.4 17.3h15.2l-3 6.1h-9.2z" fill={url('visor')} />
        </>
      )}
      {visor === 2 && (
        <>
          <rect x="11.6" y="17.6" width="16.8" height="5.4" rx="2.7" fill="#0d0d12" opacity="0.85" />
          <rect x="13.2" y="18.8" width="5.6" height="3" rx="1.5" fill={url('visor')} />
          <rect x="21.2" y="18.8" width="5.6" height="3" rx="1.5" fill={url('visor')} />
        </>
      )}
      <path d="M14.4 18.6h4" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />

      {gear === 0 && (
        <>
          <path d="M24.6 9.9l2.4-4.4" stroke={shell[1]} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="27.2" cy="5.2" r="1.6" fill={accent} />
        </>
      )}
      {gear === 1 && <path d="M17.6 9.6 20 4.6l2.4 5" fill={accent} />}
      {gear === 2 && (
        <>
          <rect x="8.4" y="17.2" width="2.6" height="6.4" rx="1.3" fill={shell[1]} />
          <rect x="29" y="17.2" width="2.6" height="6.4" rx="1.3" fill={shell[1]} />
          <circle cx="9.7" cy="20.4" r="0.8" fill={accent} />
          <circle cx="30.3" cy="20.4" r="0.8" fill={accent} />
        </>
      )}
      {gear === 3 && (
        <>
          <rect x="7.4" y="17.6" width="3.6" height="7.2" rx="1.8" fill={suit} />
          <rect x="29" y="17.6" width="3.6" height="7.2" rx="1.8" fill={suit} />
          <rect x="8.4" y="19.4" width="1.6" height="3.6" rx="0.8" fill={accent} />
          <rect x="30" y="19.4" width="1.6" height="3.6" rx="0.8" fill={accent} />
        </>
      )}
    </svg>
  );
}
