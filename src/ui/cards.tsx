import { Radio, Users } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import type { Game, ProductSummary, TournamentSummary } from '@/api/types';
import { compactToman, date, faDigits, money, num } from '@/lib/format';
import { gameBackground, gameCharacter, gameIcon, productImage } from '@/lib/media';
import { haptic } from '@/lib/telegram';

import { Icon3D } from './Icon3D';
import { Img } from './Img';

const accent = (color: string | undefined) => ({ '--accent': color || '#e2453f' }) as CSSProperties;

/** Same colour choice as the website's product cards (titan-front StoreClient GAME_ACCENTS / ACCENT_COLORS). */
export const GAME_ACCENTS: Record<string, string> = {
  fortnite: '#35c6ff',
  'call-of-duty': '#f59e0b',
  'clash-of-clans': '#38bdf8',
  valorant: '#ef2f5a',
  steam: '#4a8bff',
  premium: '#3b82f6',
  'ea-fc': '#10b981',
  pubg: '#f59e0b',
  minecraft: '#22c55e',
  cs2: '#fb923c',
  'dota-2': '#ef4444',
};
const ACCENT_COLORS = ['#ff7a2f', '#4a8bff', '#35c6ff', '#ef2f5a', '#35d07f', '#ffb800'];

export function productAccent(product: Pick<ProductSummary, 'id' | 'game'>): string {
  const slug = product.game?.slug ?? '';
  return product.game?.accentColor || GAME_ACCENTS[slug] || ACCENT_COLORS[product.id % ACCENT_COLORS.length];
}

// ------------------------------------------------------------------ products
export function ProductCard({ product, wide }: { product: ProductSummary; wide?: boolean }) {
  const from = product.hasVariants && product.priceMax && product.priceMax !== product.price;
  const artSrc = productImage(product);

  const discountPercent =
    product.discountPercent > 0
      ? product.discountPercent
      : product.originalPrice && product.price && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

  const hasDiscount = discountPercent > 0 || product.badges.includes('discount');
  const isHot = product.badges.includes('bestseller') || (product.popularity ?? 0) > 80;
  const isNew = product.badges.includes('new');
  const categoryLabel = product.game?.title || product.subtitle || product.category.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`pcard card--press ${product.inStock ? '' : 'pcard--sold'} ${wide ? 'pcard--wide' : ''}`}
      style={accent(productAccent(product))}
      onClick={() => haptic.tap()}
    >
      <div className="pcard__bg" aria-hidden>
        <div className="pcard__glow" />
      </div>

      <div className="pcard__top">
        <div className="pcard__tags">
          {hasDiscount && discountPercent > 0 && (
            <span className="pcard__pill pcard__pill--sale num">
              <span className="pcard__flame" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8z" />
                </svg>
              </span>
              <span className="pcard__sale-txt">{faDigits(discountPercent)}٪ تخفیف</span>
            </span>
          )}
          {isHot && (
            <span className="pcard__pill pcard__pill--hot">
              پرفروش
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8" />
              </svg>
            </span>
          )}
          {isNew && !hasDiscount && !isHot && <span className="pcard__pill pcard__pill--new">جدید</span>}
        </div>
        {product.rating > 0 && (
          <span className="pcard__pill pcard__pill--rate num">
            <i>★</i>
            {faDigits(Number(product.rating.toFixed(1)))}
          </span>
        )}
      </div>

      <div className="pcard__stage">
        <Img src={artSrc} alt={product.imageAlt || product.title} contain />
      </div>

      <div className="pcard__panel">
        <div className="pcard__meta">
          <span className="pcard__cat" title={categoryLabel}>
            {categoryLabel}
          </span>
          <span className={`pcard__stock ${product.inStock ? '' : 'pcard__stock--off'}`}>
            {product.inStock ? 'موجود' : 'ناموجود'}
          </span>
        </div>

        <h3 className="pcard__title" title={product.title}>
          {product.title}
        </h3>

        <div className="pcard__price-row">
          {product.price === null ? (
            <span className="muted text-xs">تماس بگیرید</span>
          ) : (
            <span className="pcard__price num">
              {from && <span className="pcard__from">از</span>}
              {num(product.price)}
              <small>تومان</small>
            </span>
          )}
          {product.originalPrice != null && product.price != null && product.originalPrice > product.price && (
            <span className="pcard__old num">{num(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ------------------------------------------------------------------ games
export function GameTile({ game, size = 'md' }: { game: Game; size?: 'md' | 'lg' }) {
  const icon = gameIcon(game.slug, game.iconImage);
  const bg = gameBackground(game.slug, game.backgroundImage || game.coverImage);
  const char = gameCharacter(game.slug, game.characterImage);
  return (
    <Link
      to={`/store/${game.slug}`}
      className={`clay gtile gtile--${size} card--press`}
      style={accent(game.accentColor || GAME_ACCENTS[game.slug])}
      onClick={() => haptic.tap()}
    >
      {bg ? (
        <Img className="gtile__bg" src={bg} alt="" />
      ) : (
        <span className="gtile__plain" aria-hidden />
      )}
      {char ? (
        <Img className="gtile__char" src={char} alt="" contain />
      ) : !bg && icon ? (
        <Img className="gtile__icon" src={icon} alt="" contain />
      ) : !bg ? (
        <span className="gtile__mono ltr" aria-hidden>
          {game.titleEn.slice(0, 2).toUpperCase()}
        </span>
      ) : null}
      <div className="gtile__shade" />
      <div className="gtile__info">
        <strong>{game.title}</strong>
      </div>
    </Link>
  );
}

// ------------------------------------------------------------------ tournaments
export const STATUS_LABEL: Record<TournamentSummary['status'], string> = {
  upcoming: 'به‌زودی',
  registration_open: 'ثبت‌نام باز',
  registration_closed: 'ثبت‌نام بسته',
  live: 'زنده',
  completed: 'پایان‌یافته',
  cancelled: 'لغو شده',
};

export function StatusBadge({ status }: { status: TournamentSummary['status'] }) {
  if (status === 'live')
    return (
      <span className="badge badge--solid">
        <span className="live-dot" /> زنده
      </span>
    );
  const tone = status === 'registration_open' ? 'green' : status === 'upcoming' ? 'blue' : status === 'cancelled' ? 'red' : '';
  return <span className={`badge ${tone ? `badge--${tone}` : ''}`}>{STATUS_LABEL[status]}</span>;
}

export function TournamentCard({ t, compact }: { t: TournamentSummary; compact?: boolean }) {
  const fill = Math.min(100, Math.round((t.participantsCount / Math.max(1, t.maxParticipants)) * 100));
  const icon = gameIcon(t.game.slug, t.game.iconImage);
  return (
    <Link
      to={`/tournaments/${t.slug}`}
      className={`clay tcard card--press ${compact ? 'tcard--compact' : ''}`}
      style={accent(t.game.accentColor)}
      onClick={() => haptic.tap()}
    >
      <div className="tcard__cover">
        <Img src={t.coverImage} alt={t.imageAlt || t.title} />
        <div className="tcard__badges">
          <StatusBadge status={t.status} />
          {t.isRegistered && <span className="badge badge--cream">ثبت‌نام شده</span>}
        </div>
        {t.status === 'live' && t.viewerCount > 0 && (
          <span className="tcard__viewers num">
            <Radio size={12} /> {compactToman(t.viewerCount).replace(' هزار', 'K')}
          </span>
        )}
      </div>
      <div className="tcard__body">
        <div className="tcard__game">
          <Img className="tcard__icon" src={icon} alt="" contain />
          {t.game.title}، {t.formatLabel}
        </div>
        <h3 className="tcard__title">{t.title}</h3>
        <div className="tcard__meta">
          <span className="tcard__prize">
            <Icon3D name="trophy" size={20} />
            <span className="num">{money(t.prizePool, t.prizeCurrency)}</span>
          </span>
          <span className="muted text-xs">{date(t.startsAt)}</span>
        </div>
        <div className="tcard__fill">
          <div className="well tcard__bar">
            <span style={{ width: `${fill}%` }} />
          </div>
          <span className="text-xs muted num">
            <Users size={12} /> {faDigits(t.participantsCount)}/{faDigits(t.maxParticipants)}
          </span>
          <span className={`text-xs ${t.isFree ? 'tcard__free' : ''} num`}>{t.isFree ? 'رایگان' : `${num(t.entryFee)} ت`}</span>
        </div>
      </div>
    </Link>
  );
}
