import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { Link } from 'react-router';

import type { Product } from '@/api/types';
import { haptic, openExternal } from '@/lib/telegram';

import {
  CREW_ACTIVATION_CONTENT,
  CREW_ACTIVATION_INFO,
  CREW_BENEFIT_BLOCKS,
  CREW_BENEFITS_HEADER,
  CREW_COMPARISON_CONTENT,
  CREW_COMPARISON_ROWS,
  CREW_COMPARISON_TOTAL,
  CREW_FAQ_HEADER,
  CREW_FAQ_ITEMS,
  CREW_HERO_CONTENT,
  CREW_INTRO_CONTENT,
  CREW_PRICE_DELIVERY_CONTENT,
  CREW_RELATED_HEADER,
  CREW_RELATED_LINKS,
  CREW_SUPPORT_CONTENT,
  resolveCrewPricing,
} from './content';
import { CrewIcon } from './CrewIcon';
import './crew.css';

interface CrewBotDescriptionProps {
  product: Product;
}

export function CrewBotDescription({ product }: CrewBotDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const startXRef = useRef<number | null>(null);
  const draggedRef = useRef(false);

  const pricing = resolveCrewPricing(product);
  const items = CREW_BENEFIT_BLOCKS;
  const n = items.length;

  const go = (index: number) => {
    haptic.select();
    setActive(((index % n) + n) % n);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
    draggedRef.current = false;
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    startXRef.current = null;
    if (Math.abs(dx) > 45) {
      draggedRef.current = true;
      go(active + (dx < 0 ? 1 : -1));
    }
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
  };

  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>, index: number, id: string) => {
    if (draggedRef.current) {
      e.preventDefault();
      draggedRef.current = false;
      return;
    }
    if (index !== active) {
      e.preventDefault();
      go(index);
      return;
    }
    e.preventDefault();
    haptic.tap('light');
    if (!expanded) {
      setExpanded(true);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="crew-bot-root" className={`cbot ${!expanded ? 'cbot--collapsed' : ''}`}>
      {/* 1. HERO + CAROUSEL */}
      <div className="cbot__hero">
        <div className="cbot__carousel">
          <div className="cbot__stage">
            <div className="cbot__glow" aria-hidden="true" />
            <div
              className="cbot__deck"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              {items.map((item, i) => {
                const d = i - active;
                const abs = Math.abs(d);
                const visible = abs <= 2;

                const transform = `translateX(calc(${d} * 78px)) translateY(calc(${abs} * 10px)) scale(${(
                  1 -
                  abs * 0.13
                ).toFixed(2)}) rotate(${d * 5}deg)`;

                const opacity = visible ? (abs === 0 ? 1 : abs === 1 ? 0.82 : 0.45) : 0;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="cbot__card"
                    onClick={e => handleCardClick(e, i, item.id)}
                    style={{
                      zIndex: 10 - abs,
                      opacity,
                      pointerEvents: visible ? 'auto' : 'none',
                      transform,
                    }}
                  >
                    <div
                      className="cbot__card-inner"
                      style={{
                        background: item.grad,
                        border:
                          abs === 0
                            ? '1px solid rgba(242,184,75,0.65)'
                            : '1px solid rgba(255,255,255,0.14)',
                      }}
                    >
                      <div className="cbot__card-top">
                        <div className="cbot__card-icon">
                          <CrewIcon icon={item.icon} size={30} stroke={item.ink} strokeWidth={1.6} />
                        </div>
                        <span className="cbot__card-num">۰{i + 1}</span>
                      </div>
                      <div className="cbot__card-bottom">
                        <span className="cbot__card-tag">{item.tag}</span>
                        <div className="cbot__card-title">{item.tag}</div>
                        <span className="cbot__card-more" style={{ color: item.ink }}>
                          مشاهده توضیح ←
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="cbot__controls">
            <button
              type="button"
              aria-label="کارت‌های بعدی (سمت راست)"
              className="cbot__nav-btn"
              onClick={() => go(active + 1)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <div className="cbot__dots">
              {items.map((item, i) => {
                const isCurrent = i === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`کارت ${i + 1}: ${item.tag}`}
                    aria-current={isCurrent ? 'true' : undefined}
                    className="cbot__dot-btn"
                    onClick={() => go(i)}
                  >
                    <span
                      className="cbot__dot-bar"
                      style={{
                        width: isCurrent ? '22px' : '7px',
                        background: isCurrent ? '#f2b84b' : 'rgba(255,255,255,0.22)',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-label="کارت‌های قبلی (سمت چپ)"
              className="cbot__nav-btn"
              onClick={() => go(active - 1)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>

          <p className="cbot__hint">{CREW_HERO_CONTENT.carouselHint}</p>
        </div>

        <div className="cbot__hero-text">
          <span className="cbot__eyebrow">{CREW_HERO_CONTENT.eyebrow}</span>
          <h3 className="cbot__h-main">{CREW_HERO_CONTENT.title}</h3>
          <p className="cbot__p">{CREW_HERO_CONTENT.lead}</p>
          <div className="cbot__chips">
            {CREW_HERO_CONTENT.factChips.map(chip => (
              <span key={chip} className="cbot__fact-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2–9. COLLAPSIBLE BODY */}
      <div
        id="crew-bot-more"
        className={`cbot__more ${expanded ? 'cbot__more--expanded' : ''}`}
      >
        {/* 2. INTRO */}
        <section className="cbot__sec">
          <span className="cbot__kicker">{CREW_INTRO_CONTENT.kicker}</span>
          <h3 className="cbot__h2">{CREW_INTRO_CONTENT.title}</h3>
          <p className="cbot__p">
            {CREW_INTRO_CONTENT.p1BeforeLink}
            <button
              type="button"
              className="cbot__ext-link"
              onClick={() => openExternal(CREW_INTRO_CONTENT.p1LinkHref)}
            >
              {CREW_INTRO_CONTENT.p1LinkLabel}
            </button>
            {CREW_INTRO_CONTENT.p1AfterLink}
          </p>
          <p className="cbot__p">{CREW_INTRO_CONTENT.p2}</p>
          <p className="cbot__p">{CREW_INTRO_CONTENT.p3}</p>
        </section>

        {/* 3. BENEFITS */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{CREW_BENEFITS_HEADER.kicker}</span>
            <h3 className="cbot__h2">{CREW_BENEFITS_HEADER.title}</h3>
          </div>

          <div className="cbot__benefits">
            {CREW_BENEFIT_BLOCKS.map(item => (
              <article key={item.id} id={item.id} className="cbot__benefit-card">
                <div className="cbot__benefit-top">
                  <span
                    className="cbot__benefit-icon"
                    style={{ background: item.grad }}
                    aria-hidden="true"
                  >
                    <CrewIcon icon={item.icon} size={20} stroke={item.ink} strokeWidth={1.8} />
                  </span>
                  <div className="cbot__benefit-titles">
                    <span className="cbot__kicker">{item.kicker}</span>
                    <h4 className="cbot__h3">{item.title}</h4>
                  </div>
                </div>
                <p className="cbot__p">{item.p1}</p>
                <p className="cbot__p">{item.p2}</p>
                <div className="cbot__benefit-links">
                  <Link
                    to={item.href}
                    className="cbot__lnk"
                    onClick={() => haptic.tap('light')}
                  >
                    {item.link} <span aria-hidden="true">←</span>
                  </Link>
                  <Link
                    to={item.href2}
                    className="cbot__lnk cbot__lnk--sec"
                    onClick={() => haptic.tap('light')}
                  >
                    {item.link2} <span aria-hidden="true">←</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. ACTIVATION STEPS */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{CREW_ACTIVATION_CONTENT.kicker}</span>
            <h3 className="cbot__h2">{CREW_ACTIVATION_CONTENT.title}</h3>
            <p className="cbot__p">{CREW_ACTIVATION_CONTENT.lead}</p>
          </div>

          <div className="cbot__steps">
            {CREW_ACTIVATION_CONTENT.steps.map(step => {
              const showExtraInfo =
                step.placeholderKey === 'CREW_ACTIVATION_INFO' &&
                CREW_ACTIVATION_INFO.trim().length > 0;
              return (
                <div key={step.num} className="cbot__step">
                  <span className="cbot__step-num">{step.num}</span>
                  <h4 className="cbot__step-title">{step.title}</h4>
                  <p className="cbot__step-text">
                    {step.text}
                    {showExtraInfo ? ` ${CREW_ACTIVATION_INFO.trim()}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. PRICE & DELIVERY */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{CREW_PRICE_DELIVERY_CONTENT.kicker}</span>
            <h3 className="cbot__h2">{CREW_PRICE_DELIVERY_CONTENT.title}</h3>
          </div>

          <div className="cbot__tiles">
            <div className="cbot__tile">
              <span className="cbot__tile-label">{CREW_PRICE_DELIVERY_CONTENT.tiles[0].label}</span>
              <strong className="cbot__tile-val cbot__tile-val--accent">
                {pricing.priceFormatted}
              </strong>
              <span className="cbot__tile-sub">{pricing.discountFormatted}</span>
            </div>

            <div className="cbot__tile">
              <span className="cbot__tile-label">{CREW_PRICE_DELIVERY_CONTENT.tiles[1].label}</span>
              <strong className="cbot__tile-val">{CREW_PRICE_DELIVERY_CONTENT.tiles[1].value}</strong>
              <span className="cbot__tile-sub">{CREW_PRICE_DELIVERY_CONTENT.tiles[1].sub}</span>
            </div>

            <div className="cbot__tile">
              <span className="cbot__tile-label">{CREW_PRICE_DELIVERY_CONTENT.tiles[2].label}</span>
              <strong className="cbot__tile-val cbot__tile-val--sm">
                {CREW_PRICE_DELIVERY_CONTENT.tiles[2].value}
              </strong>
              <span className="cbot__tile-sub">{CREW_PRICE_DELIVERY_CONTENT.tiles[2].sub}</span>
            </div>
          </div>

          <p className="cbot__p">
            {CREW_PRICE_DELIVERY_CONTENT.guideNoteBefore}
            <Link
              to={CREW_PRICE_DELIVERY_CONTENT.guideLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {CREW_PRICE_DELIVERY_CONTENT.guideLinkLabel}
            </Link>
            {CREW_PRICE_DELIVERY_CONTENT.guideNoteAfter}
          </p>
        </section>

        {/* 6. COMPARISON */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{CREW_COMPARISON_CONTENT.kicker}</span>
            <h3 className="cbot__h2">{CREW_COMPARISON_CONTENT.title}</h3>
          </div>
          <p className="cbot__p">{CREW_COMPARISON_CONTENT.p1}</p>
          <p className="cbot__p">
            {CREW_COMPARISON_CONTENT.p2BeforeVbucks}
            <Link
              to={CREW_COMPARISON_CONTENT.shopLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {CREW_COMPARISON_CONTENT.shopLinkLabel}
            </Link>
            {CREW_COMPARISON_CONTENT.p2BetweenLinks}
            <Link
              to={CREW_COMPARISON_CONTENT.vbucksLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {CREW_COMPARISON_CONTENT.vbucksLinkLabel}
            </Link>
            {CREW_COMPARISON_CONTENT.p2BeforeEpic}
            <button
              type="button"
              className="cbot__ext-link"
              onClick={() => openExternal(CREW_COMPARISON_CONTENT.epicLinkHref)}
            >
              {CREW_COMPARISON_CONTENT.epicLinkLabel}
            </button>
            {CREW_COMPARISON_CONTENT.p2AfterEpic}
          </p>

          <div className="cbot__table">
            <div className="cbot__table-head">{CREW_COMPARISON_CONTENT.tableHeader}</div>
            {CREW_COMPARISON_ROWS.map(row => (
              <div key={row.label} className="cbot__table-row">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
            <div className="cbot__table-total">
              <span>{CREW_COMPARISON_TOTAL.label}</span>
              <strong>{CREW_COMPARISON_TOTAL.value}</strong>
            </div>
          </div>
        </section>

        {/* 7. SUPPORT */}
        <section className="cbot__sec">
          <span className="cbot__kicker">{CREW_SUPPORT_CONTENT.kicker}</span>
          <h3 className="cbot__h2">{CREW_SUPPORT_CONTENT.title}</h3>
          <p className="cbot__p">
            {CREW_SUPPORT_CONTENT.pBeforeTerms}
            <Link
              to={CREW_SUPPORT_CONTENT.termsLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {CREW_SUPPORT_CONTENT.termsLinkLabel}
            </Link>
            {CREW_SUPPORT_CONTENT.pAfterTerms}
          </p>
        </section>

        {/* 8. RELATED LINKS */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{CREW_RELATED_HEADER.kicker}</span>
            <h3 className="cbot__h2">{CREW_RELATED_HEADER.title}</h3>
          </div>
          <div className="cbot__rel-chips">
            {CREW_RELATED_LINKS.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className="cbot__rel-chip"
                onClick={() => haptic.tap('light')}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        {/* 9. FAQ */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{CREW_FAQ_HEADER.kicker}</span>
            <h3 className="cbot__h2">{CREW_FAQ_HEADER.title}</h3>
            <p className="cbot__p">{CREW_FAQ_HEADER.subtitle}</p>
          </div>
          <div className="cbot__faqs">
            {CREW_FAQ_ITEMS.map(faq => (
              <details
                key={faq.id}
                className="cbot__faq"
                onToggle={() => haptic.select()}
              >
                <summary className="cbot__faq-sum">
                  <span>{faq.question}</span>
                  <span className="cbot__faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="cbot__faq-ans">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {expanded && (
          <div className="cbot__less-wrap">
            <button
              type="button"
              className="cbot__less-btn"
              onClick={() => {
                haptic.tap('light');
                setExpanded(false);
                document.getElementById('crew-bot-root')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              <span>بستن جزئیات و بازگشت به بالا</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* READ MORE GATE */}
      {!expanded && (
        <div className="cbot__gate">
          <div className="cbot__divider" aria-hidden="true">
            <span className="cbot__divider-line" />
            <span className="cbot__divider-diamond" />
            <span className="cbot__divider-line" />
          </div>
          <button
            type="button"
            className="cbot__more-btn"
            aria-expanded={expanded}
            aria-controls="crew-bot-more"
            onClick={() => {
              haptic.tap('medium');
              setExpanded(true);
            }}
          >
            <span className="cbot__more-glow" aria-hidden="true" />
            <span className="cbot__more-badge" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
              </svg>
            </span>
            <span className="cbot__more-text">
              <span className="cbot__more-title">بیشتر بخوانید</span>
              <span className="cbot__more-sub">
                مشاهده ۷ مزیت، مراحل فعال‌سازی و سؤالات متداول
              </span>
            </span>
            <span className="cbot__more-arrow" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

