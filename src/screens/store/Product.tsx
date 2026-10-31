import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, BookOpen, ChevronLeft, Heart, Minus, Plus, ShoppingCart, Star, Zap } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { errorText } from '@/api/client';
import { cartApi, catalogApi, guidesApi } from '@/api/endpoints';
import type { Product as ProductType, ProductVariant } from '@/api/types';
import { faDigits, num, timeAgo } from '@/lib/format';
import { productImage } from '@/lib/media';
import { keys } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { ProductCard, productAccent } from '@/ui/cards';
import { ErrorState } from '@/ui/Empty';
import { Icon3D, type Icon3DName } from '@/ui/Icon3D';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import './product.css';
import { enrichProductSeo, getProductKeywords, parseDescriptionBlocks } from './productSeo';

const FEATURE_ICONS: Record<string, Icon3DName> = {
  flame: 'fire',
  shield: 'shield',
  chat: 'speech-balloon',
  clock: 'hourglass-not-done',
  zap: 'high-voltage',
  truck: 'package',
};

export default function Product() {
  const { slug = '' } = useParams();
  const product = useQuery({ queryKey: ['product', slug], queryFn: () => catalogApi.product(slug) });

  if (product.isError)
    return (
      <Screen title="محصول" fallback="/store">
        <ErrorState error={product.error} onRetry={() => product.refetch()} />
      </Screen>
    );
  if (!product.data)
    return (
      <Screen title="محصول" fallback="/store" noTabs>
        <div className="stack">
          <Skeleton h={300} r={28} />
          <Skeleton h={28} w="70%" />
          <Skeleton h={18} w="40%" />
          <Skeleton h={120} r={20} />
        </div>
      </Screen>
    );
  return <ProductView product={enrichProductSeo(product.data)} />;
}

function ProductView({ product }: { product: ProductType }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const firstInStock = product.variants.find(v => v.inStock) ?? product.variants[0] ?? null;
  const [variant, setVariant] = useState<ProductVariant | null>(firstInStock);
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [wished, setWished] = useState(product.isWishlisted);

  const related = useQuery({ queryKey: ['related', product.slug], queryFn: () => catalogApi.related(product.slug) });
  const reviews = useQuery({ queryKey: ['reviews', product.slug], queryFn: () => catalogApi.reviews(product.slug) });
  const productGuides = useQuery({
    queryKey: ['guides', { product: product.slug }],
    queryFn: () => guidesApi.list({ product: product.slug }),
    staleTime: 5 * 60_000,
  });
  const primaryGuide =
    productGuides.data?.find(g => g.category === 'purchase') ?? productGuides.data?.[0] ?? null;

  const unit = variant ? variant.price : product.price;
  const unitOld = variant ? variant.originalPrice : product.originalPrice;
  const available = product.inStock && (!variant || variant.inStock) && unit !== null;
  const maxQty = product.stock ?? 10;

  const add = useMutation({
    mutationFn: () => cartApi.add({ product: product.slug, variant: variant?.id ?? null, quantity }),
    onSuccess: cart => queryClient.setQueryData(keys.cart, cart),
  });

  const [intent, setIntent] = useState<'cart' | 'buy' | null>(null);

  async function addToCart(then: 'cart' | 'buy') {
    setIntent(then);
    try {
      await add.mutateAsync();
      if (then === 'buy') navigate('/checkout');
      else toast.success('به سبد خرید اضافه شد');
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setIntent(null);
    }
  }

  const wish = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) await catalogApi.addToWishlist(product.slug);
      else await catalogApi.removeFromWishlist(product.slug);
    },
    onMutate: next => {
      setWished(next);
      haptic.tap(next ? 'medium' : 'light');
    },
    onError: (error, next) => {
      setWished(!next);
      toast.error(errorText(error));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const accent = { '--accent': productAccent(product) } as CSSProperties;
  const primaryImg = productImage(product);
  const images = Array.from(new Set([primaryImg, ...product.gallery.map(g => g.image)].filter(Boolean))) as string[];
  const [shown, setShown] = useState(0);

  return (
    <Screen
      title={product.title}
      fallback="/store"
      noTabs
      actions={
        <button
          className="icon-btn"
          aria-pressed={wished}
          aria-label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          onClick={() => wish.mutate(!wished)}
        >
          <Heart size={20} fill={wished ? 'var(--red)' : 'none'} color={wished ? 'var(--red)' : 'currentColor'} />
        </button>
      }
    >
      <div className="pd" style={accent}>
        <div className="pd__media">
          <Img src={images[shown]} alt={product.imageAlt || product.title} contain priority />
          {product.discountPercent > 0 && <span className="clay clay--red pd__off num">٪{faDigits(product.discountPercent)} تخفیف</span>}
        </div>
        {images.length > 1 && (
          <div className="pd__thumbs">
            {images.map((src, i) => (
              <button key={src} aria-pressed={i === shown} onClick={() => setShown(i)} aria-label={`تصویر ${i + 1}`}>
                <Img src={src} alt="" contain />
              </button>
            ))}
          </div>
        )}

        <div className="pd__head">
          {product.game && <span className="pd__game">{product.game.title}</span>}
          <h1 className="pd__title">{product.title}</h1>
          {product.subtitle && <p className="pd__sub">{product.subtitle}</p>}
          <div className="row" style={{ '--gap': '8px', flexWrap: 'wrap' } as CSSProperties}>
            {product.rating > 0 && (
              <span className="pd__rating num">
                <Star size={14} fill="currentColor" /> {faDigits(product.rating.toFixed(1))}
                <small>({faDigits(product.reviewCount)} نظر)</small>
              </span>
            )}
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {product.variants.length > 0 && (
          <section className="pd__section">
            <h2 className="pd__label">انتخاب بسته</h2>
            <div className="variants" role="radiogroup" aria-label="بسته‌ها">
              {product.variants.map(v => (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={variant?.id === v.id}
                  disabled={!v.inStock}
                  className="variant"
                  onClick={() => {
                    haptic.select();
                    setVariant(v);
                  }}
                >
                  <strong>{v.label}</strong>
                  <span className="num">{num(v.price)} ت</span>
                  {v.discountPercent > 0 && <em className="num">٪{faDigits(v.discountPercent)}</em>}
                  {!v.inStock && <small>ناموجود</small>}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="pd__section row">
          <h2 className="pd__label" style={{ margin: 0 }}>
            تعداد
          </h2>
          <div className="spacer" />
          <div className="stepper">
            <button aria-label="افزایش" disabled={quantity >= maxQty} onClick={() => (haptic.select(), setQuantity(q => q + 1))}>
              <Plus size={18} />
            </button>
            <span className="num">{faDigits(quantity)}</span>
            <button aria-label="کاهش" disabled={quantity <= 1} onClick={() => (haptic.select(), setQuantity(q => q - 1))}>
              <Minus size={18} />
            </button>
          </div>
        </section>

        {product.features.length > 0 && (
          <div className="pd__features">
            {product.features.map(f => {
              const icon = FEATURE_ICONS[f.icon] ?? 'check-mark-button';
              return (
                <div key={f.title} className="pd__feature">
                  <Icon3D name={icon} size={30} />
                  <strong>{f.title}</strong>
                  <span>{f.description}</span>
                </div>
              );
            })}
          </div>
        )}

        {product.deliveryInfo && (
          <div className="pd__delivery">
            <Icon3D name="high-voltage" size={24} /> {product.deliveryInfo}
          </div>
        )}

        <Link
          to={primaryGuide ? `/guides/${primaryGuide.slug}` : '/guides/how-to-buy'}
          className="clay list-row card--press"
          style={{ borderRadius: 18, padding: '12px 14px', marginTop: 12 }}
          onClick={() => haptic.tap()}
        >
          <span className="tone-icon list-row__icon" style={{ '--tone': '157 111 255' } as CSSProperties}>
            <BookOpen size={19} />
          </span>
          <div className="list-row__body">
            <div className="list-row__title">
              {primaryGuide ? primaryGuide.title : 'آموزش نحوه خرید و فعال‌سازی این محصول'}
            </div>
            <div className="list-row__sub">راهنمای گام‌به‌گام تحویل و نکات امنیتی</div>
          </div>
          <ChevronLeft size={18} className="list-row__chev" />
        </Link>

        {product.description && (
          <section className="pd__section">
            <h2 className="pd__label">توضیحات</h2>
            <div className={`pd__desc ${expanded ? 'is-open' : ''}`}>
              {parseDescriptionBlocks(product.description).map((block, i) => {
                if (block.type === 'heading') {
                  return (
                    <h3 key={i} className="pd__desc-heading">
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <ul key={i} className="pd__desc-list">
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{block.text}</p>;
              })}
            </div>
            {product.description.length > 220 && (
              <button className="section-link" onClick={() => setExpanded(e => !e)}>
                {expanded ? 'بستن' : 'ادامه‌ی توضیحات'}
              </button>
            )}
            {getProductKeywords(product).length > 0 && (
              <div className="pd__keywords">
                <span className="pd__keywords-label">کلمات کلیدی:</span>
                <div className="pd__keywords-list">
                  {getProductKeywords(product).map(kw => (
                    <span key={kw} className="pd__keyword-chip">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {Object.entries(product.specs).filter(([k]) => k !== 'keywords').length > 0 && (
          <section className="pd__section">
            <h2 className="pd__label">مشخصات</h2>
            <dl className="specs">
              {Object.entries(product.specs)
                .filter(([k]) => k !== 'keywords')
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{SPEC_LABELS[k] ?? k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        )}

        {reviews.data && reviews.data.results.length > 0 && (
          <section className="pd__section">
            <h2 className="pd__label">نظر خریداران</h2>
            <div className="rail">
              {reviews.data.results.slice(0, 8).map(r => (
                <article key={r.id} className="review">
                  <div className="row" style={{ '--gap': '8px' } as CSSProperties}>
                    <Avatar name={r.authorName} src={r.user?.avatar} seed={r.user?.avatarSeed} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <strong>{r.authorName}</strong>
                      <div className="review__stars" aria-label={`${r.rating} از ۵`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} size={11} fill={i < r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <span className="spacer" />
                    <span className="text-xs muted">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p>{r.comment}</p>
                  {r.verifiedPurchase && (
                    <span className="badge badge--green">
                      <BadgeCheck size={12} /> خریدار
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {related.data && related.data.length > 0 && (
          <section className="pd__section">
            <h2 className="pd__label">محصولات مرتبط</h2>
            <div className="rail">
              {related.data.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="action-bar">
        <div className="action-bar__total">
          {unitOld && unit !== null && unitOld > unit && <span className="price-old num">{num(unitOld * quantity)}</span>}
          <strong className="num">{unit === null ? '—' : `${num(unit * quantity)}`}</strong>
          <small>تومان</small>
        </div>
        <div className="spacer" />
        <Button variant="glass" loading={intent === 'cart'} disabled={!available || intent !== null} onClick={() => addToCart('cart')} aria-label="افزودن به سبد">
          <ShoppingCart size={20} />
        </Button>
        <Button disabled={!available || intent !== null} loading={intent === 'buy'} onClick={() => addToCart('buy')} icon={<Zap size={18} />}>
          {available ? 'خرید فوری' : 'ناموجود'}
        </Button>
      </div>
    </Screen>
  );
}

const SPEC_LABELS: Record<string, string> = {
  region: 'ریجن',
  delivery: 'زمان تحویل',
  activation: 'روش فعال‌سازی',
  platform: 'پلتفرم',
};
