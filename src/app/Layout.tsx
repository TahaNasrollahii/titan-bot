import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';

import { signIn, useSession } from '@/auth/session';
import { routeForStartParam, tg } from '@/lib/telegram';
import { TabBar } from '@/ui/TabBar';

import { LinkAccount } from './gates/LinkAccount';
import { OutsideTelegram } from './gates/OutsideTelegram';
import { PaymentReturn } from './gates/PaymentReturn';
import { SessionError, Splash } from './gates/Status';

export function Layout() {
  const session = useSession();
  const { pathname } = useLocation();

  useEffect(() => {
    if (session.status === 'booting') void signIn();
    // Sign in once per launch; later failures are handled by the API client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (session.status) {
    case 'outside':
      // The payment gateway sends the phone's browser here; everything else belongs inside Telegram.
      return pathname === '/payment/result' ? <PaymentReturn /> : <OutsideTelegram />;
    case 'booting':
      return <Splash />;
    case 'error':
      return <SessionError message={session.message} expired={session.expired} />;
    case 'unlinked':
      return <LinkAccount telegramUser={session.telegramUser} />;
  }

  return (
    <div className="app">
      <Outlet />
      <TabBar />
      <ScrollRestoration />
      <StartParamRedirect />
    </div>
  );
}

/**
 * Opening t.me/<bot>?startapp=order-TN-1 lands on that order instead of the home screen. Telegram keeps the
 * launch parameters across reloads of the webview, so the redirect is remembered per launch session.
 */
const HANDLED_KEY = 'titan.startParamHandled';

function StartParamRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const param = tg.startParam;
    if (!param) return;
    try {
      if (sessionStorage.getItem(HANDLED_KEY) === param) return;
      sessionStorage.setItem(HANDLED_KEY, param);
    } catch {
      /* no storage: worst case the deep link opens again after a reload */
    }
    const route = routeForStartParam(param);
    if (route) navigate(route);
  }, [navigate]);
  return null;
}
