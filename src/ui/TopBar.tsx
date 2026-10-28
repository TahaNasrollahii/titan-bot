import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { compactToman, faDigits } from '@/lib/format';
import { useUnread, useWallet } from '@/lib/queries';
import { haptic } from '@/lib/telegram';

import { Icon3D } from './Icon3D';

export function TopBar({ title, actions, scrolled }: { title?: string; actions?: ReactNode; scrolled: boolean }) {
  return (
    <header className="topbar" data-scrolled={scrolled}>
      <div className="topbar__inner">
        {title ? <h1 className="topbar__title">{title}</h1> : <Brand />}
        {actions ?? (!title && <BrandActions />)}
      </div>
    </header>
  );
}

function Brand() {
  return (
    <div className="topbar__brand">
      <img src="/titan-logo.webp" alt="تایتان" width={46} height={46} />
    </div>
  );
}

/** The wallet balance in a cream clay pill, then round clay buttons for search and alerts. */
function BrandActions() {
  const wallet = useWallet();
  const unread = useUnread();
  const count = unread.data?.count ?? 0;
  return (
    <>
      <Link to="/wallet" className="wallet-chip num" aria-label="کیف پول" onClick={() => haptic.tap()}>
        <Icon3D name="coin" size={30} />
        {wallet.data ? compactToman(wallet.data.balance) : '…'}
      </Link>
      <Link to="/search" className="icon-btn" aria-label="جستجو" onClick={() => haptic.tap()}>
        <Icon3D name="magnifying-glass-tilted-left" size={24} />
      </Link>
      <Link
        to="/notifications"
        className="icon-btn"
        aria-label={count ? `${count} اعلان خوانده‌نشده` : 'اعلان‌ها'}
        onClick={() => haptic.tap()}
      >
        <Icon3D name="bell" size={26} />
        {count > 0 && <span className="dot-badge">{faDigits(Math.min(count, 99))}</span>}
      </Link>
    </>
  );
}
