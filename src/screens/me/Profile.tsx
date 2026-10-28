import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Pencil, Settings } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { meApi } from '@/api/endpoints';
import { useMe } from '@/auth/session';
import { faDigits, money, num, toman } from '@/lib/format';
import { useUnread, useWallet } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { Icon3D, type Icon3DName } from '@/ui/Icon3D';
import { PlayerCard } from '@/ui/PlayerCard';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import './me.css';

export default function Profile() {
  const me = useMe();
  const stats = useQuery({ queryKey: ['me', 'stats'], queryFn: meApi.stats });
  const wallet = useWallet();
  const unread = useUnread();
  const invitations = useQuery({ queryKey: ['me', 'team-invitations'], queryFn: meApi.teamInvitations });
  const pendingInvites = invitations.data?.filter(i => i.status === 'pending').length ?? 0;

  return (
    <Screen
      title="پروفایل"
      back={false}
      actions={
        <Link to="/settings" className="icon-btn" aria-label="تنظیمات" onClick={() => haptic.tap()}>
          <Settings size={20} />
        </Link>
      }
    >
      <PlayerCard user={me}>
        <Link to="/me/edit" className="btn btn--glass btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => haptic.tap()}>
          <Pencil size={14} /> ویرایش پروفایل
        </Link>
      </PlayerCard>

      <section className="section">
        {stats.data ? (
          <div className="stats">
            <Stat value={faDigits(stats.data.tournamentsPlayed)} label="تورنمنت" />
            <Stat value={faDigits(stats.data.wins)} label="برد" />
            <Stat value={`${faDigits(stats.data.winRate)}٪`} label="درصد برد" />
            <Stat value={faDigits(stats.data.tournamentsWon)} label="قهرمانی" />
            <Stat value={num(stats.data.points)} label="امتیاز" />
            <Stat
              value={stats.data.earningsUsd ? money(stats.data.earningsUsd, 'USD') : num(stats.data.earningsIrt)}
              label="درآمد"
            />
          </div>
        ) : (
          <Skeleton h={150} r={20} />
        )}
      </section>

      {me.badges.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            نشان‌ها
          </h2>
          <div className="rail">
            {me.badges.map(b => (
              <div key={b.slug} className="badge-tile">
                <span>{b.icon || '🏅'}</span>
                <strong>{b.name}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section stack" style={{ '--gap': '14px' } as CSSProperties}>
        <div className="list">
          <Row to="/wallet" icon="money-bag" title="کیف پول" sub={wallet.data ? toman(wallet.data.balance) : undefined} />
          <Row to="/orders" icon="package" title="سفارش‌ها" />
          <Row to="/wishlist" icon="red-heart" title="علاقه‌مندی‌ها" />
          <Row to="/me/accounts" icon="video-game" title="اکانت‌های بازی" />
        </div>
        <div className="list">
          <Row to="/tournaments" icon="trophy" title="تورنمنت‌ها" />
          <Row to="/teams" icon="shield" title="تیم‌های من" />
          <Row to="/invitations" icon="envelope-with-arrow" title="دعوت‌نامه‌ها" count={pendingInvites} />
          <Row to="/friends" icon="busts-in-silhouette" title="دوستان" />
        </div>
        <div className="list">
          <Row to="/notifications" icon="bell" title="اعلان‌ها" count={unread.data?.count} />
          <Row to="/support" icon="headphone" title="پشتیبانی آنلاین" />
          <Row to="/settings" icon="gear" title="تنظیمات" />
        </div>
      </section>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <span className="stat__value num">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function Row({ to, icon, title, sub, count }: { to: string; icon: Icon3DName; title: string; sub?: string; count?: number }) {
  return (
    <Link to={to} className="list-row" onClick={() => haptic.tap()}>
      <span className="list-row__icon">
        <Icon3D name={icon} size={26} />
      </span>
      <div className="list-row__body">
        <div className="list-row__title">{title}</div>
        {sub && <div className="list-row__sub num">{sub}</div>}
      </div>
      {count ? <span className="badge badge--solid num">{faDigits(count)}</span> : null}
      <ChevronLeft size={18} className="list-row__chev" />
    </Link>
  );
}
