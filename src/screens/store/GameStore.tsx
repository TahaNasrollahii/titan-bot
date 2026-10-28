import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router';

import { catalogApi, tournamentsApi } from '@/api/endpoints';
import { faDigits } from '@/lib/format';
import { gameBackground, gameCharacter, gameIcon, gameLogo } from '@/lib/media';
import { haptic } from '@/lib/telegram';
import { GAME_ACCENTS, TournamentCard } from '@/ui/cards';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';

import { ProductGrid } from './ProductGrid';
import { SORTS } from './Store';
import './store.css';

export default function GameStore() {
  const { game: slug = '' } = useParams();
  const games = useQuery({ queryKey: ['games'], queryFn: catalogApi.games, staleTime: 5 * 60_000 });
  const game = games.data?.find(g => g.slug === slug);
  const tournaments = useQuery({
    queryKey: ['tournaments', { game: slug, status: ['registration_open', 'live', 'upcoming'] }],
    queryFn: () => tournamentsApi.list({ game: slug, status: ['registration_open', 'live', 'upcoming'], page_size: 6 }),
  });
  const [ordering, setOrdering] = useState('-popularity');

  const accentColor = game?.accentColor || GAME_ACCENTS[slug] || '#e2453f';
  const bgSrc = gameBackground(slug, game?.backgroundImage || game?.coverImage);
  const charSrc = gameCharacter(slug, game?.characterImage);
  const iconSrc = gameIcon(slug, game?.iconImage);
  const logoSrc = gameLogo(slug, game?.logoImage);

  return (
    <Screen title={game?.title ?? 'فروشگاه'} fallback="/store">
      <header className="game-hero" style={{ '--accent': accentColor } as CSSProperties}>
        <div className="game-hero__card">
          {bgSrc && <Img className="game-hero__bg" src={bgSrc} alt="" priority />}
          <div className="game-hero__shade" aria-hidden />
          <div className="game-hero__glow" aria-hidden />
          <div className="game-hero__shine" aria-hidden />

          <div className="game-hero__content">
            <div className="game-hero__eyebrow">
              {iconSrc && (
                <span className="game-hero__icon">
                  <Img src={iconSrc} alt="" contain />
                </span>
              )}
              <span className="game-hero__en ltr">{game?.titleEn || slug.toUpperCase()}</span>
              {game?.genre && <span className="game-hero__genre">{game.genre}</span>}
            </div>

            <div className="game-hero__title-row">
              <h1>{game?.title ?? 'فروشگاه بازی'}</h1>
              {logoSrc && <Img className="game-hero__logo" src={logoSrc} alt="" contain />}
            </div>

            <div className="game-hero__pills">
              {Boolean(game?.productCount) && (
                <span className="game-hero__pill num">
                  <span className="game-hero__dot" />
                  {faDigits(game!.productCount)} محصول
                </span>
              )}
              <span className="game-hero__pill">
                <Zap size={12} />
                تحویل آنی
              </span>
              <span className="game-hero__pill">
                <ShieldCheck size={12} />
                ضمانت اصالت
              </span>
            </div>

            {slug === 'fortnite' && (
              <Link to="/fortnite-shop" className="game-hero__cta" onClick={() => haptic.tap()}>
                <Sparkles size={14} />
                <span>آیتم‌شاپ زنده امروز</span>
                <ChevronLeft size={14} />
              </Link>
            )}
          </div>
        </div>

        {charSrc && <Img className="game-hero__char" src={charSrc} alt={game?.title ?? ''} contain priority />}
      </header>

      {games.data && games.data.length > 1 && (
        <nav className="rail game-switcher" aria-label="انتخاب بازی">
          {games.data.map(g => {
            const active = g.slug === slug;
            const gIcon = gameIcon(g.slug, g.iconImage);
            const gAccent = g.accentColor || GAME_ACCENTS[g.slug] || '#e2453f';
            return (
              <Link
                key={g.slug}
                to={`/store/${g.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`game-switch ${active ? 'is-active' : ''}`}
                style={{ '--accent': gAccent } as CSSProperties}
                onClick={() => haptic.select()}
              >
                {gIcon && <Img className="game-switch__icon" src={gIcon} alt="" contain />}
                <span>{g.title}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {tournaments.data && tournaments.data.results.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">تورنمنت‌های {game?.title}</h2>
          </div>
          <div className="rail">
            {tournaments.data.results.map(t => (
              <TournamentCard key={t.id} t={t} compact />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">محصولات {game?.title}</h2>
          {Boolean(game?.productCount) && <span className="section-count num">{faDigits(game!.productCount)} آیتم</span>}
        </div>
        <div className="rail chips-rail">
          {SORTS.map(sort => (
            <button
              key={sort.value}
              className="chip"
              aria-pressed={ordering === sort.value}
              onClick={() => {
                haptic.select();
                setOrdering(sort.value);
              }}
            >
              {sort.label}
            </button>
          ))}
        </div>
        <ProductGrid query={{ game: slug, ordering }} />
      </section>
    </Screen>
  );
}
