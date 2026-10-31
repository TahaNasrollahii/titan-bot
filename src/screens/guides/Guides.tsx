import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronLeft, Search, X } from 'lucide-react';
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

const QUICK_TAGS = [
  { label: 'وی‌باکس فورتنایت', query: 'وی‌باکس' },
  { label: 'ولورانت پوینت', query: 'ولورانت پوینت' },
  { label: 'سی‌پی کالاف', query: 'سی‌پی' },
  { label: 'سوپرسل آیدی', query: 'سوپرسل' },
  { label: 'تأیید دومرحله‌ای 2FA', query: 'دومرحله‌ای' },
  { label: 'ثبت‌نام تورنومنت', query: 'تورنومنت' },
  { label: 'رنک‌ها و امتیازات', query: 'رنک' },
];

const GAME_FILTERS = [
  { key: 'all', label: 'همه آموزش‌ها' },
  { key: 'fortnite', label: 'فورتنایت' },
  { key: 'valorant', label: 'ولورانت' },
  { key: 'call-of-duty', label: 'کالاف دیوتی' },
  { key: 'clash-of-clans', label: 'کلش آف کلنز' },
  { key: 'premium', label: 'اشتراک پریمیوم' },
  { key: 'general', label: 'پلتفرم و تورنومنت' },
];

export default function Guides() {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as GuideCategory | null) ?? 'all';
  const initialGame = searchParams.get('game') ?? 'all';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GuideCategory | 'all'>(
    GUIDE_CATEGORIES.some(c => c.key === initialCategory) ? (initialCategory as GuideCategory) : 'all',
  );
  const [game, setGame] = useState<string>(initialGame);

  const guidesQuery = useQuery({
    queryKey: ['guides'],
    queryFn: () => guidesApi.list(),
    staleTime: 5 * 60_000,
  });

  const allGuides = guidesQuery.data ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0 || category !== 'all' || game !== 'all';

  const filteredGuides = useMemo(() => {
    return allGuides.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
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
  }, [allGuides, category, game, normalizedQuery]);

  const sections = useMemo(() => {
    return GUIDE_CATEGORIES.map(meta => ({
      ...meta,
      guides: filteredGuides.filter(g => g.category === meta.key),
    })).filter(s => s.guides.length > 0);
  }, [filteredGuides]);

  const resetFilters = () => {
    haptic.select();
    setQuery('');
    setCategory('all');
    setGame('all');
  };

  return (
    <Screen title="آموزش‌ها و راهنما" fallback="/">
      {/* Hero Banner */}
      <header className="g-hero clay">
        <div className="g-hero__top">
          <span className="g-hero__badge">
            <Icon3D name="sparkles" size={16} />
            آکادمی و راهنمای تایتان
          </span>
          <span className="g-hero__count num">{faDigits(allGuides.length || 21)} آموزش</span>
        </div>
        <h1 className="g-hero__title">صفر تا صد خرید، امنیت اکانت، تورنومنت‌ها و رنک‌بندی</h1>
        <p className="g-hero__sub">
          تمام آموزش‌های خرید و فعال‌سازی محصولات، اتصال اکانت بازی‌ها، شرکت در مسابقات نقدی و سیستم رنک‌های تایتان در یک جا.
        </p>

        {/* Search Input */}
        <div className="g-search">
          <Search size={18} className="g-search__icon" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="جستجو در آموزش‌ها (مثلاً: وی‌باکس، رنک، تورنومنت...)"
            aria-label="جستجو در آموزش‌ها"
          />
          {query && (
            <button type="button" className="g-search__clear" onClick={() => setQuery('')} aria-label="پاک کردن">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Quick Tags */}
        <div className="rail chips-rail g-quick-tags">
          {QUICK_TAGS.map(tag => {
            const active = query === tag.query;
            return (
              <button
                key={tag.label}
                type="button"
                className="chip"
                aria-pressed={active}
                onClick={() => {
                  haptic.select();
                  setQuery(active ? '' : tag.query);
                }}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Category Bento Grid */}
      <section className="section">
        <div className="g-cat-grid">
          {GUIDE_CATEGORIES.map(cat => {
            const count = allGuides.filter(g => g.category === cat.key).length;
            const active = category === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={active}
                className={`g-cat-card clay card--press ${active ? 'is-active' : ''}`}
                style={{ '--tone': cat.tone, '--accent': cat.accent } as CSSProperties}
                onClick={() => {
                  haptic.select();
                  setCategory(active ? 'all' : cat.key);
                }}
              >
                <div className="g-cat-card__top">
                  <span className="tone-icon g-cat-card__icon">
                    <img src={cat.icon} alt="" width={22} height={22} draggable={false} />
                  </span>
                  <span className="g-cat-card__count num">{faDigits(count)} راهنما</span>
                </div>
                <strong>{cat.shortTitle}</strong>
                <span>{cat.kicker}</span>
              </button>
            );
          })}
        </div>

        {/* Game Filter Chips */}
        <div className="rail chips-rail" style={{ marginTop: 12 }}>
          {GAME_FILTERS.map(gf => (
            <button
              key={gf.key}
              type="button"
              className="chip"
              aria-pressed={game === gf.key}
              onClick={() => {
                haptic.select();
                setGame(game === gf.key && gf.key !== 'all' ? 'all' : gf.key);
              }}
            >
              {gf.label}
            </button>
          ))}
        </div>

        {isFiltering && (
          <div className="g-filter-bar">
            <span>
              نمایش <b className="num">{faDigits(filteredGuides.length)}</b> از{' '}
              <b className="num">{faDigits(allGuides.length)}</b> آموزش
            </span>
            <button type="button" className="g-filter-reset" onClick={resetFilters}>
              <X size={14} /> حذف فیلترها
            </button>
          </div>
        )}
      </section>

      {/* Guides Content */}
      {guidesQuery.isError ? (
        <ErrorState error={guidesQuery.error} onRetry={() => guidesQuery.refetch()} />
      ) : !guidesQuery.data ? (
        <div className="stack" style={{ marginTop: 18 }}>
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} h={108} r={22} />
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
          {sections.map(sec => (
            <section key={sec.key} id={sec.key} className="section">
              <div className="section-head">
                <h2 className="section-title">{sec.title}</h2>
                <span className="text-xs muted num">{faDigits(sec.guides.length)} مورد</span>
              </div>
              <p className="g-sec-intro">{sec.intro}</p>
              <div className="stack">
                {sec.guides.map(item => (
                  <GuideRowCard key={item.slug} guide={item} />
                ))}
              </div>
            </section>
          ))}

          {(category === 'all' || category === 'tournament') &&
            (game === 'all' || game === 'general') &&
            (!normalizedQuery ||
              'رنک امتیاز برنز نقره طلا پلاتینیوم تایتان لول xp سیدبندی تورنومنت'.includes(
                normalizedQuery,
              )) && (
              <div className="section">
                <RanksShowcase variant="hub" />
              </div>
            )}
        </>
      )}
    </Screen>
  );
}

export function GuideRowCard({ guide }: { guide: GuideSummary }) {
  const cat = guideCategoryMeta(guide.category);
  const gIcon = guide.game ? gameIcon(guide.game.slug, guide.game.iconImage) : null;
  const summary = cleanGuideText(guide.summary);

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
              {gIcon && <Img src={gIcon} alt="" contain style={{ width: 16, height: 16, borderRadius: 4, background: 'none' }} />}
              {guide.game.title}
            </span>
          ) : (
            <span className="g-card__cat">
              <img src={cat.icon} alt="" width={14} height={14} draggable={false} />
              {cat.shortTitle}
            </span>
          )}
        </div>
        <span className="g-card__read">
          <BookOpen size={13} /> مطالعه
        </span>
      </div>

      <h3 className="g-card__title">{guide.title}</h3>
      {summary && <p className="g-card__summary">{summary}</p>}

      <div className="g-card__foot">
        <span>مشاهده آموزش گام‌به‌گام</span>
        <ChevronLeft size={16} />
      </div>
    </Link>
  );
}
