import { ChevronLeft, Trophy } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';

import type { Promo, TournamentSummary } from '@/api/types';
import { money, num } from '@/lib/format';
import { haptic, openExternal } from '@/lib/telegram';
import { env } from '@/lib/env';
import { StatusBadge } from '@/ui/cards';
import { Img } from '@/ui/Img';

interface Slide {
  key: string;
  image: string | null;
  art: string | null;
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  accent: string;
  extra?: React.ReactNode;
  go: () => void;
}

/** Website links in promos → the matching Mini App screen (or the website, for pages the app lacks). */
function appRoute(link: string): string | null {
  const path = link.replace(/^https?:\/\/[^/]+/, '');
  const known = /^\/(product|store|tournaments|cart|wallet)(\/|$|\?)/;
  if (known.test(path)) return path;
  if (path.startsWith('/tournament/')) return path.replace('/tournament/', '/tournaments/');
  return null;
}

export function HeroCarousel({ promos, tournaments }: { promos: Promo[]; tournaments: TournamentSummary[] }) {
  const navigate = useNavigate();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const touched = useRef(false);

  const slides: Slide[] = [
    ...promos.map(p => ({
      key: `p${p.id}`,
      image: p.backgroundImage,
      art: p.image,
      kicker: p.badge || 'پیشنهاد ویژه',
      title: p.title,
      subtitle: p.subtitle,
      cta: p.price ? `${num(p.price)} تومان` : 'مشاهده',
      accent: '#e2453f',
      go: () => {
        const route = p.product ? `/product/${p.product}` : p.tournament ? `/tournaments/${p.tournament}` : appRoute(p.link || '');
        if (route) navigate(route);
        else if (p.link) openExternal(p.link.startsWith('http') ? p.link : `${env.siteUrl}${p.link}`);
      },
    })),
    ...tournaments.slice(0, 4).map(t => ({
      key: `t${t.id}`,
      image: t.coverImage,
      art: null,
      kicker: t.game.title,
      title: t.title,
      subtitle: t.formatLabel,
      cta: t.isRegistered ? 'مشاهده' : t.status === 'registration_open' ? 'ثبت‌نام' : 'جزئیات',
      accent: t.game.accentColor,
      extra: (
        <span className="hero__prize">
          <Trophy size={14} /> <span className="num">{money(t.prizePool, t.prizeCurrency)}</span>
          <StatusBadge status={t.status} />
        </span>
      ),
      go: () => navigate(`/tournaments/${t.slug}`),
    })),
  ];

  // Follow the visible slide for the dots.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const width = el.clientWidth;
      setActive(Math.round(Math.abs(el.scrollLeft) / Math.max(1, width - 24)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Gentle auto-advance until the user swipes themselves.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || touched.current || document.hidden) return;
      const next = (active + 1) % slides.length;
      const child = el.children[next] as HTMLElement | undefined;
      child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }, 5200);
    return () => window.clearInterval(timer);
  }, [active, slides.length]);

  if (!slides.length) return null;

  return (
    <div className="hero">
      <div className="hero__track" ref={track} onTouchStart={() => (touched.current = true)}>
        {slides.map((slide, index) => (
          <button
            key={slide.key}
            className="hero__slide"
            style={{ '--accent': slide.accent } as CSSProperties}
            onClick={() => {
              haptic.tap('medium');
              slide.go();
            }}
          >
            <Img className="hero__bg" src={slide.image} alt="" priority={index === 0} />
            <div className="hero__shade" />
            {slide.art && <Img className="hero__art" src={slide.art} alt="" contain priority={index === 0} />}
            <div className="hero__content">
              <span className="hero__kicker">{slide.kicker}</span>
              <strong className="hero__title">{slide.title}</strong>
              {slide.subtitle && <span className="hero__sub">{slide.subtitle}</span>}
              {slide.extra}
              <span className="hero__cta">
                {slide.cta} <ChevronLeft size={16} />
              </span>
            </div>
          </button>
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
