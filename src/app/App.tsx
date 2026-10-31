import { QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, MotionConfig } from 'motion/react';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';

import { queryClient } from '@/lib/queries';
import { Toaster } from '@/ui/Toast';

import { Layout } from './Layout';
import { RouteError } from './RouteError';

type ScreenModule = { default: React.ComponentType };
const screen = (load: () => Promise<ScreenModule>) => async () => ({ Component: (await load()).default });

const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: screen(() => import('@/screens/home/Home')) },
      // store
      { path: 'store', lazy: screen(() => import('@/screens/store/Store')) },
      { path: 'store/:game', lazy: screen(() => import('@/screens/store/GameStore')) },
      { path: 'product/:slug', lazy: screen(() => import('@/screens/store/Product')) },
      { path: 'fortnite-shop', lazy: screen(() => import('@/screens/store/FortniteShop')) },
      { path: 'search', lazy: screen(() => import('@/screens/store/Search')) },
      { path: 'wishlist', lazy: screen(() => import('@/screens/store/Wishlist')) },
      { path: 'cart', lazy: screen(() => import('@/screens/checkout/Cart')) },
      { path: 'checkout', lazy: screen(() => import('@/screens/checkout/Checkout')) },
      { path: 'orders', lazy: screen(() => import('@/screens/checkout/Orders')) },
      { path: 'orders/:number', lazy: screen(() => import('@/screens/checkout/Order')) },
      { path: 'wallet', lazy: screen(() => import('@/screens/wallet/Wallet')) },
      { path: 'payments/:id', lazy: screen(() => import('@/screens/wallet/PaymentStatus')) },
      { path: 'payment/result', lazy: screen(() => import('@/screens/wallet/PaymentStatus')) },
      // esports
      { path: 'tournaments', lazy: screen(() => import('@/screens/tournaments/Tournaments')) },
      { path: 'tournaments/:slug', lazy: screen(() => import('@/screens/tournaments/Tournament')) },
      { path: 'teams', lazy: screen(() => import('@/screens/teams/Teams')) },
      { path: 'teams/new', lazy: screen(() => import('@/screens/teams/CreateTeam')) },
      { path: 'teams/:id', lazy: screen(() => import('@/screens/teams/Team')) },
      { path: 'join/:code', lazy: screen(() => import('@/screens/teams/JoinTeam')) },
      { path: 'invitations', lazy: screen(() => import('@/screens/teams/Invitations')) },
      // guides
      { path: 'guides', lazy: screen(() => import('@/screens/guides/Guides')) },
      { path: 'guides/:slug', lazy: screen(() => import('@/screens/guides/Guide')) },
      // me
      { path: 'me', lazy: screen(() => import('@/screens/me/Profile')) },
      { path: 'me/edit', lazy: screen(() => import('@/screens/me/EditProfile')) },
      { path: 'me/accounts', lazy: screen(() => import('@/screens/me/GameAccounts')) },
      { path: 'friends', lazy: screen(() => import('@/screens/me/Friends')) },
      { path: 'notifications', lazy: screen(() => import('@/screens/me/Notifications')) },
      { path: 'settings', lazy: screen(() => import('@/screens/me/Settings')) },
      { path: 'support', lazy: screen(() => import('@/screens/support/Support')) },
      { path: '*', lazy: screen(() => import('@/screens/NotFound')) },
    ],
  },
];

const router = createBrowserRouter(routes);
const motionFeatures = () => import('./motionFeatures').then(module => module.default);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={motionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
          <Toaster />
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  );
}
