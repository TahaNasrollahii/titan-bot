import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { catalogApi } from '@/api/endpoints';
import { haptic } from '@/lib/telegram';
import { GameTile } from '@/ui/cards';
import { Icon3D } from '@/ui/Icon3D';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import { ProductGrid } from './ProductGrid';
import './store.css';

interface StorePromoSlide {
  key: string;
  art: string;
  badge: string;
  title: string;
  line: string;
  cta: string;
  href: string;
}

const STORE_PROMO_SLIDES: StorePromoSlide[] = [
  {
    key: 'valorant',
    art: '/images/games/valorant-character.webp',
    badge: 'پیشنهاد ویژه',
    title: 'باندل ویژه ولورانت',
    line: 'پکیج کامل اسکین‌های پرایم · ۲,۱۰۰,۰۰۰ تومان',
    cta: 'مشاهده محصول',
    href: '/product/valorant-points',
  },
  {
    key: 'crew-pack',
    art: '/images/hero/characters/fortnite-crewpack-october2026.webp',
    badge: 'اشتراک ویژه',
    title: 'فورتنایت کرو پک',
    line: '۱,۰۰۰ وی‌باکس + بتل‌پس · ۹۹۰,۰۰۰ تومان',
    cta: 'مشاهده محصول',
    href: '/product/fortnite-crew-pack',
  },
];

const slideVariants = {
  initial: (dir: number) => ({
    x: -dir * 130,
    y: 14,
    rotate: -dir * 5.5,
    scale: 0.9,
    opacity: 0,
    zIndex: 1,
  }),
  exit: (dir: number) => ({
    x: dir * 390,
    y: 22,
    rotate: dir * 13,
    scale: 0.85,
    opacity: 0,
    zIndex: 2,
    transition: {
      x: { type: 'spring' as const, stiffness: 205, damping: 23, mass: 0.85 },
      y: { type: 'spring' as const, stiffness: 205, damping: 24, mass: 0.85 },
      rotate: { type: 'spring' as const, stiffness: 195, damping: 22, mass: 0.85 },
      scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
      opacity: { duration: 0.34, ease: [0.32, 0, 0.67, 0] as const },
    },
  }),
};

function StorePromoCarousel() {
  const navigate = useNavigate();
  const [[active, dir], setPage] = useState<[number, number]>([0, -1]);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touched = useRef(false);
  const dragState = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    axis: 'x' | 'y' | null;
    moved: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    axis: null,
    moved: false,
  });

  const goTo = (nextIndex: number, throwDir: number, manual = true) => {
    if (manual) {
      touched.current = true;
      haptic.select();
    }
    setDragX(0);
    setIsDragging(false);
    setPage([nextIndex, throwDir]);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (touched.current || document.hidden) return;
      setPage(([curr]) => [(curr + 1) % STORE_PROMO_SLIDES.length, -1]);
    }, 5400);
    return () => window.clearInterval(timer);
  }, []);

  const slide = STORE_PROMO_SLIDES[active];

  return (
    <div className="store-hero">
      <div
        className="store-hero__stage"
        onPointerDown={e => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          touched.current = true;
          dragState.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            lastX: e.clientX,
            lastTime: performance.now(),
            axis: null,
            moved: false,
          };
        }}
        onPointerMove={e => {
          const st = dragState.current;
          if (st.pointerId !== e.pointerId) return;
          const dx = e.clientX - st.startX;
          const dy = e.clientY - st.startY;

          if (!st.axis) {
            if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
            st.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
            if (st.axis === 'x') {
              setIsDragging(true);
              e.currentTarget.setPointerCapture?.(e.pointerId);
            }
          }

          if (st.axis === 'x') {
            if (Math.abs(dx) > 8) st.moved = true;
            st.lastX = e.clientX;
            st.lastTime = performance.now();
            setDragX(dx);
          }
        }}
        onPointerUp={e => {
          const st = dragState.current;
          if (st.pointerId !== e.pointerId) return;
          st.pointerId = null;

          if (st.axis === 'x') {
            const dx = e.clientX - st.startX;
            const dt = Math.max(1, performance.now() - st.lastTime);
            const vx = (e.clientX - st.lastX) / dt;
            if (Math.abs(dx) > 38 || Math.abs(vx) > 0.28) {
              const throwDir = (Math.abs(vx) > 0.28 ? vx : dx) >= 0 ? 1 : -1;
              const next = (active + 1) % STORE_PROMO_SLIDES.length;
              goTo(next, throwDir, true);
              return;
            }
          }

          setIsDragging(false);
          setDragX(0);
        }}
        onPointerCancel={() => {
          dragState.current.pointerId = null;
          setIsDragging(false);
          setDragX(0);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <m.div
            key={slide.key}
            className="store-hero__frame"
            custom={dir}
            variants={slideVariants}
            initial="initial"
            animate={{
              x: dragX,
              y: Math.abs(dragX) * 0.035,
              rotate: dragX * 0.045,
              scale: 1 - Math.min(Math.abs(dragX) / 1500, 0.03),
              opacity: 1,
              zIndex: 2,
              transition: isDragging
                ? { type: 'tween', duration: 0 }
                : { type: 'spring', stiffness: 235, damping: 24, mass: 0.85 },
            }}
            exit="exit"
          >
            <button
              type="button"
              className="clay clay--red store-hero__slide"
              onClick={() => {
                if (dragState.current.moved) return;
                haptic.tap('medium');
                navigate(slide.href);
              }}
            >
              <Img className="store-hero__art" src={slide.art} alt={slide.title} contain priority />
              <span className="store-hero__body">
                <span className="clay clay--cream store-hero__badge">
                  <Icon3D name="fire" size={16} />
                  {slide.badge}
                </span>
                <strong className="store-hero__title">{slide.title}</strong>
                <span className="store-hero__line num">{slide.line}</span>
                <span className="clay clay--white store-hero__cta">{slide.cta}</span>
              </span>
            </button>
          </m.div>
        </AnimatePresence>
      </div>

      <div className="store-hero__dots" role="tablist" aria-label="اسلایدهای پیشنهادی">
        {STORE_PROMO_SLIDES.map((s, index) => (
          <button
            key={s.key}
            type="button"
            className="store-hero__dot"
            data-active={index === active}
            aria-label={s.title}
            aria-selected={index === active}
            onClick={() => {
              if (index === active) return;
              goTo(index, index > active ? -1 : 1, true);
            }}
          />
        ))}
      </div>
    </div>
  );
}

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

      <StorePromoCarousel />

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
