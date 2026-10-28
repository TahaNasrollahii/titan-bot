import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { contentApi } from '@/api/endpoints';
import { haptic } from '@/lib/telegram';
import { ProductCard, StatusBadge } from '@/ui/cards';
import { Empty, ErrorState } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { SkeletonList } from '@/ui/Skeleton';

import './store.css';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const q = useDeferredValue(text.trim());
  const [debounced, setDebounced] = useState(q);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(q);
      setParams(q ? { q } : {}, { replace: true });
    }, 280);
    return () => clearTimeout(timer);
  }, [q, setParams]);

  useEffect(() => input.current?.focus(), []);

  const results = useQuery({
    queryKey: ['search', debounced],
    queryFn: ({ signal }) => contentApi.search(debounced, signal),
    enabled: debounced.length >= 2,
    placeholderData: previous => previous,
  });
  const data = results.data;
  const empty = data && !data.games.length && !data.products.length && !data.tournaments.length;

  return (
    <Screen title="جستجو" fallback="/store">
      <div className="search-box">
        <SearchIcon size={18} />
        <input
          ref={input}
          type="search"
          enterKeyHint="search"
          placeholder="بازی، آیتم یا تورنمنت…"
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="عبارت جستجو"
        />
        {text && (
          <button onClick={() => setText('')} aria-label="پاک کردن">
            <X size={16} />
          </button>
        )}
      </div>

      {debounced.length < 2 ? (
        <Empty icon={<Icon3D name="magnifying-glass-tilted-left" size={52} />} title="دنبال چه می‌گردی؟" text="حداقل دو حرف بنویس؛ مثلاً «وی باکس» یا «ولورنت»." />
      ) : results.isError ? (
        <ErrorState error={results.error} onRetry={() => results.refetch()} />
      ) : !data ? (
        <div className="section">
          <SkeletonList count={4} />
        </div>
      ) : empty ? (
        <Empty icon={<Icon3D name="cross-mark" size={52} />} title="چیزی پیدا نشد" text={`برای «${debounced}» نتیجه‌ای نداریم.`} />
      ) : (
        <div style={{ opacity: results.isFetching ? 0.6 : 1, transition: 'opacity .2s' }}>
          {data.games.length > 0 && (
            <section className="section">
              <h2 className="section-title" style={{ marginBottom: 12 }}>
                بازی‌ها
              </h2>
              <div className="rail chips-rail">
                {data.games.map(game => (
                  <Link key={game.slug} to={`/store/${game.slug}`} className="chip" onClick={() => haptic.tap()}>
                    <Img src={game.iconImage} alt="" contain style={{ width: 22, height: 22, borderRadius: 6, background: 'none' }} />
                    {game.title}
                  </Link>
                ))}
              </div>
            </section>
          )}
          {data.products.length > 0 && (
            <section className="section">
              <h2 className="section-title" style={{ marginBottom: 12 }}>
                محصولات
              </h2>
              <div className="product-grid">
                {data.products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
          {data.tournaments.length > 0 && (
            <section className="section">
              <h2 className="section-title" style={{ marginBottom: 12 }}>
                تورنمنت‌ها
              </h2>
              <div className="list">
                {data.tournaments.map(t => (
                  <Link key={t.id} to={`/tournaments/${t.slug}`} className="list-row">
                    <Img src={t.game.iconImage} alt="" contain style={{ width: 36, height: 36, borderRadius: 10 }} />
                    <div className="list-row__body">
                      <div className="list-row__title">{t.title}</div>
                      <div className="list-row__sub">{t.game.title}</div>
                    </div>
                    <StatusBadge status={t.status} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Screen>
  );
}
