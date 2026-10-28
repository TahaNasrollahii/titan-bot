const trim = (value: string | undefined, fallback: string) => (value || fallback).replace(/\/$/, '');

export const env = {
  apiUrl: trim(import.meta.env.VITE_API_URL, 'http://localhost:8000/api/v1'),
  siteUrl: trim(import.meta.env.VITE_SITE_URL, 'https://titan-front.vercel.app'),
  botUsername: (import.meta.env.VITE_BOT_USERNAME || '').replace(/^@/, ''),
};

/** t.me link that opens the bot's Main Mini App, optionally on a given screen. */
export function miniAppLink(startParam?: string): string {
  const base = `https://t.me/${env.botUsername}`;
  return startParam ? `${base}?startapp=${encodeURIComponent(startParam)}` : `${base}?startapp`;
}
