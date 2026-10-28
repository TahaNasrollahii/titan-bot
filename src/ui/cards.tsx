import { Radio, Star, Users } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import type { Game, ProductSummary, TournamentSummary } from '@/api/types';
import { compactToman, date, faDigits, money, num } from '@/lib/format';
import { haptic } from '@/lib/telegram';

import { Icon3D } from './Icon3D';
import { Img } from './Img';

const accent = (color: string | undefined) => ({ '--accent': color || '#e2453f' }) as CSSProperties;

// ------------------------------------------------------------------ products
export function ProductCard({ product, wide }: { product: ProductSummary; wide?: boolean }) {
  const from = product.hasVariants && product.priceMax && product.priceMax !== product.price;
  return (
    <Link
      to={`/product/${product.slug}`}
      className={`clay pcard card--press ${wide ? 'pcard--wide' : ''}`}
      style={accent(product.game?.accentColor)}
      onClick={() => haptic.tap()}
    >
      <div className="pcard__media">
        <Img src={product.image} alt={product.imageAlt || product.title} contain />
        {product.discountPercent > 0 && <span className="clay clay--red pcard__off num">٪{faDigits(product.discountPercent)}</span>}
        {product.badges.includes('bestseller') && (
          <span className="clay clay--cream pcard__hot">
            <Icon3D name="fire" size={14} /> پرفروش
          </span>
        )}
      </div>
      <div className="pcard__body">
        {product.game && <span className="pcard__game">{product.game.title}</span>}
        <h3 className="pcard__title">{product.title}</h3>
        <div className="pcard__foot">
          {product.price === null || !product.inStock ? (
            <span className="muted text-sm">ناموجود</span>
          ) : (
            <span className="pcard__price num">
              {from && <small>از </small>}
              {num(product.price)}
              <small> تومان</small>
            </span>
          )}
          {product.rating > 0 && (
            <span className="pcard__rating num">
              <Star size={11} fill="currentColor" />
              {faDigits(product.rating.toFixed(1))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ------------------------------------------------------------------ games
export function GameTile({ game, size = 'md' }: { game: Game; size?: 'md' | 'lg' }) {
  return (
    <Link
      to={`/store/${game.slug}`}
      className={`clay gtile gtile--${size} card--press`}
      style={accent(game.accentColor)}
      onClick={() => haptic.tap()}
    >
      {game.backgroundImage || game.coverImage ? (
        <Img className="gtile__bg" src={game.backgroundImage || game.coverImage} alt="" />
      ) : (
        <span className="gtile__plain" aria-hidden />
      )}
      {game.characterImage ? (
        <Img className="gtile__char" src={game.characterImage} alt="" contain />
      ) : game.iconImage ? (
        <Img className="gtile__icon" src={game.iconImage} alt="" contain />
      ) : (
        <span className="gtile__mono ltr" aria-hidden>
          {game.titleEn.slice(0, 2).toUpperCase()}
        </span>
      )}
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
          <Img className="tcard__icon" src={t.game.iconImage} alt="" contain />
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
