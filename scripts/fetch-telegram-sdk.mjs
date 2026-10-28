#!/usr/bin/env node
/**
 * Refresh public/telegram-web-app.js from telegram.org before each build.
 *
 * The app serves Telegram's bridge from its own origin because telegram.org is unreachable on many
 * networks in Iran, even for users whose Telegram app works through a proxy. Build machines (Vercel) can
 * reach it, so every deploy ships the current version. When the download fails, the committed copy stays.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCE = 'https://telegram.org/js/telegram-web-app.js';
const target = resolve(import.meta.dirname, '../public/telegram-web-app.js');

try {
  const response = await fetch(SOURCE, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const code = await response.text();
  // Sanity check: never replace a working bridge with an error page.
  if (!code.includes('Telegram') || !code.includes('WebApp') || code.length < 20_000) throw new Error('unexpected content');
  const current = readFileSync(target, 'utf8');
  if (current === code) console.log('telegram-web-app.js is up to date');
  else {
    writeFileSync(target, code);
    console.log(`telegram-web-app.js refreshed (${code.length} bytes)`);
  }
} catch (error) {
  console.warn(`Could not refresh telegram-web-app.js (${error.message}); keeping the committed copy.`);
}
