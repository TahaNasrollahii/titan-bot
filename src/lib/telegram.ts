/**
 * A typed, null-safe layer over Telegram's WebApp bridge (telegram-web-app.js, loaded in index.html).
 * Everything degrades to a no-op outside Telegram so the app can also render in a normal browser.
 */

type Haptic = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type Notify = 'error' | 'success' | 'warning';

interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
}

interface ContactResult {
  status: 'sent' | 'cancelled';
  response?: string;
}

interface WebApp {
  initData: string;
  initDataUnsafe: { user?: WebAppUser; start_param?: string };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  isFullscreen?: boolean;
  safeAreaInset?: Insets;
  contentSafeAreaInset?: Insets;
  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  requestFullscreen?(): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  requestContact(callback?: (shared: boolean, result: ContactResult) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
  shareMessage?(id: string, callback?: (sent: boolean) => void): void;
  onEvent(event: string, handler: () => void): void;
  offEvent(event: string, handler: () => void): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback: {
    impactOccurred(style: Haptic): void;
    notificationOccurred(type: Notify): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: WebApp };
  }
}

export const BRAND_BG = '#4d1720';
export const BRAND_HEADER = '#6a2430';

function webApp(): WebApp | null {
  const app = window.Telegram?.WebApp;
  // The script defines WebApp everywhere; only inside Telegram does it carry signed launch data.
  return app && app.initData ? app : null;
}

export const tg = {
  get available(): boolean {
    return webApp() !== null;
  },
  get initData(): string {
    return webApp()?.initData ?? '';
  },
  get user(): WebAppUser | null {
    return webApp()?.initDataUnsafe.user ?? null;
  },
  get startParam(): string {
    return webApp()?.initDataUnsafe.start_param ?? '';
  },
  get platform(): string {
    return webApp()?.platform ?? 'web';
  },
  atLeast(version: string): boolean {
    return webApp()?.isVersionAtLeast(version) ?? false;
  },
};

/** One-time setup: brand colors, full height, and the full-screen app feel on phones. */
export function bootTelegram(): void {
  const app = webApp();
  if (!app) return;
  app.ready();
  app.expand();
  try {
    app.setHeaderColor(BRAND_HEADER);
    app.setBackgroundColor(BRAND_BG);
    app.setBottomBarColor?.(BRAND_BG);
  } catch {
    /* older clients only accept theme keys */
  }
  if (app.isVersionAtLeast('7.7')) app.disableVerticalSwipes?.();
  const phone = app.platform === 'android' || app.platform === 'ios';
  if (phone && app.isVersionAtLeast('8.0')) {
    try {
      app.requestFullscreen?.();
    } catch {
      /* not supported on this client */
    }
  }
  syncInsets();
  app.onEvent('safeAreaChanged', syncInsets);
  app.onEvent('contentSafeAreaChanged', syncInsets);
  app.onEvent('fullscreenChanged', syncInsets);
  document.documentElement.dataset.platform = app.platform;
}

/** Expose Telegram's safe areas (notch + its own floating controls in full screen) as CSS variables. */
function syncInsets(): void {
  const app = webApp();
  const root = document.documentElement.style;
  const safe = app?.safeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const content = app?.contentSafeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
  root.setProperty('--tg-top', `${safe.top + content.top}px`);
  root.setProperty('--tg-bottom', `${safe.bottom + content.bottom}px`);
}

// ------------------------------------------------------------------ haptics
export const haptic = {
  tap(style: Haptic = 'light') {
    webApp()?.HapticFeedback.impactOccurred(style);
  },
  select() {
    webApp()?.HapticFeedback.selectionChanged();
  },
  success() {
    webApp()?.HapticFeedback.notificationOccurred('success');
  },
  error() {
    webApp()?.HapticFeedback.notificationOccurred('error');
  },
  warning() {
    webApp()?.HapticFeedback.notificationOccurred('warning');
  },
};

// ------------------------------------------------------------------ native controls
export function setBackButton(visible: boolean, onClick: () => void): () => void {
  const app = webApp();
  if (!app) return () => {};
  if (!visible) {
    app.BackButton.hide();
    return () => {};
  }
  app.BackButton.onClick(onClick);
  app.BackButton.show();
  return () => app.BackButton.offClick(onClick);
}

export function setClosingConfirmation(enabled: boolean): void {
  const app = webApp();
  if (!app) return;
  if (enabled) app.enableClosingConfirmation();
  else app.disableClosingConfirmation();
}

/** Open a web page in the phone's browser (payment gateways must not run inside the webview). */
export function openExternal(url: string): void {
  const app = webApp();
  if (app) app.openLink(url, { try_instant_view: false });
  else window.open(url, '_blank', 'noopener,noreferrer');
}

export function openTelegramLink(url: string): void {
  const app = webApp();
  if (app) app.openTelegramLink(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareLink(url: string, text: string): void {
  openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
}

/** Ask for the user's phone number. Resolves the signed result string ('' if Telegram gave none). */
export function requestContact(): Promise<{ shared: boolean; signed: string }> {
  return new Promise(resolve => {
    const app = webApp();
    if (!app) return resolve({ shared: false, signed: '' });
    app.requestContact((shared, result) => resolve({ shared, signed: result?.response ?? '' }));
  });
}

export function requestWriteAccess(): Promise<boolean> {
  return new Promise(resolve => {
    const app = webApp();
    if (!app || !app.isVersionAtLeast('6.9')) return resolve(false);
    app.requestWriteAccess(granted => resolve(granted));
  });
}

export function confirmDialog(message: string): Promise<boolean> {
  return new Promise(resolve => {
    const app = webApp();
    if (!app) return resolve(window.confirm(message));
    app.showConfirm(message, ok => resolve(ok));
  });
}

export function onAppEvent(event: 'activated' | 'deactivated', handler: () => void): () => void {
  const app = webApp();
  if (!app) return () => {};
  app.onEvent(event, handler);
  return () => app.offEvent(event, handler);
}

// ------------------------------------------------------------------ deep links
/**
 * ``startapp`` parameters (t.me/<bot>?startapp=…) → app routes. Only [A-Za-z0-9_-] survive in the
 * parameter, so slugs are passed as-is and order numbers use their own alphabet.
 */
export function routeForStartParam(param: string): string | null {
  const match = /^([a-z]+)-([A-Za-z0-9_-]{1,60})$/.exec(param);
  if (!match) return null;
  const [, kind, value] = match;
  switch (kind) {
    case 'pay':
      return /^\d+$/.test(value) ? `/payments/${value}` : null;
    case 'order':
      return `/orders/${value}`;
    case 'product':
      return `/product/${value}`;
    case 'game':
      return `/store/${value}`;
    case 'tour':
      return `/tournaments/${value}`;
    case 'team':
      return /^\d+$/.test(value) ? `/teams/${value}` : null;
    case 'join':
      return `/join/${value}`;
    default:
      return null;
  }
}
