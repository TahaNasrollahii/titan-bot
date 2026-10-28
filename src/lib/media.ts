import type { ProductSummary } from '@/api/types';

import { env } from './env';

const apiOrigin = new URL(env.apiUrl).origin;

const LOCAL_GAME_ICONS: Record<string, string> = {
  'call-of-duty': '/images/categories/callof-v2.webp',
  'clash-of-clans': '/images/categories/clash.webp',
  fortnite: '/images/categories/fortnite.webp',
  valorant: '/images/categories/valorant.webp',
  premium: '/images/categories/premium.webp',
};

const LOCAL_GAME_LOGOS: Record<string, string> = {
  'call-of-duty': '/images/glossy-cod-logo.webp',
  fortnite: '/images/glossy-fortnite-logo.webp',
  valorant: '/images/glossy-valorant-logo.webp',
};

const LOCAL_GAME_BACKGROUNDS: Record<string, string> = {
  'call-of-duty': '/images/games/callof-background.webp',
  'clash-of-clans': '/images/games/clash-background.webp',
  fortnite: '/images/games/fortnite-background.webp',
  valorant: '/images/games/valorant-background.webp',
  premium: '/images/games/premium.webp',
};

const LOCAL_GAME_CHARACTERS: Record<string, string> = {
  'call-of-duty': '/images/games/callof-character-v2.webp',
  'clash-of-clans': '/images/games/clash-character.webp',
  fortnite: '/images/games/fortnite-character.webp',
  valorant: '/images/games/valorant-character.webp',
};

const LOCAL_CHARACTERS = [
  '/images/character-behind-login-form.webp',
  '/images/hero/characters/fortnite.webp',
  '/images/games/callof-character-v2.webp',
  '/images/games/clash-character.webp',
  '/images/hero/characters/valorant.webp',
  '/images/products/vbucks.webp',
  '/images/support-robot.webp',
];

/** Absolute URL for an image from the API: blob/CDN URLs pass through and uploads come from the API host.
 * Local optimized WebP assets in /images/ and /icons/ are served directly from the Mini App bundle. */
export function media(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  if (src.includes('games-apexlegends-background') || src.includes('games-callof-background')) return '/images/games/callof-background.webp';
  if (src.includes('games-clash-background')) return '/images/games/clash-background.webp';
  if (src.includes('games-fortnite-background')) return '/images/games/fortnite-background.webp';
  if (src.includes('games-valorant-background')) return '/images/games/valorant-background.webp';
  if (src.includes('games-premium') || src.includes('games/premium')) return '/images/games/premium.webp';
  if (src.includes('games-apexlegends-character') || src.includes('games-callof-character')) return '/images/games/callof-character-v2.webp';
  if (src.includes('games-clash-character')) return '/images/games/clash-character.webp';
  if (src.includes('games-fortnite-character')) return '/images/games/fortnite-character.webp';
  if (src.includes('games-valorant-character')) return '/images/games/valorant-character.webp';
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith('/media/')) return `${apiOrigin}${src}`;
  if (src.startsWith('/images/') || src.startsWith('/icons/') || src.startsWith('/clay/')) return src;
  return `${env.siteUrl}${src.startsWith('/') ? '' : '/'}${src}`;
}

export function gameIcon(slug: string | undefined, remoteIcon?: string | null): string | null {
  if (!slug) return remoteIcon ?? null;
  return LOCAL_GAME_ICONS[slug] ?? remoteIcon ?? null;
}

export function gameLogo(slug: string | undefined, remoteLogo?: string | null): string | null {
  if (!slug) return remoteLogo ?? null;
  return LOCAL_GAME_LOGOS[slug] ?? remoteLogo ?? null;
}

export function gameBackground(slug: string | undefined, remoteBg?: string | null): string | null {
  if (!slug) return remoteBg ?? null;
  return LOCAL_GAME_BACKGROUNDS[slug] ?? remoteBg ?? null;
}

export function gameCharacter(slug: string | undefined, remoteChar?: string | null): string | null {
  if (!slug || slug === 'premium') return null;
  return LOCAL_GAME_CHARACTERS[slug] ?? remoteChar ?? null;
}

/** Same artwork resolution as titan-front StoreClient ProductCard so cards always display crisp transparent art. */
export function productImage(product: Pick<ProductSummary, 'id' | 'slug' | 'image' | 'game'>): string {
  const gameSlug = product.game?.slug || '';
  return (
    (product.slug.includes('elden') ? '/images/character-behind-login-form.webp' : null) ||
    (product.image && !product.image.endsWith('.jpg') ? media(product.image) : null) ||
    (product.slug === 'cod-points' ? '/images/products/Molten-Gold-Lightning-King.webp' : null) ||
    (product.slug === 'clash-of-clans-gems' ? '/images/products/goblin_transparent.webp' : null) ||
    (product.slug === 'clash-of-clans-gold-pass' ? '/images/products/Barbarian-Pig-Rider-Reward-Rush.webp' : null) ||
    (product.slug === 'fortnite-starter-pack' ? '/images/products/Starter-Pack-Fortnite.webp' : null) ||
    (product.slug === 'fortnite-final-reckoning-pack' ? '/images/products/fortnite-final-reckoning-pack.webp' : null) ||
    (gameSlug === 'fortnite'
      ? '/images/hero/characters/fortnite-crewpack-october2026.webp'
      : gameSlug === 'call-of-duty'
        ? '/images/products/Molten-Gold-Lightning-King.webp'
        : gameSlug === 'clash-of-clans'
          ? '/images/products/goblin_transparent.webp'
          : gameSlug === 'valorant' || product.slug?.includes('valorant')
            ? '/images/products/Jett-Inspired%20Agent%20with%20Turkish%20375%20VP%20Badge.webp'
            : product.slug.includes('v-bucks') || product.slug.includes('vbucks')
              ? '/images/products/vbucks.webp'
              : LOCAL_CHARACTERS[product.id % LOCAL_CHARACTERS.length])
  );
}

/** Deterministic gradient avatar for users without a photo (same seed as the website's avatars). */
export function seedGradient(seed: number): string {
  const hue = (seed * 47) % 360;
  return `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 50) % 360} 75% 30%))`;
}
