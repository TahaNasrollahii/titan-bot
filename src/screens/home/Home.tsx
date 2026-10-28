import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Headset, Megaphone, PackageCheck, Plus, Search, Shield, Trophy } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';

import { catalogApi, contentApi } from '@/api/endpoints';
import { useMe } from '@/auth/session';
import { toman } from '@/lib/format';
import { useWallet } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { GameTile, ProductCard, TournamentCard } from '@/ui/cards';
import { ErrorState } from '@/ui/Empty';
import { PlayerCard } from '@/ui/PlayerCard';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import { HeroCarousel } from './HeroCarousel';
import './home.css';

export default function Home() {
  const me = useMe();
  const home = useQuery({ queryKey: ['home'], queryFn: contentApi.home });
  const bestsellers = useQuery({
    queryKey: ['products', { ordering: '-popularity', page_size: 10 }],
    queryFn: () => catalogApi.products({ ordering: '-popularity', page_size: 10 }),
  });
  const wallet = useWallet();

  return (
    <Screen>
      <PlayerCard user={me}>
        <div className="home-wallet">
          <div>
            <span className="text-xs muted">موجودی کیف پول</span>
            <strong className="num">{wallet.data ? toman(wallet.data.balance) : '…'}</strong>
          </div>
          <Link to="/wallet?topup=1" className="btn btn--cream btn--sm" onClick={() => haptic.tap()}>
            <Plus size={16} /> شارژ
          </Link>
        </div>
      </PlayerCard>

      <Link to="/search" className="home-search" onClick={() => haptic.tap()}>
        <Search size={18} />
        <span>جستجوی بازی، آیتم یا تورنمنت…</span>
      </Link>

      {home.isError ? (
        <ErrorState error={home.error} onRetry={() => home.refetch()} />
      ) : (
        <>
          <div className="section">
            {home.data ? (
              <HeroCarousel promos={home.data.heroPromos} tournaments={home.data.heroTournaments} />
            ) : (
              <Skeleton h={190} r={24} />
            )}
          </div>

          <nav className="quick" aria-label="دسترسی سریع">
            <Quick to="/orders" icon={<PackageCheck size={22} />} label="سفارش‌ها" hue="#4cc3ff" />
            <Quick to="/teams" icon={<Shield size={22} />} label="تیم من" hue="#7a50e6" />
            <Quick to="/tournaments" icon={<Trophy size={22} />} label="مسابقات" hue="#ffcb5c" />
            <Quick to="/support" icon={<Headset size={22} />} label="پشتیبانی" hue="#3ddc84" />
          </nav>

          <Section title="بازی‌ها" to="/store">
            <div className="rail">
              {home.data
                ? home.data.categories.map(game => <GameTile key={game.slug} game={game} />)
                : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} w={132} h={172} r={22} />)}
            </div>
          </Section>

          {home.data && home.data.heroTournaments.length > 0 && (
            <Section title="تورنمنت‌های داغ" to="/tournaments">
              <div className="rail">
                {home.data.heroTournaments.map(t => (
                  <TournamentCard key={t.id} t={t} compact />
                ))}
              </div>
            </Section>
          )}

          <Section title="پرفروش‌ها" to="/store">
            <div className="rail">
              {bestsellers.data
                ? bestsellers.data.results.map(p => <ProductCard key={p.id} product={p} />)
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} w={156} h={240} r={22} />)}
            </div>
          </Section>

          {home.data && home.data.announcements.length > 0 && (
            <Section title="اطلاعیه‌ها">
              <div className="stack">
                {home.data.announcements.map(a => (
                  <div key={a.id} className="announce">
                    <span className="announce__icon">
                      <Megaphone size={18} />
                    </span>
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </Screen>
  );
}

function Section({ title, to, children }: { title: string; to?: string; children: ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {to && (
          <Link to={to} className="section-link">
            همه <ChevronLeft size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Quick({ to, icon, label, hue }: { to: string; icon: ReactNode; label: string; hue: string }) {
  return (
    <Link to={to} className="quick__item card--press" style={{ '--hue': hue } as CSSProperties} onClick={() => haptic.tap()}>
      <span className="quick__icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
