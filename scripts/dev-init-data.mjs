#!/usr/bin/env node
/**
 * Local development only: print a URL that opens the Mini App in a normal browser as if Telegram had
 * launched it. Telegram's bridge script reads the launch parameters from the URL hash, and the backend
 * verifies them with the same bot token, so the full sign-in flow runs for real.
 *
 *   TELEGRAM_BOT_TOKEN=123:abc npm run dev:init-data -- --id 777000 --name Taha
 *
 * Without TELEGRAM_BOT_TOKEN in the environment the token is read from ../titan-back/.env.
 */
import { createHmac } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split('--')
    .filter(Boolean)
    .map(part => part.trim().split(/\s+/))
    .map(([key, ...value]) => [key, value.join(' ')]),
);

function tokenFromBackendEnv() {
  const file = resolve(import.meta.dirname, '../../titan-back/.env');
  if (!existsSync(file)) return '';
  const line = readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find(l => l.startsWith('TELEGRAM_BOT_TOKEN='));
  return line ? line.slice('TELEGRAM_BOT_TOKEN='.length).trim() : '';
}

const token = process.env.TELEGRAM_BOT_TOKEN || tokenFromBackendEnv();
if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN (the same value the backend uses).');
  process.exit(1);
}

const user = {
  id: Number(args.id || 777000111),
  first_name: args.name || 'Dev',
  last_name: args.last || 'Tester',
  username: args.username || 'titan_dev',
  language_code: 'fa',
  allows_write_to_pm: true,
};
const fields = {
  auth_date: String(Math.floor(Date.now() / 1000)),
  query_id: 'DEV',
  user: JSON.stringify(user),
  ...(args.start ? { start_param: args.start } : {}),
};

const secret = createHmac('sha256', 'WebAppData').update(token).digest();
const check = Object.keys(fields)
  .sort()
  .map(key => `${key}=${fields[key]}`)
  .join('\n');
const hash = createHmac('sha256', secret).update(check).digest('hex');
const initData = new URLSearchParams({ ...fields, hash }).toString();

const base = args.url || 'http://localhost:5173/';
const hashParams = new URLSearchParams({
  tgWebAppData: initData,
  tgWebAppVersion: '8.0',
  tgWebAppPlatform: 'tdesktop',
  tgWebAppThemeParams: JSON.stringify({ bg_color: '#170409', text_color: '#fdf1f0' }),
});
console.log(`${base}#${hashParams.toString()}`);
