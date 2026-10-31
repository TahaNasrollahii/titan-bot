import { m } from 'motion/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router';

import { haptic, setBackButton } from '@/lib/telegram';

import { TopBar } from './TopBar';

interface Props {
  /** Title in the top bar; omitted on tab roots, which show the brand bar. */
  title?: string;
  /** Show back button; goes back in history, or to ``fallback`` when the screen was opened directly. */
  back?: boolean;
  fallback?: string;
  actions?: ReactNode;
  /** The screen has its own bottom action bar above the tab bar. */
  noTabs?: boolean;
  flush?: boolean;
  children: ReactNode;
}

export function Screen({ title, back, fallback = '/', actions, noTabs, flush, children }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [scrolled, setScrolled] = useState(false);

  const showBack = pathname !== '/' && back !== false ? true : pathname !== '/' || Boolean(back);

  const goBack = useCallback(() => {
    haptic.tap('light');
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [fallback, navigate]);

  useEffect(() => {
    return setBackButton(showBack, goBack);
  }, [showBack, goBack]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // New screens slide in from the reading direction's end (left in RTL); back and tab switches just fade.
  const pushed = navigationType === 'PUSH' && showBack;
  const classes = ['screen', noTabs && 'screen--no-tabs', flush && 'screen--flush'].filter(Boolean).join(' ');

  return (
    <>
      <TopBar title={title} actions={actions} scrolled={scrolled} onBack={showBack ? goBack : undefined} />
      <m.main
        className={classes}
        initial={pushed ? { opacity: 0, x: -28 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
      >
        {children}
      </m.main>
    </>
  );
}
