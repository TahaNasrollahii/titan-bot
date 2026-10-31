import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';

import { catalogApi, contentApi } from '@/api/endpoints';
import { useMe } from '@/auth/session';
import { haptic } from '@/lib/telegram';
import { GameTile, ProductCard, TournamentCard } from '@/ui/cards';
import { ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { PlayerCard } from '@/ui/PlayerCard';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import { HeroCarousel } from './HeroCarousel';
import './home.css';

const FEATURED_GUIDES = [
  {
    to: '/guides/how-to-buy',
    badge: 'خرید و تحویل',
    title: 'آموزش خرید و فعال‌سازی محصولات',
    sub: 'مراحل سفارش، ثبت اکانت بازی و تحویل فوری',
    icon: '/icons/store.webp',
    tone: '226 69 63',
  },
  {
    to: '/guides/tournament-registration',
    badge: 'مسابقات',
    title: 'چطور در مسابقات شرکت کنم؟',
    sub: 'ثبت‌نام انفرادی و تیمی، قوانین براکت و جوایز',
    icon: '/icons/tournament.webp',
    tone: '240 193 75',
  },
  {
    to: '/guides/ranks',
    badge: 'رنک‌بندی سایت',
    title: 'آموزش کامل رنک‌ها و امتیازات تایتان',
    sub: '۵ سطح از برنز تا تایتان، نحوه کسب امتیاز و XP',
    icon: '/icons/guides.svg',
    tone: '157 111 255',
  },
];

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
            <Quick to="/orders" icon="/icons/cart.webp" tone="255 146 64" label="سفارش‌ها" />
            <Quick to="/teams" icon="/icons/team.webp" tone="91 140 255" label="تیم من" />
            <Quick to="/tournaments" icon="/icons/tournament.webp" tone="240 193 75" label="مسابقات" />
            <Quick to="/guides" icon="/icons/guides.svg" tone="157 111 255" label="آموزش‌ها" />
            <Quick to="/support" icon="/icons/support.svg" tone="226 69 63" label="پشتیبانی" />
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
            <div className="rail rail--products">
              {bestsellers.data
                ? bestsellers.data.results.map(p => <ProductCard key={p.id} product={p} />)
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} w={172} h={284} r={24} />)}
            </div>
          </Section>

          <Section title="آموزش‌ها و راهنما" to="/guides">
            <div className="stack">
              {FEATURED_GUIDES.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="home-guide clay card--press"
                  style={{ '--tone': item.tone } as CSSProperties}
                  onClick={() => haptic.tap()}
                >
                  <span className="tone-icon home-guide__icon">
                    <img src={item.icon} alt="" width={23} height={23} draggable={false} />
                  </span>
                  <div className="home-guide__body">
                    <span className="home-guide__badge">{item.badge}</span>
                    <strong>{item.title}</strong>
                    <p>{item.sub}</p>
                  </div>
                  <ChevronLeft size={18} className="list-row__chev" />
                </Link>
              ))}
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

function Quick({ to, icon, tone, label }: { to: string; icon: string; tone: string; label: string }) {
  return (
    <Link to={to} className="quick__item" onClick={() => haptic.tap()}>
      <span className="tone-icon quick__icon card--press" style={{ '--tone': tone } as CSSProperties}>
        <img src={icon} alt="" width={26} height={26} draggable={false} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
