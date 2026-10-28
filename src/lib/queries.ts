import { QueryClient, focusManager, useQuery, type QueryKey } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { cartApi, notificationsApi, walletApi } from '@/api/endpoints';

import { onAppEvent } from './telegram';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
    },
    mutations: { retry: false },
  },
});

// Telegram tells us when the app comes back to the foreground (e.g. after paying in the browser).
focusManager.setEventListener(handleFocus => {
  const offActive = onAppEvent('activated', () => handleFocus(true));
  const offInactive = onAppEvent('deactivated', () => handleFocus(false));
  const onVisibility = () => handleFocus(document.visibilityState === 'visible');
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    offActive();
    offInactive();
    document.removeEventListener('visibilitychange', onVisibility);
  };
});

export const keys = {
  cart: ['cart'] as QueryKey,
  wallet: ['wallet'] as QueryKey,
  unread: ['notifications', 'unread'] as QueryKey,
};

export const useCart = () => useQuery({ queryKey: keys.cart, queryFn: cartApi.get });
export const useWallet = () => useQuery({ queryKey: keys.wallet, queryFn: walletApi.get });
export const useUnread = () =>
  useQuery({ queryKey: keys.unread, queryFn: notificationsApi.unreadCount, refetchInterval: 60_000 });
