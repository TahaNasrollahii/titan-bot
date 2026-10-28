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
            <Stat icon="joystick" tone="91 140 255" value={faDigits(stats.data.tournamentsPlayed)} label="تورنمنت" />
            <Stat icon="crossed-swords" tone="255 110 90" value={faDigits(stats.data.wins)} label="برد" />
            <Stat icon="hundred-points" tone="47 210 122" value={`${faDigits(stats.data.winRate)}٪`} label="درصد برد" />
            <Stat icon="trophy" tone="255 196 75" value={faDigits(stats.data.tournamentsWon)} label="قهرمانی" />
            <Stat icon="glowing-star" tone="196 160 255" value={num(stats.data.points)} label="امتیاز" />
            <Stat
              icon="money-bag"
              tone="56 200 232"
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
          <Row
            to="/wallet"
            icon="/icons/dashboard.webp"
            tone="255 196 75"
            title="کیف پول"
            sub={wallet.data ? toman(wallet.data.balance) : undefined}
          />
          <Row to="/orders" icon="/icons/cart.webp" tone="255 146 64" title="سفارش‌ها" />
          <Row to="/wishlist" icon="/icons/favorite.webp" tone="255 92 138" title="علاقه‌مندی‌ها" />
          <Row to="/me/accounts" icon="/icons/accounts.webp" tone="56 200 232" title="اکانت‌های بازی" />
        </div>
        <div className="list">
          <Row to="/tournaments" icon="/icons/tournament.webp" tone="240 193 75" title="تورنمنت‌ها" />
          <Row to="/teams" icon="/icons/team.webp" tone="91 140 255" title="تیم‌های من" />
          <Row to="/invitations" icon="/icons/email.webp" tone="45 212 191" title="دعوت‌نامه‌ها" count={pendingInvites} />
          <Row to="/friends" icon="/icons/account.webp" tone="139 124 255" title="دوستان" />
        </div>
        <div className="list">
          <Row to="/notifications" icon="/icons/notif.webp" tone="47 210 122" title="اعلان‌ها" count={unread.data?.count} />
          <Row to="/support" icon="/icons/support.svg" tone="226 69 63" title="پشتیبانی آنلاین" />
          <Row to="/settings" icon="/icons/about-us.webp" tone="196 160 255" title="تنظیمات" />
        </div>
      </section>
    </Screen>
  );
}

function Stat({ icon, tone, value, label }: { icon: Icon3DName; tone: string; value: string; label: string }) {
  return (
    <div className="stat" style={{ '--tone': tone } as CSSProperties}>
      <span className="tone-icon stat__icon">
        <Icon3D name={icon} size={22} />
      </span>
      <span className="stat__value num">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function Row({
  to,
  icon,
  tone,
  title,
  sub,
  count,
}: {
  to: string;
  icon: string;
  tone: string;
  title: string;
  sub?: string;
  count?: number;
}) {
  return (
    <Link to={to} className="list-row" onClick={() => haptic.tap()}>
      <span className="tone-icon list-row__icon" style={{ '--tone': tone } as CSSProperties}>
        <img src={icon} alt="" width={21} height={21} draggable={false} />
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
