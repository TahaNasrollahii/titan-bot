import { useId } from 'react';

import type { CrewIconName } from './content';

interface CrewIconProps {
  icon: CrewIconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}

export function CrewIcon({
  icon,
  size = 28,
  stroke = '#f2b84b',
  strokeWidth = 1.6,
}: CrewIconProps) {
  const uid = useId().replace(/:/g, '');
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (icon) {
    case 'gift':
      return (
        <svg {...common}>
          <path d="M20 12v9H4v-9" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 21V7" />
          <path d="M12 7H8a2.5 2.5 0 1 1 0-5c2.5 0 4 5 4 5z" />
          <path d="M12 7h4a2.5 2.5 0 1 0 0-5c-2.5 0-4 5-4 5z" />
        </svg>
      );
    case 'coin':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="m4.9 4.9 2.1 2.1" />
          <path d="m17 17 2.1 2.1" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
          <path d="m4.9 19.1 2.1-2.1" />
          <path d="m17 7 2.1-2.1" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...common}>
          <path d="M21 7.5 12 3 3 7.5v9L12 21l9-4.5z" />
          <path d="M3 7.5 12 12l9-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case 'note':
      return (
        <svg {...common}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      );
    case 'vp-emblem':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <defs>
            <linearGradient id={`vp-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.34" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <polygon
            points="16,2.5 27.5,8.5 27.5,23.5 16,29.5 4.5,23.5 4.5,8.5"
            fill={`url(#vp-${uid})`}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <path
            d="M8.5 10.2v5.6l6.1 7.7h3.3L8.5 10.2z"
            fill={stroke}
            fillOpacity="0.88"
            stroke="none"
          />
          <path
            d="M23.5 10.2v5.6l-3.9 4.9h-3.4l7.3-10.5z"
            fill={stroke}
            fillOpacity="0.62"
            stroke="none"
          />
        </svg>
      );
    case 'vp-skins':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <defs>
            <radialGradient id={`sk-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle
            cx="16"
            cy="16"
            r="11"
            fill={`url(#sk-${uid})`}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray="4 2.5"
          />
          <path
            d="M16 5.5 18.4 13.6 26.5 16 18.4 18.4 16 26.5 13.6 18.4 5.5 16 13.6 13.6Z"
            fill={stroke}
            fillOpacity="0.24"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <circle cx="16" cy="16" r="2.3" fill={stroke} stroke="none" />
        </svg>
      );
    case 'vp-battlepass':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <defs>
            <linearGradient id={`bp-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d="M16 3 27 8v9.5C27 23.4 22.2 27.6 16 29.5 9.8 27.6 5 23.4 5 17.5V8L16 3Z"
            fill={`url(#bp-${uid})`}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <path d="m10.5 16.5 5.5-5 5.5 5" stroke={stroke} strokeWidth={strokeWidth * 1.15} />
          <path d="m10.5 21.2 5.5-5 5.5 5" stroke={stroke} strokeWidth={strokeWidth * 1.15} strokeOpacity="0.7" />
          <circle cx="16" cy="8.2" r="1.5" fill={stroke} stroke="none" />
        </svg>
      );
    case 'vp-nightmarket':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <defs>
            <linearGradient id={`nm-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <rect
            x="7"
            y="3.5"
            width="18"
            height="25"
            rx="3.2"
            transform="rotate(-6 16 16)"
            fill={`url(#nm-${uid})`}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <polygon
            points="16,9.5 20.5,16 16,22.5 11.5,16"
            fill={stroke}
            fillOpacity="0.28"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <circle cx="23.5" cy="7.5" r="2" fill={stroke} stroke="none" />
        </svg>
      );
    case 'vp-melee':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <defs>
            <linearGradient id={`ml-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.38" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path
            d="M25.5 5.5C18.5 6.8 13.2 11.8 11.5 18.2l3.8 2.3c2.4-4.8 6.1-8.5 10.2-15Z"
            fill={`url(#ml-${uid})`}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <circle cx="10.2" cy="23.5" r="3.4" stroke={stroke} strokeWidth={strokeWidth * 1.1} fill={stroke} fillOpacity="0.16" />
          <path d="M12.2 19.2 14.8 21" stroke={stroke} strokeWidth={strokeWidth * 1.2} />
        </svg>
      );
    case 'vp-packages':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <defs>
            <linearGradient id={`pk-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.34" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <polygon
            points="16,4 26,9.5 16,15 6,9.5"
            fill={`url(#pk-${uid})`}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <path d="M6 15.2 16 20.8l10-5.6" stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M6 20.8 16 26.5l10-5.7" stroke={stroke} strokeWidth={strokeWidth} strokeOpacity="0.72" />
        </svg>
      );
    case 'vp-region':
      return (
        <svg {...common} viewBox="0 0 32 32">
          <circle cx="15" cy="16" r="10.5" stroke={stroke} strokeWidth={strokeWidth} fill={stroke} fillOpacity="0.1" />
          <ellipse cx="15" cy="16" rx="4.8" ry="10.5" stroke={stroke} strokeWidth={strokeWidth * 0.9} />
          <path d="M4.8 16h20.4" stroke={stroke} strokeWidth={strokeWidth * 0.9} />
          <circle cx="23.5" cy="22.5" r="4.8" fill="#0f1923" stroke={stroke} strokeWidth={strokeWidth} />
          <path d="m21.5 22.5 1.4 1.5 2.8-2.9" stroke={stroke} strokeWidth={strokeWidth * 1.15} />
        </svg>
      );
  }
}
