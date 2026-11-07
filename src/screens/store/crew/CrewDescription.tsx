import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { Link } from 'react-router';

import type { Product, ProductVariant } from '@/api/types';
import { haptic, openExternal } from '@/lib/telegram';

import { CREW_ACTIVATION_INFO } from './content';
import { CrewIcon } from './CrewIcon';
import {
  getFortniteBotTemplate,
  resolveFortniteBotPricing,
} from './fortniteTemplates';
import './crew.css';

interface CrewBotDescriptionProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
}

export function CrewBotDescription({
  product,
  selectedVariant = null,
}: CrewBotDescriptionProps) {
  const currentSlug = product.slug || 'fortnite-crew';
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const expanded = expandedSlug === currentSlug;
  const setExpanded = (next: boolean) => {
    setExpandedSlug(next ? currentSlug : null);
  };

  const [activeState, setActiveState] = useState<{ slug: string; idx: number }>({
    slug: currentSlug,
    idx: 0,
  });
  const startXRef = useRef<number | null>(null);
  const draggedRef = useRef(false);

  const template = getFortniteBotTemplate(product.slug, product);
  const pricing = resolveFortniteBotPricing(template, product, selectedVariant);
  const items = template.benefitBlocks;
  const n = items.length;
  const active =
    activeState.slug === currentSlug ? ((activeState.idx % n) + n) % n : 0;

  const go = (index: number) => {
    haptic.select();
    setActiveState({
      slug: currentSlug,
      idx: ((index % n) + n) % n,
    });
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

          <p className="cbot__hint">{template.hero.carouselHint}</p>
        </div>

        <div className="cbot__hero-text">
          <span className="cbot__eyebrow">{template.hero.eyebrow}</span>
          <h3 className="cbot__h-main">{template.hero.title}</h3>
          <p className="cbot__p">{template.hero.lead}</p>
          <div className="cbot__chips">
            {template.hero.factChips.map(chip => (
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
          <span className="cbot__kicker">{template.intro.kicker}</span>
          <h3 className="cbot__h2">{template.intro.title}</h3>
          <p className="cbot__p">
            {template.intro.p1BeforeLink}
            <button
              type="button"
              className="cbot__ext-link"
              onClick={() => openExternal(template.intro.p1LinkHref)}
            >
              {template.intro.p1LinkLabel}
            </button>
            {template.intro.p1AfterLink}
          </p>
          <p className="cbot__p">{template.intro.p2}</p>
          <p className="cbot__p">{template.intro.p3}</p>
        </section>

        {/* 3. BENEFITS */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{template.benefitsHeader.kicker}</span>
            <h3 className="cbot__h2">{template.benefitsHeader.title}</h3>
          </div>

          <div className="cbot__benefits">
            {items.map(item => (
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
            <span className="cbot__kicker">{template.activation.kicker}</span>
            <h3 className="cbot__h2">{template.activation.title}</h3>
            <p className="cbot__p">{template.activation.lead}</p>
          </div>

          <div className="cbot__steps">
            {template.activation.steps.map(step => {
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
            <span className="cbot__kicker">{template.priceDelivery.kicker}</span>
            <h3 className="cbot__h2">{template.priceDelivery.title}</h3>
          </div>

          <div className="cbot__tiles">
            <div className="cbot__tile">
              <span className="cbot__tile-label">{pricing.tile1Label}</span>
              <strong className="cbot__tile-val cbot__tile-val--accent">
                {pricing.priceFormatted}
              </strong>
              <span className="cbot__tile-sub">{pricing.discountFormatted}</span>
            </div>

            <div className="cbot__tile">
              <span className="cbot__tile-label">{template.priceDelivery.tile2Label}</span>
              <strong className="cbot__tile-val">{template.priceDelivery.tile2Value}</strong>
              <span className="cbot__tile-sub">{template.priceDelivery.tile2Sub}</span>
            </div>

            <div className="cbot__tile">
              <span className="cbot__tile-label">{template.priceDelivery.tile3Label}</span>
              <strong className="cbot__tile-val cbot__tile-val--sm">
                {template.priceDelivery.tile3Value}
              </strong>
              <span className="cbot__tile-sub">{template.priceDelivery.tile3Sub}</span>
            </div>
          </div>

          <p className="cbot__p">
            {template.priceDelivery.guideNoteBefore}
            <Link
              to={template.priceDelivery.guideLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {template.priceDelivery.guideLinkLabel}
            </Link>
            {template.priceDelivery.guideNoteAfter}
          </p>
        </section>

        {/* 6. COMPARISON */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{template.comparison.kicker}</span>
            <h3 className="cbot__h2">{template.comparison.title}</h3>
          </div>
          <p className="cbot__p">{template.comparison.p1}</p>
          <p className="cbot__p">
            {template.comparison.p2BeforeVbucks}
            <Link
              to={template.comparison.shopLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {template.comparison.shopLinkLabel}
            </Link>
            {template.comparison.p2BetweenLinks}
            <Link
              to={template.comparison.vbucksLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {template.comparison.vbucksLinkLabel}
            </Link>
            {template.comparison.p2BeforeEpic}
            <button
              type="button"
              className="cbot__ext-link"
              onClick={() => openExternal(template.comparison.epicLinkHref)}
            >
              {template.comparison.epicLinkLabel}
            </button>
            {template.comparison.p2AfterEpic}
          </p>

          <div className="cbot__table">
            <div className="cbot__table-head">{template.comparison.tableHeader}</div>
            {template.comparison.rows.map(row => (
              <div key={row.label} className="cbot__table-row">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
            <div className="cbot__table-total">
              <span>{template.comparison.total.label}</span>
              <strong>{template.comparison.total.value}</strong>
            </div>
          </div>
        </section>

        {/* 7. SUPPORT */}
        <section className="cbot__sec">
          <span className="cbot__kicker">{template.support.kicker}</span>
          <h3 className="cbot__h2">{template.support.title}</h3>
          <p className="cbot__p">
            {template.support.pBeforeTerms}
            <Link
              to={template.support.termsLinkHref}
              className="cbot__inline-link"
              onClick={() => haptic.tap('light')}
            >
              {template.support.termsLinkLabel}
            </Link>
            {template.support.pAfterTerms}
          </p>
        </section>

        {/* 8. RELATED LINKS */}
        <section className="cbot__sec">
          <div className="cbot__sec-head">
            <span className="cbot__kicker">{template.relatedHeader.kicker}</span>
            <h3 className="cbot__h2">{template.relatedHeader.title}</h3>
          </div>
          <div className="cbot__rel-chips">
            {template.relatedLinks.map(item => (
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
            <span className="cbot__kicker">{template.faqHeader.kicker}</span>
            <h3 className="cbot__h2">{template.faqHeader.title}</h3>
            <p className="cbot__p">{template.faqHeader.subtitle}</p>
          </div>
          <div className="cbot__faqs">
            {template.faqItems.map(faq => (
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
              <span className="cbot__more-sub">{template.readMoreSub}</span>
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
