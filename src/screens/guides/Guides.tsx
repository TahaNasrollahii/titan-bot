import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Search, X } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router';

import { guidesApi } from '@/api/endpoints';
import type { GuideCategory, GuideSummary } from '@/api/types';
import { faDigits } from '@/lib/format';
import { gameIcon } from '@/lib/media';
import { haptic } from '@/lib/telegram';
import { Empty, ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import { RanksShowcase } from './RanksShowcase';
import { GUIDE_CATEGORIES, cleanGuideText, guideCategoryMeta } from './guidesData';
import './guides.css';

const GAME_FILTERS = [
  { key: 'all', label: 'همه بازی‌ها' },
  { key: 'fortnite', label: 'فورتنایت' },
  { key: 'valorant', label: 'ولورانت' },
  { key: 'call-of-duty', label: 'کالاف دیوتی' },
  { key: 'clash-of-clans', label: 'کلش آف کلنز' },
  { key: 'premium', label: 'اشتراک پریمیوم' },
  { key: 'general', label: 'پلتفرم و تورنومنت' },
];

export default function Guides() {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as GuideCategory | 'all' | null) ?? 'purchase';
  const initialGame = searchParams.get('game') ?? 'all';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GuideCategory | 'all'>(
    initialCategory === 'all' || GUIDE_CATEGORIES.some(c => c.key === initialCategory)
      ? initialCategory
      : 'purchase',
  );
  const [game, setGame] = useState<string>(initialGame);

  const guidesQuery = useQuery({
    queryKey: ['guides'],
    queryFn: () => guidesApi.list(),
    staleTime: 5 * 60_000,
  });

  const allGuides = guidesQuery.data ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const isSearchOrGameFilter = normalizedQuery.length > 0 || game !== 'all';

  const effectiveCategory: GuideCategory | 'all' = useMemo(() => {
    if (category === 'all') return 'all';
    if (!isSearchOrGameFilter) return category;

    const hasMatchInActive = allGuides.some(item => {
      if (item.category !== category) return false;
      if (game !== 'all') {
        if (game === 'general') {
          if (item.game !== null) return false;
        } else if (item.game?.slug !== game) {
          return false;
        }
      }
      if (normalizedQuery) {
        const hay = `${item.title} ${cleanGuideText(item.summary)} ${item.game?.title ?? ''} ${item.game?.titleEn ?? ''}`.toLowerCase();
        if (!hay.includes(normalizedQuery)) return false;
      }
      return true;
    });

    return hasMatchInActive ? category : 'all';
  }, [allGuides, category, game, isSearchOrGameFilter, normalizedQuery]);

  const filteredGuides = useMemo(() => {
    return allGuides.filter(item => {
      if (effectiveCategory !== 'all' && item.category !== effectiveCategory) return false;
      if (game !== 'all') {
        if (game === 'general') {
          if (item.game !== null) return false;
        } else if (item.game?.slug !== game) {
          return false;
        }
      }
      if (normalizedQuery) {
        const hay = `${item.title} ${cleanGuideText(item.summary)} ${item.game?.title ?? ''} ${item.game?.titleEn ?? ''}`.toLowerCase();
        if (!hay.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [allGuides, effectiveCategory, game, normalizedQuery]);

  const sections = useMemo(() => {
    return GUIDE_CATEGORIES.map(meta => ({
      ...meta,
      guides: filteredGuides.filter(g => g.category === meta.key),
    })).filter(s => s.guides.length > 0);
  }, [filteredGuides]);

  const resetFilters = () => {
    haptic.select();
    setQuery('');
    setCategory('purchase');
    setGame('all');
  };

  return (
    <Screen title="آموزش‌ها و راهنما" fallback="/">
      {/* Clean Header, 2x2 Category Bento Deck & Game Filter */}
      <header className="g-hero clay">
        <div className="g-hero__top">
          <span className="g-hero__badge">آکادمی رسمی تایتان</span>
          {allGuides.length > 0 && (
            <button
              type="button"
              className="g-hero__count"
              onClick={() => {
                haptic.select();
                setCategory(effectiveCategory === 'all' ? 'purchase' : 'all');
              }}
            >
              {effectiveCategory === 'all'
                ? 'نمای دسته‌بندی'
                : `نمایش همه (${faDigits(allGuides.length)})`}
            </button>
          )}
        </div>

        <div className="g-search">
          <Search size={17} className="g-search__icon" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="جستجو در آموزش‌ها (وی‌باکس، سوپرسل، تورنومنت، رنک...)"
            aria-label="جستجو در آموزش‌ها"
          />
          {query && (
            <button
              type="button"
              className="g-search__clear"
              onClick={() => setQuery('')}
              aria-label="پاک کردن"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* 2x2 Interactive Category Bento Deck */}
        <div className="g-cat-grid" role="tablist" aria-label="دسته‌بندی آموزش‌ها">
          {GUIDE_CATEGORIES.map(cat => {
            const count = allGuides.filter(g => g.category === cat.key).length;
            const active = effectiveCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`g-cat-card clay ${active ? 'is-active' : ''}`}
                style={{ '--accent': cat.accent, '--tone': cat.tone } as CSSProperties}
                onClick={() => {
                  haptic.select();
                  setCategory(cat.key);
                  if (game === 'general' && cat.key !== 'tournament' && cat.key !== 'site') {
                    setGame('all');
                  }
                }}
              >
                <div className="g-cat-card__top">
                  <span className="g-cat-card__icon">
                    <img src={cat.icon} alt="" width={22} height={22} draggable={false} />
                  </span>
                  <span className="g-cat-card__count num">{faDigits(count)} آموزش</span>
                </div>
                <strong>{cat.shortTitle}</strong>
              </button>
            );
          })}
        </div>

        {/* Game Filter Chips */}
        <div className="rail chips-rail">
          {GAME_FILTERS.map(gf => (
            <button
              key={gf.key}
              type="button"
              className="chip"
              aria-pressed={game === gf.key}
              onClick={() => {
                haptic.select();
                const nextGame = game === gf.key && gf.key !== 'all' ? 'all' : gf.key;
                setGame(nextGame);
                if (nextGame !== 'all') {
                  setCategory('all');
                } else if (category === 'all') {
                  setCategory('purchase');
                }
              }}
            >
              {gf.label}
            </button>
          ))}
        </div>

        {isSearchOrGameFilter && (
          <div className="g-filter-bar">
            <span>
              <b className="num">{faDigits(filteredGuides.length)}</b> آموزش یافت شد
            </span>
            <button type="button" className="g-filter-reset" onClick={resetFilters}>
              <X size={14} /> پاک کردن فیلتر
            </button>
          </div>
        )}
      </header>

      {/* Guides Content */}
      {guidesQuery.isError ? (
        <ErrorState error={guidesQuery.error} onRetry={() => guidesQuery.refetch()} />
      ) : !guidesQuery.data ? (
        <div className="stack" style={{ marginTop: 14 }}>
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} h={92} r={20} />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <Empty
          icon={<Icon3D name="magnifying-glass-tilted-left" size={48} />}
          title="آموزشی مطابق فیلتر پیدا نشد"
          text="عبارت دیگری را جستجو کنید یا فیلترها را پاک کنید."
          action={
            <button type="button" className="btn btn--primary" onClick={resetFilters}>
              نمایش همه آموزش‌ها
            </button>
          }
        />
      ) : (
        <>
          {(effectiveCategory === 'tournament' ||
            (normalizedQuery &&
              'رنک امتیاز برنز نقره طلا پلاتینیوم تایتان لول xp سیدبندی تورنومنت'.includes(
                normalizedQuery,
              ))) && (
            <div className="section">
              <RanksShowcase variant="hub" />
            </div>
          )}

          {sections.map(sec => (
            <section key={sec.key} id={sec.key} className="section">
              <div className="section-head">
                <h2 className="section-title">{sec.title}</h2>
                <span className="text-xs muted num">{faDigits(sec.guides.length)} آموزش</span>
              </div>
              <p className="g-sec-intro">{sec.intro}</p>
              <div className="stack">
                {sec.guides.map((item, idx) => (
                  <GuideRowCard key={item.slug} guide={item} index={idx + 1} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </Screen>
  );
}

export function GuideRowCard({
  guide,
  index,
}: {
  guide: GuideSummary;
  index?: number;
}) {
  const cat = guideCategoryMeta(guide.category);
  const gIcon = guide.game ? gameIcon(guide.game.slug, guide.game.iconImage) : null;
  const summary = cleanGuideText(guide.summary);
  const formattedIndex =
    typeof index === 'number' ? faDigits(index).padStart(2, '۰') : null;

  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="g-card clay card--press"
      style={{ '--accent': guide.game?.accentColor || cat.accent, '--tone': cat.tone } as CSSProperties}
      onClick={() => haptic.tap()}
    >
      <div className="g-card__top">
        <div className="g-card__badges">
          {guide.game ? (
            <span className="g-card__game">
              {gIcon && (
                <Img
                  src={gIcon}
                  alt=""
                  contain
                  style={{ width: 15, height: 15, borderRadius: 4, background: 'none' }}
                />
              )}
              {guide.game.title}
            </span>
          ) : (
            <span className="g-card__cat">
              <img src={cat.icon} alt="" width={14} height={14} draggable={false} />
              {cat.shortTitle}
            </span>
          )}
        </div>
        <div className="g-card__right-meta">
          {formattedIndex && <span className="g-card__idx num">{formattedIndex}</span>}
          <ChevronLeft size={16} className="muted" />
        </div>
      </div>

      <h3 className="g-card__title">{guide.title}</h3>
      {summary && <p className="g-card__summary">{summary}</p>}
    </Link>
  );
}
