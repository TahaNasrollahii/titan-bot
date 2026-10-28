# Titan Telegram Mini App

مینی‌اپ تلگرام تایتان: فروشگاه، آیتم‌شاپ فورتنایت، کیف پول و پرداخت، تورنمنت‌ها، تیم‌ها، پروفایل و پشتیبانی آنلاین، همه داخل تلگرام.
کاربر هیچ‌وقت با خود ربات چت نمی‌کند؛ ربات فقط اپ را باز می‌کند و اعلان‌ها را می‌فرستد.

**Stack:** Vite · React 19 · TypeScript · TanStack Query · React Router · Motion · Vazirmatn (self-hosted)

```
titan-bot/            ← this app: a static SPA (no server)
titan-back/apps/telegram/  ← sign-in with Telegram, account linking, bot webhook, notification push
```

---

## How it works

| Piece | Where | What it does |
|---|---|---|
| Sign-in | `POST /api/v1/telegram/auth/` | The app sends Telegram's signed `initData`; the backend checks the HMAC with the bot token and returns JWTs. Tokens live **in memory only**: every launch signs in again, nothing is stored in the webview. |
| First launch | `POST /api/v1/telegram/auth/contact/` | The user taps "share phone number" (`requestContact`). The phone is verified by Telegram, so no SMS is needed, and it links to the existing Titan account with the same number (or creates one). The contact also reaches the bot webhook, which serves as a second trusted source. |
| Non-Iranian Telegram number | `POST /api/v1/telegram/auth/code/{request,verify}/` | Fallback: SMS code to the user's Titan number (only for real Telegram users, since `initData` is required). |
| Payments | `X-Titan-Client: telegram` header | Payments started in the app are tagged `channel=telegram`. The gateway opens in the phone's browser, then returns to `/payment/result` of this app, which sends the user back to Telegram (`t.me/<bot>?startapp=pay-<id>`). The app also polls the status by itself. |
| Notifications | `apps/notifications` → signal → `apps/telegram` | Every in-app notification (order delivered, tournament, team invite, support reply…) is also sent as a bot message with a button that opens the right screen. Users can turn it off in Settings. |
| Bot | `POST /api/v1/telegram/webhook/` | Replies to `/start` with an "Open Titan" button, stores shared contacts, tracks block/unblock. Authenticated with `X-Telegram-Bot-Api-Secret-Token`. |

Deep links (`t.me/<bot>?startapp=…`): `product-<slug>`, `game-<slug>`, `tour-<slug>`, `order-<number>`, `team-<id>`, `join-<inviteCode>`, `pay-<paymentId>`.

---

## 1. Create the bot (once)

1. In **@BotFather**: `/newbot` → pick a name and a username (e.g. `TitanGGBot`). Keep the token secret.
2. `/mybots` → your bot → **Bot Settings → Configure Mini App → Enable Mini App** → URL = the deployed address of this app (step 3).
   This makes it the bot's *Main Mini App* (the "Open" button on the bot profile, and `t.me/<bot>?startapp` links).
3. Optional: `/setuserpic` with the Titan logo.

## 2. Backend (titan-back) environment

Add to the backend's Vercel project (or `.env` on the VPS):

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | token from BotFather |
| `TELEGRAM_BOT_USERNAME` | bot username without `@` |
| `TELEGRAM_WEBHOOK_SECRET` | `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `TELEGRAM_MINIAPP_URL` | e.g. `https://titan-bot.vercel.app` (added to CORS automatically) |

Redeploy the backend (migrations run on build), then point the bot at it, once and again whenever a URL changes:

```bash
uv run python manage.py telegram_setup --webhook-url https://<backend-host>/api/v1/telegram/webhook/
```

This sets the webhook (with the secret), the menu button, `/start`, and the bot's Persian descriptions.
On Vercel, run it locally against production settings: `vercel env pull .env.vercel` then `ENV_FILE=.env.vercel uv run python manage.py telegram_setup …`.

## 3. Deploy this app on Vercel

New Vercel project → import the repo → **Root Directory: `titan-bot`** (Vite is detected; `vercel.json` sets security headers, caching and SPA rewrites).

Environment variables (build-time, so redeploy after changing them):

| Variable | Example |
|---|---|
| `VITE_API_URL` | `https://titan-backend-taha.vercel.app/api/v1` |
| `VITE_SITE_URL` | `https://titan-front.vercel.app` |
| `VITE_BOT_USERNAME` | `TitanGGBot` |

The website (`titan-front`) now allows cross-origin reads of `/api/fortnite-shop`, which the app's item shop uses, so deploy the website too.

## Local development

```bash
npm install
cp .env.example .env.local        # point VITE_API_URL at your local backend
npm run dev                       # http://localhost:5173

# Open the app "as if from Telegram" in a normal browser (signed with your dev bot token):
TELEGRAM_BOT_TOKEN=123:dev npm run dev:init-data -- --id 777000 --name Taha
# → prints http://localhost:5173/#tgWebAppData=… ; open it.
```

Run the backend with the same `TELEGRAM_BOT_TOKEN`. Any value works locally (the HMAC just has to match).
To test inside real Telegram, expose the dev server over HTTPS (e.g. `cloudflared tunnel --url http://localhost:5173`) and set that URL in BotFather temporarily.

```bash
npm run typecheck
npm run build      # prebuild refreshes public/telegram-web-app.js from telegram.org (keeps the copy if unreachable)
```

## Moving to a VPS

The build output (`dist/`) is plain static files, so any web server works. Nginx example:

```nginx
server {
  server_name app.titan.example;
  root /var/www/titan-bot/dist;

  add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors https://web.telegram.org https://*.web.telegram.org; object-src 'none'; base-uri 'self'; form-action 'none'" always;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;

  location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
  location = /index.html { add_header Cache-Control "no-cache"; }
  location / { try_files $uri /index.html; }
}
```

Then update `TELEGRAM_MINIAPP_URL` on the backend, the BotFather Mini App URL, and run `telegram_setup` again.
On a VPS the notification push can move to a background worker (Celery/RQ); today it runs right after the request commits, with an 8-way parallel send and a short timeout.

---

## Notes and decisions

- **Telegram's bridge script is served from this app** (`public/telegram-web-app.js`), not from telegram.org. telegram.org is filtered on many Iranian networks the webview uses, even when the Telegram app itself works through a proxy. Every build refreshes it from telegram.org when the build machine can reach it.
- **The website's `/images/…`** used by the catalogue fixes are copied into `public/images`, because the website sends `Cross-Origin-Resource-Policy: same-origin`.
- **Design:** always the Titan dark brand (not the user's Telegram theme), full-screen on phones, Telegram's native back button, haptics, safe areas, bottom sheets, skeletons, and reduced-motion support.
- **Performance:** about 146 KB gzipped of JS on first open (React, router, query, app shell). Motion's animation features (~28 KB) load right after the first paint, every screen is a lazy chunk of a few KB, and all hashed assets are immutable-cached.
