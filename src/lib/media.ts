import { env } from './env';

const apiOrigin = new URL(env.apiUrl).origin;

/** Absolute URL for an image from the API: blob/CDN URLs pass through and uploads come from the API host.
 * The few website images the catalogue fixes refer to (/images/…) ship with this app, because the website
 * forbids cross-origin use of its files (Cross-Origin-Resource-Policy: same-origin). */
export function media(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith('/media/')) return `${apiOrigin}${src}`;
  if (src.startsWith('/images/')) return src;
  return `${env.siteUrl}${src.startsWith('/') ? '' : '/'}${src}`;
}

/** Deterministic gradient avatar for users without a photo (same seed as the website's avatars). */
export function seedGradient(seed: number): string {
  const hue = (seed * 47) % 360;
  return `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 50) % 360} 75% 30%))`;
}
