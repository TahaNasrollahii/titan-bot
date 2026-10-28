import { useQuery } from '@tanstack/react-query';
import { Clock, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';

import { fetchFortniteShop, type ShopEntry, type ShopFilterCategory } from '@/api/fortnite';
import { countdown, faDigits, num } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import { Empty } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { Skeleton } from '@/ui/Skeleton';

import './fortnite.css';

const VBUCKS_PRODUCT = '/product/fortnite-vbucks';

const CATEGORIES: { value: ShopFilterCategory; label: string }[] = [
  { value: 'all', label: 'همه' },
  { value: 'bundle', label: 'باندل' },
  { value: 'outfit', label: 'اسکین' },
  { value: 'emote', label: 'ایموت' },
  { value: 'pickaxe', label: 'پیکاکس' },
  { value: 'backpack', label: 'کوله' },
  { value: 'glider', label: 'گلایدر' },
  { value: 'wrap', label: 'رپ' },
  { value: 'other', label: 'سایر' },
];

export default function FortniteShop() {
  const shop = useQuery({
    queryKey: ['fortnite-shop'],
    queryFn: ({ signal }) => fetchFortniteShop(signal),
    staleTime: 10 * 60_000,
  });
  const [category, setCategory] = useState<ShopFilterCategory>('all');
  const [inspected, setInspected] = useState<ShopEntry | null>(null);

  const sections = useMemo(() => {
    if (!shop.data) return [];
    return shop.data.sections
      .map(section => ({
        ...section,
        entries: category === 'all' ? section.entries : section.entries.filter(e => e.category === category),
      }))
      .filter(section => section.entries.length > 0);
  }, [shop.data, category]);

  return (
    <Screen title="آیتم‌شاپ فورتنایت" fallback="/store" noTabs>
      <div className="fn-head">
        <div>
          <strong>شاپ امروز</strong>
          {shop.data && <span className="muted text-xs num">{faDigits(shop.data.totalEntries)} آیتم</span>}
        </div>
        {shop.data && <ResetTimer at={shop.data.resetsAt} />}
      </div>

      <div className="rail chips-rail" style={{ marginTop: 14 }}>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            className="chip"
            aria-pressed={category === c.value}
            onClick={() => {
              haptic.select();
              setCategory(c.value);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {shop.isError ? (
        <Empty icon={<Icon3D name="hourglass-not-done" size={52} />} title="شاپ در دسترس نیست" text="چند لحظه دیگر دوباره سر بزن." />
      ) : !shop.data ? (
        <div className="fn-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} h={210} r={18} />
          ))}
        </div>
      ) : (
        sections.map(section => (
          <section key={section.id} className="section fn-section">
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              {section.nameFa || section.name}
            </h2>
            <div className="fn-grid">
              {section.entries.map(entry => (
                <ShopCard key={entry.id} entry={entry} vbuck={shop.data.vbuckIcon} onOpen={() => setInspected(entry)} />
              ))}
            </div>
          </section>
        ))
      )}

      <div className="action-bar">
        <Link to={VBUCKS_PRODUCT} className="btn btn--primary btn--block btn--lg" onClick={() => haptic.tap('medium')}>
          <ShoppingCart size={20} /> خرید وی‌باکس
        </Link>
      </div>

      <Sheet open={inspected !== null} onClose={() => setInspected(null)} title={inspected?.name}>
        {inspected && shop.data && <EntryDetail entry={inspected} vbuck={shop.data.vbuckIcon} />}
      </Sheet>
    </Screen>
  );
}

function ResetTimer({ at }: { at: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = countdown(at, now);
  if (!left) return <span className="badge badge--amber">در حال به‌روزرسانی</span>;
  const pad = (n: number) => faDigits(String(n).padStart(2, '0'));
  return (
    <span className="fn-timer num" aria-label="زمان تا تعویض شاپ">
      <Clock size={14} />
      {pad(left.hours + left.days * 24)}:{pad(left.minutes)}:{pad(left.seconds)}
    </span>
  );
}

function ShopCard({ entry, vbuck, onOpen }: { entry: ShopEntry; vbuck: string; onOpen: () => void }) {
  const style = {
    '--rarity': entry.rarityColor,
    '--card-a': entry.cardColors?.primary ? `#${entry.cardColors.primary.replace('#', '').slice(0, 6)}` : entry.rarityColor,
    '--card-b': entry.cardColors?.secondary ? `#${entry.cardColors.secondary.replace('#', '').slice(0, 6)}` : '#1a0c2e',
  } as CSSProperties;
  return (
    <button
      className="fn-card"
      style={style}
      onClick={() => {
        haptic.tap();
        onOpen();
      }}
    >
      <Img src={entry.image} alt={entry.name} />
      {entry.banner && <span className="fn-card__banner">{entry.banner}</span>}
      <div className="fn-card__info">
        <strong>{entry.name}</strong>
        <span className="fn-card__price num">
          <img src={vbuck} alt="" width={14} height={14} />
          {num(entry.finalPrice)}
          {entry.discountAmount > 0 && <s>{num(entry.regularPrice)}</s>}
        </span>
      </div>
    </button>
  );
}

function EntryDetail({ entry, vbuck }: { entry: ShopEntry; vbuck: string }) {
  return (
    <div className="stack" style={{ '--gap': '14px' } as CSSProperties}>
      <div className="fn-detail" style={{ '--rarity': entry.rarityColor } as CSSProperties}>
        <Img src={entry.image} alt={entry.name} contain />
      </div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <span className="badge" style={{ color: entry.rarityColor }}>
          {entry.rarityFa}
        </span>
        <span className="badge">{entry.typeFa}</span>
        {entry.giftable && <span className="badge badge--green">قابل گیفت</span>}
      </div>
      {entry.description && <p className="muted text-sm">{entry.description}</p>}
      {entry.isBundle && entry.bundleItems.length > 0 && (
        <div className="fn-bundle">
          {entry.bundleItems.map(item => (
            <div key={item.id} style={{ '--rarity': item.rarityColor } as CSSProperties}>
              <Img src={item.image} alt={item.name} contain />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
      <div className="fn-detail__price num">
        <img src={vbuck} alt="" width={22} height={22} />
        {num(entry.finalPrice)} وی‌باکس
      </div>
      <Link to={VBUCKS_PRODUCT} className="btn btn--primary btn--block btn--lg">
        <ShoppingCart size={20} /> خرید وی‌باکس برای این آیتم
      </Link>
    </div>
  );
}
