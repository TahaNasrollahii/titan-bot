import { m } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useNavigationType } from 'react-router';

import { setBackButton } from '@/lib/telegram';

import { TopBar } from './TopBar';

interface Props {
  /** Title in the top bar; omitted on tab roots, which show the brand bar. */
  title?: string;
  /** Show Telegram's native back button; goes back, or to ``fallback`` when the screen was opened directly. */
  back?: boolean;
  fallback?: string;
  actions?: ReactNode;
  /** The screen has no tab bar under it (detail pages with their own bottom action). */
  noTabs?: boolean;
  flush?: boolean;
  children: ReactNode;
}

export function Screen({ title, back = Boolean(title), fallback = '/', actions, noTabs, flush, children }: Props) {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const goBack = () => {
      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
      if (idx > 0) navigate(-1);
      else navigate(fallback, { replace: true });
    };
    return setBackButton(back, goBack);
  }, [back, fallback, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // New screens slide in from the reading direction's end (left in RTL); back and tab switches just fade.
  const pushed = navigationType === 'PUSH' && back;
  const classes = ['screen', noTabs && 'screen--no-tabs', flush && 'screen--flush'].filter(Boolean).join(' ');

  return (
    <>
      <TopBar title={title} actions={actions} scrolled={scrolled} />
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
