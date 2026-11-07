# Titan Telegram Mini-App (`titan-bot`) Rules

## Mandatory Website ↔ Telegram Bot Synchronization Rule
1. Every change made to the Titan website (`../titan-front`) — including product descriptions, guides, catalog items, pricing, features, additions, updates, or removals — **MUST be kept in sync in `titan-bot`**, adapted to the Telegram Mini-App's mobile-first UI, haptics (`@/lib/telegram`), and React Router routes (`/product/:slug`, `/store/:game`, `/fortnite-shop`, `/tournaments`, `/guides`, `/support`, `/me/accounts`).
2. Always run `npm run typecheck` before committing and pushing to `origin/main`.
