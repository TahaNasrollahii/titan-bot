import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronDown, ChevronLeft, Clock, Share2 } from 'lucide-react';
import { Fragment, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { guidesApi } from '@/api/endpoints';
import type { Guide as GuideType } from '@/api/types';
import { miniAppLink } from '@/lib/env';
import { faDigits } from '@/lib/format';
import { gameIcon } from '@/lib/media';
import { haptic, openExternal, shareLink } from '@/lib/telegram';
import { ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import { GuideRowCard } from './Guides';
import { RanksShowcase } from './RanksShowcase';
import {
  cleanGuideFaqs,
  cleanGuideText,
  guideCategoryMeta,
  mapGuideHref,
  readingMinutes,
} from './guidesData';
import './guides.css';

export default function Guide() {
  const { slug = '' } = useParams();
  const guideQuery = useQuery({
    queryKey: ['guide', slug],
    queryFn: () => guidesApi.get(slug),
    staleTime: 5 * 60_000,
  });

  if (guideQuery.isError) {
    return (
      <Screen title="آموزش" fallback="/guides">
        <ErrorState error={guideQuery.error} onRetry={() => guideQuery.refetch()} />
      </Screen>
    );
  }

  if (!guideQuery.data) {
    return (
      <Screen title="آموزش" fallback="/guides">
        <div className="stack">
          <Skeleton h={180} r={26} />
          <Skeleton h={220} r={22} />
          <Skeleton h={160} r={22} />
        </div>
      </Screen>
    );
  }

  return <GuideView guide={guideQuery.data} />;
}

function GuideView({ guide }: { guide: GuideType }) {
  const cat = guideCategoryMeta(guide.category);
  const gIcon = guide.game ? gameIcon(guide.game.slug, guide.game.iconImage) : null;
  const minutes = readingMinutes(guide.body);
  const summary = cleanGuideText(guide.summary);
  const faqs = cleanGuideFaqs(guide.faqs ?? []);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const primaryAction = guide.products?.[0]
    ? { to: `/product/${guide.products[0].slug}`, label: `خرید ${guide.products[0].title}` }
    : guide.game
      ? { to: `/store/${guide.game.slug}`, label: `فروشگاه ${guide.game.title}` }
      : guide.category === 'tournament'
        ? { to: '/tournaments', label: 'مشاهده تورنومنت‌ها' }
        : { to: '/store', label: 'ورود به فروشگاه' };

  return (
    <Screen
      title={guide.title}
      fallback="/guides"
      actions={
        <button
          type="button"
          className="icon-btn"
          aria-label="اشتراک‌گذاری آموزش"
          onClick={() => {
            haptic.tap();
            shareLink(miniAppLink(`guide-${guide.slug}`), `📘 ${guide.title}`);
          }}
        >
          <Share2 size={18} />
        </button>
      }
    >
      {/* Article Hero */}
      <header
        className="ga-hero clay"
        style={{ '--accent': guide.game?.accentColor || cat.accent, '--tone': cat.tone } as CSSProperties}
      >
        <div className="ga-hero__meta">
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
          <span className="ga-hero__time num">
            <Clock size={13} /> {faDigits(minutes)} دقیقه مطالعه
          </span>
        </div>

        <h1 className="ga-hero__title">{guide.title}</h1>
        {summary && <p className="ga-hero__summary">{summary}</p>}

        <div className="ga-hero__actions">
          <Link to={primaryAction.to} className="btn btn--primary btn--sm" onClick={() => haptic.tap()}>
            <span>{primaryAction.label}</span>
            <ChevronLeft size={16} />
          </Link>
          <Link to="/guides" className="btn btn--glass btn--sm" onClick={() => haptic.tap()}>
            <BookOpen size={15} />
            <span>همه آموزش‌ها</span>
          </Link>
        </div>
      </header>

      {/* Interactive 5-Tier Ranks Showcase when viewing /guides/ranks */}
      {guide.slug === 'ranks' && (
        <div className="section">
          <RanksShowcase variant="article" />
        </div>
      )}

      {/* Article Body */}
      <article className="ga-body clay section">
        <GuideMarkdownBody body={guide.body} />
      </article>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">سوالات متداول</h2>
            <span className="text-xs muted num">{faDigits(faqs.length)} سوال</span>
          </div>
          <div className="stack">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.question} className={`ga-faq clay ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="ga-faq__q"
                    aria-expanded={isOpen}
                    onClick={() => {
                      haptic.select();
                      setOpenFaq(isOpen ? null : idx);
                    }}
                  >
                    <span className="ga-faq__num num">{faDigits(idx + 1)}</span>
                    <strong>{faq.question}</strong>
                    <ChevronDown size={18} className="ga-faq__chev" />
                  </button>
                  {isOpen && <div className="ga-faq__a">{renderInline(faq.answer)}</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Guides */}
      {guide.related && guide.related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">آموزش‌های مرتبط</h2>
          </div>
          <div className="stack">
            {guide.related.map(rel => (
              <GuideRowCard key={rel.slug} guide={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Support CTA */}
      <section className="ga-support clay section">
        <span className="tone-icon ga-support__icon" style={{ '--tone': '226 69 63' } as CSSProperties}>
          <Icon3D name="headphone" size={26} />
        </span>
        <div className="ga-support__copy">
          <strong>سوال یا ابهامی دارید؟</strong>
          <p>پشتیبانی آنلاین تایتان در تمام مراحل خرید و تورنومنت کنار شماست.</p>
        </div>
        <Link to="/support" className="btn btn--glass btn--sm" onClick={() => haptic.tap()}>
          گفت‌وگو
        </Link>
      </section>
    </Screen>
  );
}

/* ─── Lightweight Markdown Renderer for Bot Guides ─── */
const INLINE_TOKEN = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

function renderInline(raw: string): ReactNode[] {
  const text = cleanGuideText(raw);
  return text.split(INLINE_TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="ga-code" dir="ltr">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, rawHref] = link;
      if (rawHref.startsWith('/')) {
        const mapped = mapGuideHref(rawHref);
        return (
          <Link key={i} to={mapped} className="ga-link" onClick={() => haptic.tap()}>
            {cleanGuideText(label)}
          </Link>
        );
      }
      if (/^https?:\/\//i.test(rawHref)) {
        return (
          <button
            key={i}
            type="button"
            className="ga-link"
            onClick={() => openExternal(rawHref)}
          >
            {cleanGuideText(label)}
          </button>
        );
      }
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function GuideMarkdownBody({ body }: { body: string }) {
  const blocks = body
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/);

  return (
    <div className="ga-prose">
      {blocks.map((block, index) => {
        const lines = block
          .split('\n')
          .map(l => cleanGuideText(l))
          .filter(Boolean);
        if (lines.length === 0) return null;

        if (lines.length === 1 && lines[0].startsWith('## ')) {
          return (
            <h2 key={index} className="ga-h2">
              {renderInline(lines[0].slice(3))}
            </h2>
          );
        }

        if (lines.length === 1 && lines[0].startsWith('### ')) {
          return (
            <h3 key={index} className="ga-h3">
              {renderInline(lines[0].slice(4))}
            </h3>
          );
        }

        if (lines.every(line => line.startsWith('> '))) {
          const text = lines.map(line => line.slice(2)).join(' ');
          const isWarning = /^(هشدار|مهم|توجه)\s*[:：]/.test(text);
          return (
            <aside key={index} className={`ga-callout ${isWarning ? 'ga-callout--warn' : ''}`}>
              <Icon3D name={isWarning ? 'fire' : 'sparkles'} size={22} />
              <div>{renderInline(text)}</div>
            </aside>
          );
        }

        if (lines.every(line => /^[-•]\s+/.test(line))) {
          return (
            <ul key={index} className="ga-ul">
              {lines.map((line, itemIndex) => (
                <li key={itemIndex}>{renderInline(line.replace(/^[-•]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        if (lines.every(line => /^[0-9۰-۹]+[.)]\s+/.test(line))) {
          return (
            <ol key={index} className="ga-steps">
              {lines.map((line, itemIndex) => (
                <li key={itemIndex} className="ga-step">
                  <span className="ga-step__num num">{faDigits(itemIndex + 1)}</span>
                  <div className="ga-step__body">
                    {renderInline(line.replace(/^[0-9۰-۹]+[.)]\s+/, ''))}
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="ga-p">
            {renderInline(lines.join(' '))}
          </p>
        );
      })}
    </div>
  );
}
