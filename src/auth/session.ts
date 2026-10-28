import { useSyncExternalStore } from 'react';

import { ApiError, onReauthenticate, setTokens } from '@/api/client';
import { telegramApi, type TelegramAccount, type TelegramSignIn, type TelegramUser } from '@/api/endpoints';
import type { Me } from '@/api/types';
import { tg } from '@/lib/telegram';

export type SessionState =
  | { status: 'outside' }
  | { status: 'booting' }
  | { status: 'unlinked'; telegramUser: TelegramUser }
  | { status: 'ready'; user: Me; telegram: TelegramAccount; isNewUser: boolean }
  | { status: 'error'; message: string; expired: boolean };

let state: SessionState = tg.available ? { status: 'booting' } : { status: 'outside' };
const listeners = new Set<() => void>();

function set(next: SessionState) {
  state = next;
  listeners.forEach(listener => listener());
}

export const session = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(session.subscribe, session.get);
}

/** The signed-in user; only call below the gate that guarantees a ready session. */
export function useMe(): Me {
  const current = useSession();
  if (current.status !== 'ready') throw new Error('useMe() outside a signed-in session');
  return current.user;
}

export function apply(result: TelegramSignIn): void {
  if (!result.linked) {
    setTokens(null);
    set({ status: 'unlinked', telegramUser: result.telegramUser });
    return;
  }
  setTokens({ access: result.access, refresh: result.refresh });
  set({ status: 'ready', user: result.user, telegram: result.telegram, isNewUser: result.isNewUser });
}

export function updateUser(user: Me): void {
  if (state.status === 'ready') set({ ...state, user });
}

export function updateTelegram(telegram: TelegramAccount): void {
  if (state.status === 'ready') set({ ...state, telegram });
}

export function markUnlinked(): void {
  setTokens(null);
  const user = tg.user;
  set({
    status: 'unlinked',
    telegramUser: {
      id: user?.id ?? 0,
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      username: user?.username ?? '',
      photoUrl: user?.photo_url ?? '',
    },
  });
}

/** Trade the launch data Telegram signed for a session. */
export async function signIn(): Promise<void> {
  if (!tg.available) return set({ status: 'outside' });
  set({ status: 'booting' });
  try {
    apply(await telegramApi.signIn(tg.initData));
  } catch (error) {
    const expired = error instanceof ApiError && error.code === 'telegram_init_data_expired';
    set({
      status: 'error',
      expired,
      message: error instanceof ApiError ? error.text : 'اتصال به تایتان برقرار نشد.',
    });
  }
}

// Long sessions outlive both tokens: sign in again silently with the (still valid) launch data.
onReauthenticate(async () => {
  try {
    const result = await telegramApi.signIn(tg.initData);
    apply(result);
    return result.linked;
  } catch {
    return false;
  }
});
