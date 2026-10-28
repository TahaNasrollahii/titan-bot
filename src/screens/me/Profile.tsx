import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ChevronLeft,
  Gamepad2,
  Headset,
  Heart,
  Mail,
  PackageCheck,
  Pencil,
  Settings,
  Shield,
  Trophy,
  UsersRound,
  Wallet,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';

import { meApi } from '@/api/endpoints';
import { useMe } from '@/auth/session';
import { faDigits, money, num, toman } from '@/lib/format';
import { useUnread, useWallet } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
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
          <Row to="/wallet" icon={<Wallet size={18} />} title="کیف پول" sub={wallet.data ? toman(wallet.data.balance) : undefined} tone="#ffcb5c" />
          <Row to="/orders" icon={<PackageCheck size={18} />} title="سفارش‌ها" tone="#4cc3ff" />
          <Row to="/wishlist" icon={<Heart size={18} />} title="علاقه‌مندی‌ها" tone="#f0645a" />
          <Row to="/me/accounts" icon={<Gamepad2 size={18} />} title="اکانت‌های بازی" tone="#3ddc84" />
        </div>
        <div className="list">
          <Row to="/tournaments" icon={<Trophy size={18} />} title="تورنمنت‌ها" tone="#ffcb5c" />
          <Row to="/teams" icon={<Shield size={18} />} title="تیم‌های من" tone="#a78bfa" />
          <Row to="/invitations" icon={<Mail size={18} />} title="دعوت‌نامه‌ها" count={pendingInvites} tone="#a78bfa" />
          <Row to="/friends" icon={<UsersRound size={18} />} title="دوستان" tone="#4cc3ff" />
        </div>
        <div className="list">
          <Row to="/notifications" icon={<Bell size={18} />} title="اعلان‌ها" count={unread.data?.count} tone="#f0645a" />
          <Row to="/support" icon={<Headset size={18} />} title="پشتیبانی آنلاین" tone="#3ddc84" />
          <Row to="/settings" icon={<Settings size={18} />} title="تنظیمات" tone="#c98d92" />
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

function Row({ to, icon, title, sub, count, tone }: { to: string; icon: ReactNode; title: string; sub?: string; count?: number; tone: string }) {
  return (
    <Link to={to} className="list-row" onClick={() => haptic.tap()}>
      <span className="list-row__icon" style={{ color: tone, background: `color-mix(in srgb, ${tone} 14%, transparent)` }}>
        {icon}
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
