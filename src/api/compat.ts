/* Display fixes the website applies to API payloads (renamed games, fallback products), kept identical
 * so both apps show the same catalogue. Source: titan-front/src/lib/api/client.ts. */
import type { Product, ProductSummary } from './types';

function replaceApexText(value: string): string {
  if (!value) return value;
  if (value.includes('apexlegends-background')) return '/images/games/callof-background.webp';
  if (value.includes('apexlegends-character') || value.includes('callof-character.webp')) return '/images/games/callof-character-v2.webp';
  if (value.includes('categories/apex') || value.includes('categories/callof.webp')) return '/images/categories/callof-v2.webp';
  if (value.includes('hero/characters/apexlegends') || value.includes('hero/characters/callof.webp')) return '/images/hero/characters/callof-v2.webp';
  return value
    .replace(/Apex\s+Predators/gi, 'Task Force 141')
    .replace(/Apex_Predator/gi, 'Ghost_Operator')
    .replace(/WraithMain/gi, 'SoapMacTavish')
    .replace(/OctaneRush/gi, 'PriceCaptain')
    .replace(/Apex\s+Legends/gi, 'Call of Duty Mobile')
    .replace(/Apex\s+Coins/gi, 'COD Points')
    .replace(/باندل ویژه\s+(?:Apex|Call of Duty)/gi, 'CP کال آو دیوتی موبایل')
    .replace(/شامل اسکین (?:اپیک و ۱۰۰۰ کوین|اپراتور و ۱,۱۰۰ سی‌پی)/g, 'شارژ فوری و قانونی سی‌پی روی اکانت اکتیویژن')
    .replace(/ایپکس\s*لجندز|اپکس\s*لجندز/g, 'کال آو دیوتی موبایل')
    .replace(/ایپکس\s*کوین|اپکس\s*کوین/g, 'سی‌پی کال آو دیوتی موبایل')
    .replace(/ایپکس|اپکس/g, 'کال آو دیوتی موبایل')
    .replace(/\bApex\b/g, 'Call of Duty Mobile')
    .replace(/کال\s*آو\s*دیوتی(?!\s*موبایل)/g, 'کال آو دیوتی موبایل')
    .replace(/کالاف\s*دیوتی(?!\s*موبایل)/g, 'کال آو دیوتی موبایل');
}

function isGameArray(arr: unknown[]): boolean {
  return (
    arr.length > 0 &&
    typeof arr[0] === 'object' &&
    arr[0] !== null &&
    'slug' in arr[0] &&
    'titleEn' in arr[0] &&
    !('prizePool' in arr[0]) &&
    !('price' in arr[0])
  );
}

const DEFAULT_COD_GAME = {
  slug: 'call-of-duty',
  title: 'کال آو دیوتی موبایل',
  titleEn: 'Call of Duty Mobile',
  iconImage: '/images/categories/callof-v2.webp',
  accentColor: '#f59e0b',
  accentGradient: 'linear-gradient(135deg,#78350f,#f59e0b)',
  description:
    'خرید قانونی و فوری سی‌پی کال آو دیوتی موبایل (CP) و بتل‌پس برای Call of Duty Mobile با تحویل آنی.',
  genre: 'شوتر اول‌شخص',
  kind: 'game',
  coverImage: '/images/games/callof-background.webp',
  logoImage: null,
  backgroundImage: '/images/games/callof-background.webp',
  characterImage: '/images/games/callof-character-v2.webp',
  isFeatured: true,
  productCount: 1,
  tournamentCount: 2,
  playerCount: 120,
};

const DEFAULT_CLASH_GAME = {
  slug: 'clash-of-clans',
  title: 'کلش آف کلنز',
  titleEn: 'Clash of Clans',
  iconImage: '/images/categories/clash.webp',
  accentColor: '#38bdf8',
  accentGradient: 'linear-gradient(135deg,#0c4a6e,#38bdf8)',
  description:
    'خرید قانونی و فوری جم کلش آف کلنز (Gems) و گلدپس (Gold Pass) با بهترین قیمت و تحویل آنی در تایتان.',
  genre: 'استراتژی آنلاین',
  kind: 'game',
  coverImage: '/images/games/clash-background.webp',
  logoImage: null,
  backgroundImage: '/images/games/clash-background.webp',
  characterImage: '/images/games/clash-character.webp',
  isFeatured: true,
  productCount: 1,
  tournamentCount: 0,
  playerCount: 95,
};

export const DEFAULT_CLASH_PRODUCT_SUMMARY: ProductSummary = {
  id: 9902,
  slug: 'clash-of-clans-gems',
  title: 'جم کلش آف کلنز (Gems)',
  subtitle: 'شارژ فوری و قانونی اکانت Supercell ID',
  image: '/images/products/goblin_transparent.webp',
  imageAlt: 'خرید جم کلش آف کلنز (Clash of Clans Gems) با تحویل آنی',
  sku: 'TITAN-COC-GEMS',
  price: 95000,
  originalPrice: 110000,
  discountPercent: 14,
  hasVariants: true,
  priceMax: 1850000,
  rating: 4.9,
  reviewCount: 18,
  badges: ['bestseller', 'discount'] as ('bestseller' | 'discount' | 'new')[],
  inStock: true,
  vendor: 'Supercell',
  deliveryType: 'account' as const,
  game: {
    slug: 'clash-of-clans',
    title: 'کلش آف کلنز',
    titleEn: 'Clash of Clans',
    iconImage: '/images/categories/clash.webp',
    accentColor: '#38bdf8',
  },
  category: { slug: 'game-currency', name: 'ارز بازی' },
  platforms: ['Mobile'],
  isWishlisted: false,
  popularity: 88,
};

export const DEFAULT_CLASH_PRODUCT_DETAIL: Product = {
  ...DEFAULT_CLASH_PRODUCT_SUMMARY,
  mpn: 'COC-GEMS',
  metaTitle: 'خرید جم کلش آف کلنز (Clash of Clans Gems) | شارژ فوری و ارزان',
  metaDescription:
    'خرید قانونی و ارزان جم کلش آف کلنز (Clash of Clans Gems) در بسته‌های ۸۰ تا ۲۵۰۰ تایی با شارژ فوری روی اکانت Supercell ID، بدون خطر بن و پشتیبانی ۲۴ ساعته.',
  platforms: [{ slug: 'mobile', name: 'Mobile', icon: null }],
  description:
    'جم کلش آف کلنز (Clash of Clans Gems) اصلی‌ترین ارز درون‌برنامه‌ای بازی استراتژیک سوپرسل است که برای استخدام کارگران بیشتر (Builder\'s Hut)، خرید تجهیزات اپیک هیروها (Hero Equipment)، اسکین‌های قهرمانان، کتاب‌های جادویی تاجر (Trader) و تکمیل سریع ارتقای ساختمان‌ها و نیروها استفاده می‌شود. تمامی بسته‌های جم در فروشگاه تایتان به صورت کاملاً قانونی و از طریق درگاه رسمی Supercell روی اکانت شما شارژ می‌شوند.',
  deliveryInfo: 'تحویل آنی — شارژ مستقیم اکانت',
  requiresGameAccount: true,
  stock: null,
  features: [
    { title: 'تحویل آنی', description: 'در کمتر از ۱۵ دقیقه', icon: 'flame' },
    { title: '۱۰۰٪ قانونی', description: 'بدون خطر بن اکانت', icon: 'shield' },
    { title: 'پشتیبانی ۲۴/۷', description: 'پاسخگویی سریع در چت', icon: 'chat' },
  ],
  tags: ['تحویل آنی', '۱۰۰٪ قانونی و اورجینال', 'پشتیبانی ۲۴ ساعته'],
  specs: { region: 'Global', delivery: 'زیر ۱۵ دقیقه', activation: 'شارژ مستقیم اکانت' },
  variants: [
    { id: 99021, label: '۸۰ جم', price: 95000, originalPrice: 110000, discountPercent: 14, inStock: true },
    { id: 99022, label: '۵۰۰ جم', price: 390000, originalPrice: 440000, discountPercent: 11, inStock: true },
    { id: 99023, label: '۱,۲۰۰ جم', price: 790000, originalPrice: 890000, discountPercent: 11, inStock: true },
    { id: 99024, label: '۲,۵۰۰ جم', price: 1850000, originalPrice: 2050000, discountPercent: 10, inStock: true },
  ],
  gallery: [],
};

export function sanitizeApiPayload<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return replaceApexText(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    const mapped = input.map(item => sanitizeApiPayload(item));
    if (isGameArray(mapped)) {
      const seen = new Set<string>();
      const deduped: Record<string, unknown>[] = [];
      for (const g of mapped as Record<string, unknown>[]) {
        if (!g || typeof g.slug !== 'string' || seen.has(g.slug)) continue;
        seen.add(g.slug);
        deduped.push(g);
      }
      if (!seen.has('call-of-duty')) {
        const premIdx = deduped.findIndex(g => g.slug === 'premium');
        if (premIdx >= 0) deduped.splice(premIdx, 0, { ...DEFAULT_COD_GAME });
        else deduped.push({ ...DEFAULT_COD_GAME });
      }
      if (!seen.has('clash-of-clans')) {
        const premIdx = deduped.findIndex(g => g.slug === 'premium');
        if (premIdx >= 0) deduped.splice(premIdx, 0, { ...DEFAULT_CLASH_GAME });
        else deduped.push({ ...DEFAULT_CLASH_GAME });
      }
      return deduped as unknown as T;
    }
    return mapped as unknown as T;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;

    // Game or GameMini or GameRef object with apex-legends
    if (obj.slug === 'apex-legends' && ('titleEn' in obj || 'genre' in obj)) {
      return {
        ...obj,
        ...DEFAULT_COD_GAME,
      } as unknown as T;
    }
    if (obj.slug === 'call-of-duty' && ('titleEn' in obj || 'genre' in obj)) {
      return {
        ...obj,
        title: 'کال آو دیوتی موبایل',
        titleEn: 'Call of Duty Mobile',
        iconImage: '/images/categories/callof-v2.webp',
        accentColor: obj.accentColor || '#f59e0b',
        backgroundImage: '/images/games/callof-background.webp',
        characterImage: '/images/games/callof-character-v2.webp',
        coverImage: obj.coverImage || '/images/games/callof-background.webp',
      } as unknown as T;
    }
    if (obj.slug === 'clash-of-clans' && ('titleEn' in obj || 'genre' in obj)) {
      return {
        ...obj,
        title: 'کلش آف کلنز',
        titleEn: 'Clash of Clans',
        iconImage: '/images/categories/clash.webp',
        accentColor: obj.accentColor || '#38bdf8',
        backgroundImage: '/images/games/clash-background.webp',
        characterImage: '/images/games/clash-character.webp',
        coverImage: obj.coverImage || '/images/games/clash-background.webp',
      } as unknown as T;
    }

    // Promo with apex-coins or cod-points bestseller banner
    if (
      'placement' in obj &&
      (obj.product === 'apex-coins' ||
        obj.product === 'cod-points' ||
        /apex|ایپکس|اپکس|باندل ویژه Call of Duty/i.test(String(obj.title ?? '')))
    ) {
      return {
        ...obj,
        title: 'CP کال آو دیوتی موبایل',
        subtitle: 'شارژ فوری و قانونی سی‌پی روی اکانت اکتیویژن',
        price: 95000,
        image: '/images/products/Molten-Gold-Lightning-King.webp',
        backgroundImage: '/images/games/callof-background.webp',
        product: 'cod-points',
      } as unknown as T;
    }

    // Product with slug === 'apex-coins'
    if (obj.slug === 'apex-coins' && 'price' in obj) {
      const gameObj = obj.game && typeof obj.game === 'object' ? (obj.game as Record<string, unknown>) : null;
      return {
        ...obj,
        slug: 'cod-points',
        title: 'سی‌پی کال آو دیوتی موبایل (COD Points)',
        description: 'خرید قانونی و فوری سی‌پی کال آو دیوتی موبایل (CP) برای خرید بتل‌پس، اسکین اپراتور و گردونه.',
        image: '/images/products/Molten-Gold-Lightning-King.webp',
        game: gameObj
          ? {
              ...gameObj,
              slug: 'call-of-duty',
              title: 'کال آو دیوتی موبایل',
              titleEn: 'Call of Duty Mobile',
              iconImage: '/images/categories/callof-v2.webp',
              accentColor: '#f59e0b',
            }
          : obj.game,
      } as unknown as T;
    }

    if (obj.slug === 'cod-points' && 'price' in obj && (!obj.image || String(obj.image).includes('callof-character'))) {
      obj.image = 'https://35tmectztpibboo6.public.blob.vercel-storage.com/products/Molten-Gold-Lightning-King.webp';
    }
    if (obj.slug === 'clash-of-clans-gems' && 'price' in obj && (!obj.image || String(obj.image).includes('clash-character'))) {
      obj.image = 'https://35tmectztpibboo6.public.blob.vercel-storage.com/products/goblin_transparent.webp';
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'favoriteGame' && v === 'apex-legends') {
        out[k] = 'call-of-duty';
      } else {
        out[k] = sanitizeApiPayload(v);
      }
    }

    // Deduplicate paginated product results if apex-coins was converted to cod-points alongside existing cod-points
    if (Array.isArray(out.results)) {
      const seenSlugs = new Set<string>();
      out.results = out.results.filter((item: unknown) => {
        if (item && typeof item === 'object' && 'slug' in item) {
          const slugVal = (item as Record<string, unknown>).slug;
          if (typeof slugVal === 'string') {
            if (seenSlugs.has(slugVal)) return false;
            seenSlugs.add(slugVal);
          }
        }
        return true;
      });
    }

    return out as T;
  }
  return input;
}

