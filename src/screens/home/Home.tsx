import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { catalogApi, contentApi } from '@/api/endpoints';
import { useMe } from '@/auth/session';
import { haptic } from '@/lib/telegram';
import { GameTile, ProductCard, TournamentCard } from '@/ui/cards';
import { ErrorState } from '@/ui/Empty';
import { Icon3D, type Icon3DName } from '@/ui/Icon3D';
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

  return (
    <Screen>
      <PlayerCard user={me} />

      {home.isError ? (
        <ErrorState error={home.error} onRetry={() => home.refetch()} />
      ) : (
        <>
          <div className="home-hero">
            {home.data ? (
              <HeroCarousel promos={home.data.heroPromos} tournaments={home.data.heroTournaments} games={home.data.categories} />
            ) : (
              <Skeleton h={190} r={32} />
            )}
          </div>

          <nav className="quick" aria-label="دسترسی سریع">
            <Quick to="/orders" icon="package" label="سفارش‌ها" />
            <Quick to="/teams" icon="shield" label="تیم من" />
            <Quick to="/tournaments" icon="trophy" label="مسابقات" />
            <Quick to="/support" icon="headphone" label="پشتیبانی" />
          </nav>

          <Section title="دسته‌بندی‌ها" to="/store">
            <div className="rail rail--tall">
              {home.data
                ? home.data.categories.map(game => <GameTile key={game.slug} game={game} />)
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} w={150} h={184} r={30} style={{ marginTop: 30 }} />)}
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
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} w={158} h={250} r={26} />)}
            </div>
          </Section>

          {home.data && home.data.announcements.length > 0 && (
            <Section title="اطلاعیه‌ها">
              <div className="stack">
                {home.data.announcements.map(a => (
                  <div key={a.id} className="clay announce">
                    <span className="clay announce__icon">
                      <Icon3D name="sparkles" size={26} />
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

function Quick({ to, icon, label }: { to: string; icon: Icon3DName; label: string }) {
  return (
    <Link to={to} className="quick__item" onClick={() => haptic.tap()}>
      <span className="clay quick__icon card--press">
        <Icon3D name={icon} size={40} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
