import { ChevronLeft } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { faDigits } from '@/lib/format';
import { RANKS, getOrnamentSVGWrapper, getRingSVG } from '@/lib/ranks';
import { haptic } from '@/lib/telegram';
import { Icon3D, type Icon3DName } from '@/ui/Icon3D';

interface RankTierDetail {
  faName: string;
  rangeLabel: string;
  ornamentLabel: string;
  perk: string;
}

const RANK_TIER_DETAILS: Record<string, RankTierDetail> = {
  bronze: {
    faName: 'برنز',
    rangeLabel: '۰ تا ۱,۴۹۹ امتیاز',
    ornamentLabel: 'نشان لوزی برنزی',
    perk: 'شروع رقابت در تمام تورنومنت‌ها، ثبت آمار فصل و دریافت قاب آواتار برنزی',
  },
  silver: {
    faName: 'نقره',
    rangeLabel: '۱,۵۰۰ تا ۴,۹۹۹ امتیاز',
    ornamentLabel: 'نشان ستاره نقره‌ای',
    perk: 'ارتقای سید (Seed) اولیه در براکت مسابقات و قاب نقره‌ای درخشان در پروفایل',
  },
  gold: {
    faName: 'طلا',
    rangeLabel: '۵,۰۰۰ تا ۹,۹۹۹ امتیاز',
    ornamentLabel: 'نشان تاج طلایی',
    perk: 'جایگاه ویژه در سیدبندی دور اول براکت‌ها و نمایش تاج طلایی روی آواتار بازیکن و تیم',
  },
  platinum: {
    faName: 'پلاتینیوم',
    rangeLabel: '۱۰,۰۰۰ تا ۱۹,۹۹۹ امتیاز',
    ornamentLabel: 'نشان الماس بنفش',
    perk: 'اولویت دریافت استراحت دور اول (Bye) در جداول غیرکامل و قرارگیری در صدر لیدربرد',
  },
  titan: {
    faName: 'تایتان',
    rangeLabel: '+۲۰,۰۰۰ امتیاز',
    ornamentLabel: 'نشان اسطوره‌ای تایتان با چشمان درخشان',
    perk: 'بالاترین سید ممکن در تمام تورنومنت‌ها، قاب سرخ-مشکی تایتان و جایگاه تالار افتخارات فصل',
  },
};

const RANK_MECHANICS: {
  icon: Icon3DName;
  badge: string;
  title: string;
  desc: string;
  tone: string;
}[] = [
  {
    icon: 'trophy',
    badge: '+۲۵ تا +۱,۰۰۰ امتیاز',
    title: 'نحوه کسب امتیاز رنک (Points)',
    desc: 'با پیروزی در هر مسابقه از جدول براکت ۲۵ امتیاز رنک می‌گیرید. نفرات و تیم‌های برتر هر تورنومنت (رتبه‌های اول تا سوم) نیز پاداش امتیازی ویژه جدول (از ۱۵۰ تا ۱,۰۰۰ امتیاز) دریافت می‌کنند.',
    tone: '245 158 11',
  },
  {
    icon: 'high-voltage',
    badge: '+۱۲۰ XP برد / +۴۰ XP حضور',
    title: 'تفاوت امتیاز رنک با تجربه (XP) و لول',
    desc: 'امتیاز رنک سطح رقابتی شما (برنز تا تایتان) را مشخص می‌کند، اما XP نشان‌دهنده سابقه فعالیت شماست. در هر بازی برنده ۱۲۰ XP و بازنده ۴۰ XP می‌گیرد و با فرمول 500 + (Level × 300) لول ارتقا می‌یابد.',
    tone: '56 200 232',
  },
  {
    icon: 'crossed-swords',
    badge: 'سیدبندی هوشمند',
    title: 'تاثیر رنک در براکت و مسابقات تیمی',
    desc: 'در مسابقات تیمی امتیاز هم به تیم و هم به بازیکنان حاضر در ترکیب (Roster) اضافه می‌شود. همچنین جدول براکت بر اساس امتیاز سیدبندی می‌شود تا تیم‌های قوی در دور اول به هم نخورند.',
    tone: '157 111 255',
  },
  {
    icon: 'crown',
    badge: '۵ نشان افتخار',
    title: 'نشان‌های افتخار (Badges) پروفایل',
    desc: 'با فتح فینال هر تورنومنت، نشان «قهرمان (Champion)» به‌صورت خودکار به پروفایل شما اضافه می‌شود. نشان‌های «استاد برد پیاپی»، «کهنه‌کار»، «سلطان هدشات» و «استاد کلاچ» نیز رکوردهای شما را نمایش می‌دهند.',
    tone: '226 69 63',
  },
];

export function RanksShowcase({ variant = 'hub' }: { variant?: 'hub' | 'article' }) {
  return (
    <section className="g-ranks clay" aria-labelledby="bot-ranks-title">
      <div className="g-ranks__head">
        <span className="g-ranks__kicker">
          <Icon3D name="crown" size={18} />
          سیستم رنک‌بندی و امتیازات تایتان
        </span>
        <h2 id="bot-ranks-title" className="g-ranks__title">
          آموزش کامل رنک‌های سایت، امتیازات (Points) و مسیر صعود تا تایتان
        </h2>
        <p className="g-ranks__sub">
          در تایتان هر بازیکن و هر تیم بر اساس امتیازهای کسب‌شده در تورنومنت‌ها در یکی از ۵ سطح رنک قرار می‌گیرد. رنک شما قاب آواتار، رتبه در لیدربرد و سیدبندی جدول مسابقات را تعیین می‌کند.
        </p>
      </div>

      {/* 5 Rank Tiers */}
      <div className="g-ranks__tiers">
        {RANKS.map((rank, index) => {
          const detail = RANK_TIER_DETAILS[rank.id] ?? RANK_TIER_DETAILS.bronze;
          const uid = `-bot-${variant}-${rank.id}`;
          return (
            <div
              key={rank.id}
              className="g-tier-card"
              style={
                {
                  '--rank-from': rank.from,
                  '--rank-to': rank.to,
                  '--rank-glow': rank.glow,
                } as CSSProperties
              }
            >
              <div className="g-tier-card__row">
                <span
                  className="rank-avatar g-tier-card__avatar"
                  style={{ '--size': '56px', '--scale': 56 / 68 } as CSSProperties}
                >
                  <span
                    className="rank-frame-wrap"
                    data-tier={rank.id}
                    style={{ '--tier-glow': rank.glow } as CSSProperties}
                    aria-hidden
                  >
                    <span className="rank-frame-glow" />
                    <span className="rank-frame-ring">{getRingSVG(rank, uid)}</span>
                    <span className="rank-avatar__picture g-tier-card__num num">
                      {faDigits(index + 1)}
                    </span>
                    <span className="rank-frame-ornament">{getOrnamentSVGWrapper(rank, uid)}</span>
                  </span>
                </span>

                <div className="g-tier-card__info">
                  <div className="g-tier-card__title-row">
                    <strong style={{ color: rank.from }}>{detail.faName}</strong>
                    <span className="g-tier-card__en">{rank.name}</span>
                    <span className="g-tier-card__pts num">{rank.pts}</span>
                  </div>
                  <div className="g-tier-card__motto">«{rank.desc}»</div>
                  <div className="g-tier-card__range">{detail.rangeLabel} · {detail.ornamentLabel}</div>
                </div>
              </div>
              <p className="g-tier-card__perk">{detail.perk}</p>
            </div>
          );
        })}
      </div>

      {/* 4 Mechanics Cards */}
      <div className="g-ranks__mechs">
        {RANK_MECHANICS.map(item => (
          <div key={item.title} className="g-mech-card" style={{ '--tone': item.tone } as CSSProperties}>
            <div className="g-mech-card__head">
              <span className="tone-icon g-mech-card__icon">
                <Icon3D name={item.icon} size={22} />
              </span>
              <span className="g-mech-card__badge">{item.badge}</span>
            </div>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      {variant === 'hub' && (
        <div className="g-ranks__actions">
          <Link to="/guides/ranks" className="btn btn--primary btn--block" onClick={() => haptic.tap()}>
            <span>مطالعه آموزش کامل رنک‌ها و سوالات متداول</span>
            <ChevronLeft size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}
