import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { catalogApi } from '@/api/endpoints';
import { haptic } from '@/lib/telegram';
import { GameTile } from '@/ui/cards';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import { ProductGrid } from './ProductGrid';
import './store.css';

export const SORTS = [
  { value: '-popularity', label: 'پرطرفدار' },
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'price', label: 'ارزان‌ترین' },
  { value: '-price', label: 'گران‌ترین' },
  { value: '-rating_avg', label: 'بهترین امتیاز' },
];

export default function Store() {
  const games = useQuery({ queryKey: ['games'], queryFn: catalogApi.games, staleTime: 5 * 60_000 });
  const [ordering, setOrdering] = useState('-popularity');

  return (
    <Screen>
      <Link to="/fortnite-shop" className="fn-banner card--press" onClick={() => haptic.tap('medium')}>
        <div className="fn-banner__glow" aria-hidden />
        <div className="fn-banner__text">
          <span className="clay clay--cream fn-banner__badge">
            <Icon3D name="sparkles" size={14} /> هر روز تازه
          </span>
          <strong>آیتم‌شاپ امروز فورتنایت</strong>
          <span>اسکین‌ها و باندل‌های امروز را ببین و وی‌باکس بخر</span>
        </div>
        <Icon3D name="video-game" size={58} className="fn-banner__art" />
        <ChevronLeft size={22} />
      </Link>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">بازی‌ها</h2>
        </div>
        <div className="games-grid">
          {games.data
            ? games.data.map(game => <GameTile key={game.slug} game={game} size="lg" />)
            : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={150} r={22} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">همه محصولات</h2>
        </div>
        <div className="rail chips-rail" role="tablist" aria-label="مرتب‌سازی">
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
        <ProductGrid query={{ ordering }} />
      </section>
    </Screen>
  );
}
