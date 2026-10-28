import { Bell, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { compactToman, faDigits } from '@/lib/format';
import { useUnread, useWallet } from '@/lib/queries';

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
      <img src="/titan-logo.webp" alt="" width={34} height={34} />
      <span>TITAN</span>
    </div>
  );
}

function BrandActions() {
  const wallet = useWallet();
  const unread = useUnread();
  const count = unread.data?.count ?? 0;
  return (
    <>
      <Link to="/wallet" className="wallet-chip" aria-label="کیف پول">
        <span className="wallet-chip__icon">
          <Wallet size={14} />
        </span>
        <span className="num">{wallet.data ? compactToman(wallet.data.balance) : '…'}</span>
      </Link>
      <Link to="/notifications" className="icon-btn" aria-label={count ? `${count} اعلان خوانده‌نشده` : 'اعلان‌ها'}>
        <Bell size={20} />
        {count > 0 && <span className="dot-badge">{faDigits(Math.min(count, 99))}</span>}
      </Link>
    </>
  );
}
