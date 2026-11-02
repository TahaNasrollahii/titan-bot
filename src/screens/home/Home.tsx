import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
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

const FEATURED_GUIDES: {
  to: string;
  badge: string;
  title: string;
  sub: string;
  icon: Icon3DName;
  tone: string;
}[] = [
  {
    to: '/guides/how-to-buy',
    badge: 'خرید و تحویل',
    title: 'آموزش خرید و فعال‌سازی محصولات',
    sub: 'مراحل سفارش، ثبت اکانت بازی و تحویل فوری',
    icon: 'shopping-bags',
    tone: '226 69 63',
  },
  {
    to: '/guides/tournament-registration',
    badge: 'مسابقات',
    title: 'چطور در مسابقات شرکت کنم؟',
    sub: 'ثبت‌نام انفرادی و تیمی، قوانین براکت و جوایز',
    icon: 'trophy',
    tone: '240 193 75',
  },
  {
    to: '/guides/ranks',
    badge: 'رنک‌بندی سایت',
    title: 'آموزش کامل رنک‌ها و امتیازات تایتان',
    sub: '۵ سطح از برنز تا تایتان، نحوه کسب امتیاز و XP',
    icon: 'crown',
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
            <Quick to="/orders" sticker="package" tone="255 146 64" label="سفارش‌ها" />
            <Quick to="/teams" sticker="busts-in-silhouette" tone="91 140 255" label="تیم من" />
            <Quick to="/tournaments" sticker="trophy" tone="240 193 75" label="مسابقات" />
            <Quick to="/guides" sticker="bookmark" tone="157 111 255" label="آموزش‌ها" />
            <Quick to="/support" sticker="headphone" tone="226 69 63" label="پشتیبانی" />
          </nav>

          <Link to="/fortnite-shop" className="home-fn clay card--press" onClick={() => haptic.tap('medium')}>
            <span className="home-fn__spark home-fn__spark--a" aria-hidden>
              <Icon3D name="sparkles" size={22} />
            </span>
            <span className="home-fn__spark home-fn__spark--b" aria-hidden>
              <Icon3D name="crown" size={20} />
            </span>
            <img className="home-fn__art" src="/images/hero/characters/fortnite.webp" alt="" draggable={false} />
            <div className="home-fn__body">
              <span className="badge badge--cream">
                <Icon3D name="fire" size={14} />
                آپدیت زنده امروز
              </span>
              <strong>آیتم‌شاپ روزانه فورتنایت</strong>
              <p>اسکین‌ها، باندل‌ها و ایموت‌های امروز با پرداخت ریالی</p>
            </div>
            <ChevronLeft size={20} className="home-fn__chev" />
          </Link>

          <Section title="دسته‌بندی‌ها" sticker="joystick" to="/store">
            <div className="rail rail--tall">
              {home.data
                ? home.data.categories.map(game => <GameTile key={game.slug} game={game} />)
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} w={150} h={184} r={30} style={{ marginTop: 30 }} />)}
            </div>
          </Section>

          {home.data && home.data.heroTournaments.length > 0 && (
            <Section title="تورنمنت‌های داغ" sticker="trophy" to="/tournaments">
              <div className="rail">
                {home.data.heroTournaments.map(t => (
                  <TournamentCard key={t.id} t={t} compact />
                ))}
              </div>
            </Section>
          )}

          <Section title="پرفروش‌ها" sticker="fire" to="/store">
            <div className="rail rail--products">
              {bestsellers.data
                ? bestsellers.data.results.map(p => <ProductCard key={p.id} product={p} />)
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} w={172} h={284} r={24} />)}
            </div>
          </Section>

          <Section title="آموزش‌ها و راهنما" sticker="bookmark" to="/guides">
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
                    <Icon3D name={item.icon} size={28} />
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
            <Section title="اطلاعیه‌ها" sticker="bell">
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

function Section({
  title,
  sticker,
  to,
  children,
}: {
  title: string;
  sticker?: Icon3DName;
  to?: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">
          {sticker && <Icon3D name={sticker} size={22} />}
          {title}
        </h2>
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

function Quick({
  to,
  sticker,
  tone,
  label,
}: {
  to: string;
  sticker: Icon3DName;
  tone: string;
  label: string;
}) {
  return (
    <Link to={to} className="quick__item" onClick={() => haptic.tap()}>
      <span className="tone-icon quick__icon card--press" style={{ '--tone': tone } as CSSProperties}>
        <Icon3D name={sticker} size={34} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
