import { useQuery } from '@tanstack/react-query';
import { useState, type CSSProperties } from 'react';
import { useParams } from 'react-router';

import { catalogApi, tournamentsApi } from '@/api/endpoints';
import { haptic } from '@/lib/telegram';
import { TournamentCard } from '@/ui/cards';
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

  return (
    <Screen title={game?.title ?? 'فروشگاه'} fallback="/store">
      <header className="game-hero" style={{ '--accent': game?.accentColor ?? '#e2453f' } as CSSProperties}>
        <Img className="game-hero__bg" src={game?.backgroundImage || game?.coverImage} alt="" priority />
        {game?.characterImage && <Img className="game-hero__char" src={game.characterImage} alt="" contain priority />}
        <div className="game-hero__info">
          <span className="game-hero__en ltr">{game?.titleEn}</span>
          <h1>{game?.title}</h1>
          {game?.genre && <span className="badge">{game.genre}</span>}
          {game?.introText && <p>{game.introText}</p>}
        </div>
      </header>

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
          <h2 className="section-title">محصولات</h2>
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
