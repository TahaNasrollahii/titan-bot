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
        <svg {...common}>
          <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" />
          <path d="M6.5 8v4l4.5 5.5h2.3L6.5 8z" />
          <path d="M17.5 8v4l-2.8 3.4h-2.3L17.5 8z" />
        </svg>
      );
    case 'vp-skins':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m12 3 2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1z" />
        </svg>
      );
    case 'vp-battlepass':
      return (
        <svg {...common}>
          <path d="M12 2 20 6v6.5c0 4.5-3.4 8-8 9.5-4.6-1.5-8-5-8-9.5V6l8-4z" />
          <path d="m8.5 12.5 3.5-3.2 3.5 3.2" />
          <path d="m8.5 16.2 3.5-3.2 3.5 3.2" />
        </svg>
      );
    case 'vp-nightmarket':
      return (
        <svg {...common}>
          <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
          <polygon points="12 7.5 15.5 12 12 16.5 8.5 12" />
          <path d="M8 5.5h.01" />
          <path d="M16 18.5h.01" />
        </svg>
      );
    case 'vp-melee':
      return (
        <svg {...common}>
          <path d="M19.5 4.5c-5.2 1-9.2 4.8-10.5 9.8l3 1.8c1.8-3.8 4.5-6.6 7.5-11.6z" />
          <circle cx="7.5" cy="18.5" r="2.6" />
          <path d="m9.2 15.2 2.2 1.4" />
        </svg>
      );
    case 'vp-packages':
      return (
        <svg {...common}>
          <polygon points="12 3 21 8 12 13 3 8" />
          <path d="m3 12.5 9 5 9-5" />
          <path d="m3 16.8 9 5 9-5" />
        </svg>
      );
    case 'vp-region':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3.5 12h17" />
        </svg>
      );
  }
}
