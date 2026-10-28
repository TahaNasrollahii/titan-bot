import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import type { Game, Promo, TournamentSummary } from '@/api/types';
import { env } from '@/lib/env';
import { money, num } from '@/lib/format';
import { haptic, openExternal } from '@/lib/telegram';
import { Icon3D } from '@/ui/Icon3D';
import { Img } from '@/ui/Img';

interface Slide {
  key: string;
  art: string | null;
  badge: string;
  title: string;
  line: string;
  cta: string;
  live?: boolean;
  go: () => void;
}

/** Website links in promos → the matching Mini App screen (or the website, for pages the app lacks). */
function appRoute(link: string): string | null {
  const path = link.replace(/^https?:\/\/[^/]+/, '');
  if (/^\/(product|store|tournaments|cart|wallet|fortnite-shop)(\/|$|\?)/.test(path)) return path;
  if (/^\/tournament(\/|$|\?)/.test(path)) return path.replace(/^\/tournament/, '/tournaments');
  return null;
}

/** Red clay banners; each one's character or artwork steps out over the top edge. */
export function HeroCarousel({ promos, tournaments, games }: { promos: Promo[]; tournaments: TournamentSummary[]; games: Game[] }) {
  const navigate = useNavigate();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const characters = new Map(games.map(g => [g.slug, g.characterImage]));

  const slides: Slide[] = [
    ...promos.map(p => ({
      key: `p${p.id}`,
      art: p.image,
      badge: p.badge || 'پیشنهاد ویژه',
      title: p.title,
      line: p.price ? `${num(p.price)} تومان` : p.subtitle,
      cta: 'مشاهده',
      go: () => {
        const route = p.product ? `/product/${p.product}` : p.tournament ? `/tournaments/${p.tournament}` : appRoute(p.link || '');
        if (route) navigate(route);
        else if (p.link) openExternal(p.link.startsWith('http') ? p.link : `${env.siteUrl}${p.link}`);
      },
    })),
    ...tournaments.slice(0, 4).map(t => ({
      key: `t${t.id}`,
      art: characters.get(t.game.slug) ?? null,
      badge: t.game.title,
      title: t.title,
      line: `${money(t.prizePool, t.prizeCurrency)} جایزه`,
      cta: t.isRegistered ? 'مشاهده' : t.status === 'registration_open' ? 'ثبت‌نام' : 'جزئیات',
      live: t.status === 'live',
      go: () => navigate(`/tournaments/${t.slug}`),
    })),
  ];

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setActive(Math.round(Math.abs(el.scrollLeft) / Math.max(1, el.clientWidth)));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Gentle auto-advance until the user swipes themselves.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || touched.current || document.hidden) return;
      const next = el.children[(active + 1) % slides.length] as HTMLElement | undefined;
      next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }, 5200);
    return () => window.clearInterval(timer);
  }, [active, slides.length]);

  if (!slides.length) return null;

  return (
    <div className="hero">
      <div className="hero__track" ref={track} onTouchStart={() => (touched.current = true)}>
        {slides.map((slide, index) => (
          <div key={slide.key} className="hero__frame">
            <button
              className="clay clay--red hero__slide"
              onClick={() => {
                haptic.tap('medium');
                slide.go();
              }}
            >
              {slide.art && <Img className="hero__art" src={slide.art} alt="" contain priority={index === 0} />}
              <span className="hero__body">
                <span className="clay clay--cream hero__badge">
                  {slide.live ? <span className="live-dot" /> : <Icon3D name="fire" size={16} />}
                  {slide.live ? 'زنده' : slide.badge}
                </span>
                <strong className="hero__title">{slide.title}</strong>
                {slide.line && <span className="hero__line num">{slide.line}</span>}
                <span className="clay clay--white hero__cta">{slide.cta}</span>
              </span>
            </button>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="hero__dots" aria-hidden>
          {slides.map((slide, index) => (
            <span key={slide.key} data-active={index === active} />
          ))}
        </div>
      )}
    </div>
  );
}
