import type { Product, ProductVariant } from '@/api/types';
import { faDigits, num } from '@/lib/format';
import {
  CREW_ACTIVATION_CONTENT,
  CREW_BENEFIT_BLOCKS,
  CREW_BENEFITS_HEADER,
  CREW_COMPARISON_CONTENT,
  CREW_COMPARISON_ROWS,
  CREW_COMPARISON_TOTAL,
  CREW_DEFAULT_ORIGINAL_PRICE_TOMAN,
  CREW_DEFAULT_PRICE_TOMAN,
  CREW_FAQ_HEADER,
  CREW_FAQ_ITEMS,
  CREW_HERO_CONTENT,
  CREW_INTRO_CONTENT,
  CREW_PRICE_DELIVERY_CONTENT,
  CREW_RELATED_HEADER,
  CREW_RELATED_LINKS,
  CREW_SUPPORT_CONTENT,
  type CrewActivationStep,
  type CrewBenefitBlock,
  type CrewComparisonRow,
  type CrewFaqItem,
  type CrewRelatedLink,
} from './content';

export interface FortniteBotTemplate {
  slugs: string[];
  defaultPriceToman: number;
  defaultOriginalPriceToman: number;
  defaultDiscountPct: number;
  readMoreSub: string;
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    factChips: string[];
    carouselHint: string;
  };
  intro: {
    kicker: string;
    title: string;
    p1BeforeLink: string;
    p1LinkLabel: string;
    p1LinkHref: string;
    p1AfterLink: string;
    p2: string;
    p3: string;
  };
  benefitsHeader: {
    kicker: string;
    title: string;
  };
  benefitBlocks: CrewBenefitBlock[];
  activation: {
    kicker: string;
    title: string;
    lead: string;
    steps: CrewActivationStep[];
  };
  priceDelivery: {
    kicker: string;
    title: string;
    tile1Label: string;
    tile1SubWhenNoDiscount?: string;
    tile2Label: string;
    tile2Value: string;
    tile2Sub: string;
    tile3Label: string;
    tile3Value: string;
    tile3Sub: string;
    guideNoteBefore: string;
    guideLinkLabel: string;
    guideLinkHref: string;
    guideNoteAfter: string;
  };
  comparison: {
    kicker: string;
    title: string;
    p1: string;
    p2BeforeVbucks: string;
    shopLinkLabel: string;
    shopLinkHref: string;
    p2BetweenLinks: string;
    vbucksLinkLabel: string;
    vbucksLinkHref: string;
    p2BeforeEpic: string;
    epicLinkLabel: string;
    epicLinkHref: string;
    p2AfterEpic: string;
    tableHeader: string;
    rows: CrewComparisonRow[];
    total: CrewComparisonRow;
  };
  support: {
    kicker: string;
    title: string;
    pBeforeTerms: string;
    termsLinkLabel: string;
    termsLinkHref: string;
    pAfterTerms: string;
  };
  relatedHeader: {
    kicker: string;
    title: string;
  };
  relatedLinks: CrewRelatedLink[];
  faqHeader: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  faqItems: CrewFaqItem[];
}

export function resolveFortniteBotPricing(
  template: FortniteBotTemplate,
  product?: Product | null,
  selectedVariant?: ProductVariant | null,
) {
  const activeVariant =
    selectedVariant ??
    product?.variants?.find(v => v.inStock) ??
    product?.variants?.[0] ??
    null;

  const priceToman =
    activeVariant?.price ?? product?.price ?? template.defaultPriceToman;

  const rawOriginal =
    activeVariant?.originalPrice ??
    product?.originalPrice ??
    template.defaultOriginalPriceToman;

  const originalPriceToman =
    rawOriginal && rawOriginal > priceToman
      ? rawOriginal
      : template.defaultOriginalPriceToman > priceToman
        ? template.defaultOriginalPriceToman
        : priceToman;

  const hasDiscount = originalPriceToman > priceToman;

  const discountPct = hasDiscount
    ? Math.max(
        1,
        Math.round(((originalPriceToman - priceToman) / originalPriceToman) * 100),
      )
    : template.defaultDiscountPct;

  const tile1Label =
    activeVariant && product?.variants && product.variants.length > 1
      ? `قیمت بسته (${activeVariant.label})`
      : template.priceDelivery.tile1Label;

  const discountFormatted = hasDiscount
    ? `${faDigits(discountPct)}٪ تخفیف نسبت به قیمت پایه ${num(originalPriceToman)} تومان`
    : template.priceDelivery.tile1SubWhenNoDiscount ||
      'پرداخت امن ریالی و فعال‌سازی مستقیم روی اکانت';

  return {
    priceToman,
    originalPriceToman,
    discountPct,
    hasDiscount,
    tile1Label,
    priceFormatted: `${num(priceToman)} تومان`,
    originalPriceFormatted: `${num(originalPriceToman)} تومان`,
    discountFormatted,
  };
}

/* ==========================================================================
   1. FORTNITE CREW (/product/fortnite-crew, /product/fortnite-crew-pack)
   ========================================================================== */
export const FORTNITE_CREW_BOT_TEMPLATE: FortniteBotTemplate = {
  slugs: ['fortnite-crew', 'fortnite-crew-pack'],
  defaultPriceToman: CREW_DEFAULT_PRICE_TOMAN,
  defaultOriginalPriceToman: CREW_DEFAULT_ORIGINAL_PRICE_TOMAN,
  defaultDiscountPct: 25,
  readMoreSub: 'مشاهده ۷ مزیت، مراحل فعال‌سازی و سؤالات متداول',
  hero: CREW_HERO_CONTENT,
  intro: CREW_INTRO_CONTENT,
  benefitsHeader: CREW_BENEFITS_HEADER,
  benefitBlocks: CREW_BENEFIT_BLOCKS,
  activation: CREW_ACTIVATION_CONTENT,
  priceDelivery: {
    kicker: CREW_PRICE_DELIVERY_CONTENT.kicker,
    title: CREW_PRICE_DELIVERY_CONTENT.title,
    tile1Label: CREW_PRICE_DELIVERY_CONTENT.tiles[0].label,
    tile2Label: CREW_PRICE_DELIVERY_CONTENT.tiles[1].label,
    tile2Value: CREW_PRICE_DELIVERY_CONTENT.tiles[1].value ?? '۱۵ دقیقه تا ۲ ساعت',
    tile2Sub: CREW_PRICE_DELIVERY_CONTENT.tiles[1].sub ?? 'پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: CREW_PRICE_DELIVERY_CONTENT.tiles[2].label,
    tile3Value: CREW_PRICE_DELIVERY_CONTENT.tiles[2].value ?? 'PC · PS4/PS5 · Xbox · Switch · Mobile',
    tile3Sub: CREW_PRICE_DELIVERY_CONTENT.tiles[2].sub ?? 'روی تمام پلتفرم‌های متصل به یک حساب Epic Games',
    guideNoteBefore: CREW_PRICE_DELIVERY_CONTENT.guideNoteBefore,
    guideLinkLabel: CREW_PRICE_DELIVERY_CONTENT.guideLinkLabel,
    guideLinkHref: CREW_PRICE_DELIVERY_CONTENT.guideLinkHref,
    guideNoteAfter: CREW_PRICE_DELIVERY_CONTENT.guideNoteAfter,
  },
  comparison: {
    ...CREW_COMPARISON_CONTENT,
    rows: CREW_COMPARISON_ROWS,
    total: CREW_COMPARISON_TOTAL,
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: CREW_RELATED_HEADER,
  relatedLinks: CREW_RELATED_LINKS,
  faqHeader: CREW_FAQ_HEADER,
  faqItems: CREW_FAQ_ITEMS,
};

/* ==========================================================================
   2. FORTNITE V-BUCKS (/product/fortnite-vbucks)
   ========================================================================== */
export const FORTNITE_VBUCKS_BOT_TEMPLATE: FortniteBotTemplate = {
  slugs: ['fortnite-vbucks'],
  defaultPriceToman: 1150000,
  defaultOriginalPriceToman: 1290000,
  defaultDiscountPct: 11,
  readMoreSub: 'مشاهده ۷ کاربرد و بسته وی‌باکس، مراحل شارژ و سؤالات متداول',
  hero: {
    eyebrow: 'ارز رسمی درون‌بازی · FORTNITE V-BUCKS',
    title: 'خرید وی‌باکس فورتنایت',
    lead: 'شارژ مستقیم و قانونی وی‌باکس روی اکانت اپیک گیمز با پرداخت ریالی: انتخاب از بسته‌های اقتصادی تا پک‌های حرفه‌ای حاوی وی‌باکس جایزه (Bonus) برای خرید اسکین‌های آیتم‌شاپ روزانه، ایموت‌ها و پس‌های فورتنایت روی تمام پلتفرم‌ها.',
    factChips: [
      'بسته‌های متنوع وی‌باکس',
      'شارژ مستقیم روی اکانت',
      'کیف پول مشترک پلتفرم‌ها',
      'قابلیت گیفت در آیتم‌شاپ',
      'تحویل ۱۵ دقیقه تا ۲ ساعت',
    ],
    carouselHint: 'کارت‌ها را بکشید · با زدن کارتِ جلو، به توضیح همان بخش می‌روید',
  },
  intro: {
    kicker: 'معرفی ارز درون‌بازی',
    title: 'وی‌باکس فورتنایت چیست و چطور بین پلتفرم‌ها مشترک می‌شود؟',
    p1BeforeLink: 'وی‌باکس (V-Bucks) ارز رسمی درون‌برنامه‌ای بازی Fortnite است که در ',
    p1LinkLabel: 'صفحه رسمی V-Bucks در سایت فورتنایت',
    p1LinkHref: 'https://www.fortnite.com/vbucks',
    p1AfterLink:
      ' معرفی شده است. تمامی اسکین‌های روزانه، باندل‌های همکاری مارول و انیمه، پیک‌اکس‌ها، گلایدرها، ایموت‌ها، ترک‌های موسیقی فستیوال و پس‌های فصلی تنها با وی‌باکس قابل تهیه هستند.',
    p2: 'به لطف سیستم کیف پول مشترک اپیک گیمز (Fortnite Shared Wallet)، وی‌باکسی که روی اکانت شما شارژ می‌شود هم‌زمان روی PC، PlayStation 4/5، Xbox و موبایل قابل مشاهده و خرج کردن است.',
    p3: 'وی‌باکس‌های خریداری‌شده هیچ تاریخ انقضایی ندارند و در بسته‌های بزرگ‌تر، درصدی وی‌باکس اضافه (Bonus V-Bucks) دریافت می‌کنید که هزینه هر ۱٬۰۰۰ وی‌باکس را کاهش می‌دهد.',
  },
  benefitsHeader: {
    kicker: 'کاربردها و بسته‌ها',
    title: 'با خرید وی‌باکس فورتنایت چه امکانات و بسته‌هایی در اختیار دارید؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      tag: 'آیتم‌شاپ روزانه',
      kicker: 'مزیت اول · خرید از فروشگاه بازی',
      title: 'خرید اسکین، ایموت و باندل از آیتم‌شاپ روزانه',
      p1: 'آیتم‌شاپ فورتنایت هر شب ساعت ۰۳:۳۰ بامداد به وقت ایران بروزرسانی می‌شود و اسکین‌های اورجینال، کاراکترهای سینمایی، خوانندگان (Icon Series) و ایموت‌های جدید را عرضه می‌کند.',
      p2: 'با داشتن موجودی وی‌باکس آماده در اکانت، هر زمان اسکین یا باندل کمیاب موردعلاقه‌تان وارد شاپ شد، پیش از خروج آن از فروشگاه می‌توانید بلافاصله آن را تهیه کنید.',
      link: 'مشاهده آیتم‌شاپ امروز فورتنایت',
      href: '/fortnite-shop',
      link2: 'همه محصولات فورتنایت',
      href2: '/store/fortnite',
      grad: 'linear-gradient(155deg,#0f2238 0%,#1d4e78 55%,#5cc8ff 130%)',
      glow: 'rgba(92,200,255,0.45)',
      ink: '#a8e3ff',
      icon: 'coin',
    },
    {
      id: 'b-1',
      tag: 'آنلاک پس‌ها',
      kicker: 'مزیت دوم · باز کردن جوایز فصل',
      title: 'فعال‌سازی بتل‌پس، OG Pass، LEGO Pass و Music Pass',
      p1: 'با موجودی وی‌باکس خود می‌توانید مستقیماً داخل بازی، بتل‌پس اصلی فصل (۱٬۰۰۰ وی‌باکس)، پس کلاسیک OG Pass (۱٬۰۰۰ وی‌باکس)، لگو پس (۱٬۴۰۰ وی‌باکس) یا موزیک پس فستیوال (۱٬۴۰۰ وی‌باکس) را فعال کنید.',
      p2: 'با تکمیل صفحات بتل‌پس اصلی در طول فصل، تا ۱٬۵۰۰ وی‌باکس دوباره به موجودی اکانت شما برمی‌گردد.',
      link: 'خرید بتل‌پس فورتنایت',
      href: '/product/fortnite-battle-pass',
      link2: 'خرید کروپک فورتنایت',
      href2: '/product/fortnite-crew',
      grad: 'linear-gradient(155deg,#241038 0%,#52207a 55%,#c47aff 130%)',
      glow: 'rgba(196,122,255,0.45)',
      ink: '#e0bcff',
      icon: 'medal',
    },
    {
      id: 'b-2',
      tag: 'گیفت به دوستان',
      kicker: 'مزیت سوم · ارسال هدیه درون‌بازی',
      title: 'گیفت کردن (Gift) اسکین و آیتم به دوستان',
      p1: 'با وی‌باکس شارژشده روی اکانت، می‌توانید از سیستم Gifting در آیتم‌شاپ استفاده کرده و هر اسکین، دنس یا باندل موجود در شاپ را برای دوستانتان در لیست Friends به صورت هدیه بفرستید.',
      p2: 'تنها کافی است تایید دومرحله‌ای (2FA) اکانت اپیک گیمز شما فعال باشد و حداقل ۴۸ ساعت از دوستی شما با بازیکن مقصد در فورتنایت گذشته باشد.',
      link: 'آموزش‌های فورتنایت در تایتان',
      href: '/guides',
      link2: 'آیتم‌شاپ روزانه فورتنایت',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(155deg,#3a1020 0%,#7a1f3d 55%,#f2b84b 130%)',
      glow: 'rgba(242,184,75,0.45)',
      ink: '#ffd88a',
      icon: 'gift',
    },
    {
      id: 'b-3',
      tag: 'بسته اقتصادی',
      kicker: 'مزیت چهارم · بسته پایه',
      title: 'بسته ۸۰۰ و ۱٬۰۰۰ وی‌باکس؛ مناسب بتل‌پس و ایموت',
      p1: 'کوچک‌ترین بسته وی‌باکس فورتنایت بهترین گزینه برای جبران کسری موجودی اکانت، خرید بتل‌پس فصل جدید یا تهیه یک اسکین ۸۰۰ وی‌باکسی و ایموت از آیتم‌شاپ است.',
      p2: 'اگر علاوه بر ۱٬۰۰۰ وی‌باکس به دنبال اسکین ماهانه و باز شدن هم‌زمان همه پس‌ها هستید، پیشنهاد می‌کنیم کروپک فورتنایت را هم بررسی کنید.',
      link: 'مقایسه با کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'خرید استارتر پک فورتنایت',
      href2: '/product/fortnite-starter-pack',
      grad: 'linear-gradient(155deg,#0b2a28 0%,#14635c 55%,#3fffe0 130%)',
      glow: 'rgba(63,255,224,0.45)',
      ink: '#a8fff0',
      icon: 'bolt',
    },
    {
      id: 'b-4',
      tag: 'بسته میان‌رده',
      kicker: 'مزیت پنجم · پرفروش‌ترین انتخاب',
      title: 'بسته‌های ۱٬۶۰۰ و ۲٬۴۰۰ تا ۲٬۸۰۰ وی‌باکس؛ مناسب اسکین‌های شاپ',
      p1: 'بیشتر اسکین‌های محبوب فورتنایت، کاراکترهای انیمه، مارول و باندل‌های تک‌کاراکتر بین ۱٬۵۰۰ تا ۲٬۴۰۰ وی‌باکس قیمت دارند و این بسته‌ها پرفروش‌ترین گزینه‌ها برای خرید مستقیم از شاپ هستند.',
      p2: 'با انتخاب این بسته‌ها از بالای صفحه، موجودی کافی برای خرید یک اسکین کامل به همراه پیک‌اکس یا ایموت ست آن را در اختیار خواهید داشت.',
      link: 'بررسی قیمت اسکین‌ها در شاپ',
      href: '/fortnite-shop',
      link2: 'راهنماهای آموزشی فورتنایت',
      href2: '/guides',
      grad: 'linear-gradient(155deg,#2e1c0c 0%,#6e3f14 55%,#ff9e44 130%)',
      glow: 'rgba(255,158,68,0.45)',
      ink: '#ffd0a1',
      icon: 'sun',
    },
    {
      id: 'b-5',
      tag: 'بسته حرفه‌ای',
      kicker: 'مزیت ششم · بیشترین وی‌باکس جایزه',
      title: 'بسته‌های ۴٬۵۰۰ تا ۱۲٬۵۰۰ وی‌باکس؛ مناسب باندل‌های کامل',
      p1: 'برای گیمرهایی که قصد خرید باندل‌های کامل همکاری (Full Bundles)، اسکین‌های تیمی و آیتم‌های مود لگو را دارند، بسته‌های ۴٬۵۰۰ و ۱۲٬۵۰۰ وی‌باکس بالاترین صرفه اقتصادی را ارائه می‌دهند.',
      p2: 'در این بسته‌ها درصد قابل توجهی وی‌باکس رایگان (Bonus) روی پک لحاظ شده است تا به ازای هر تومان پرداختی، بیشترین مقدار وی‌باکس را دریافت کنید.',
      link: 'فروشگاه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'پشتیبانی آنلاین تایتان',
      href2: '/support',
      grad: 'linear-gradient(155deg,#2e2208 0%,#785a10 55%,#ffd23f 130%)',
      glow: 'rgba(255,210,63,0.45)',
      ink: '#ffe899',
      icon: 'cube',
    },
    {
      id: 'b-6',
      tag: 'Shared Wallet',
      kicker: 'مزیت هفتم · سازگاری کامل پلتفرم‌ها',
      title: 'کیف پول یکپارچه روی PC، پلی‌استیشن، ایکس‌باکس و موبایل',
      p1: 'به محض تکمیل سفارش، موجودی وی‌باکس در حساب Epic Games، کنسول‌های PlayStation 4/5، کنسول‌های Xbox و نسخه موبایل شما همگام‌سازی می‌گردد.',
      p2: 'کافی است اکانت کنسول شما به حساب اپیک گیمزتان لینک باشد تا در هر پلتفرمی که بازی را اجرا می‌کنید، به کل موجودی وی‌باکس دسترسی داشته باشید.',
      link: 'مرکز آموزش و راهنما',
      href: '/guides',
      link2: 'ارتباط با پشتیبانی',
      href2: '/support',
      grad: 'linear-gradient(155deg,#330d2a 0%,#781860 55%,#ff5ec4 130%)',
      glow: 'rgba(255,94,196,0.45)',
      ink: '#ffb3e2',
      icon: 'note',
    },
  ],
  activation: {
    kicker: 'فرآیند شارژ سفارش',
    title: 'چطور وی‌باکس روی اکانت شما شارژ می‌شود؟',
    lead: 'شارژ وی‌باکس فورتنایت در تایتان به صورت مستقیم و رسمی روی اکانت بازی شما انجام می‌شود و نیازی به گیفت کارت دلاری ندارد.',
    steps: [
      {
        num: '۱',
        title: 'انتخاب بسته و پرداخت ریالی',
        text: 'از بالای صفحه مقدار وی‌باکس دلخواه خود را انتخاب کرده، به سبد خرید اضافه کنید و با کارت شتاب یا کیف پول تایتان پرداخت نمایید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت متصل',
        text: 'در مرحله تسویه حساب یا بخش اکانت‌های من، اطلاعات اکانت اپیک گیمز یا کنسول متصل خود را ثبت کنید.',
        placeholderKey: 'CREW_ACTIVATION_INFO',
      },
      {
        num: '۳',
        title: 'شارژ رسمی از طریق استور',
        text: 'کارشناسان تایتان بسته وی‌باکس انتخابی شما را از طریق استور رسمی و با رسید معتبر روی حساب شما شارژ می‌کنند.',
      },
      {
        num: '۴',
        title: 'تحویل و بررسی موجودی در بازی',
        text: 'پس از تکمیل سفارش، اعلان تحویل برایتان ارسال می‌شود و موجودی وی‌باکس بلافاصله در بالای صفحه بازی قابل استفاده است.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'شفافیت خرید',
    title: 'قیمت بسته‌های وی‌باکس و زمان تحویل در تایتان',
    tile1Label: 'قیمت بسته انتخابی',
    tile1SubWhenNoDiscount: 'بسته دلخواه خود را از بخش «انتخاب بسته» در بالای صفحه تغییر دهید',
    tile2Label: 'زمان تحویل سفارش',
    tile2Value: '۱۵ دقیقه تا ۲ ساعت',
    tile2Sub: 'پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: 'پلتفرم‌های قابل استفاده',
    tile3Value: 'PC · PS4/PS5 · Xbox · Mobile',
    tile3Sub: 'همگام‌سازی خودکار از طریق کیف پول مشترک Epic Games',
    guideNoteBefore: 'برای آشنایی کامل با پیش‌نیازهای اکانت و اتصال کنسول به اپیک گیمز، می‌توانید به ',
    guideLinkLabel: 'مرکز آموزش و راهنماهای فورتنایت',
    guideLinkHref: '/guides',
    guideNoteAfter: ' در تایتان مراجعه کنید.',
  },
  comparison: {
    kicker: 'راهنمای انتخاب بسته',
    title: 'چقدر وی‌باکس برای خرید آیتم‌های فورتنایت نیاز دارید؟',
    p1: 'قیمت آیتم‌ها در فروشگاه فورتنایت بر اساس کمیابی و نوع باندل متفاوت است. جدول زیر به شما کمک می‌کند قبل از انتخاب بسته وی‌باکس، بدانید هر آیتم در بازی چند وی‌باکس هزینه دارد.',
    p2BeforeVbucks: 'برای مشاهده قیمت لحظه‌ای اسکین‌های امروز می‌توانید به ',
    shopLinkLabel: 'آیتم‌شاپ فورتنایت',
    shopLinkHref: '/fortnite-shop',
    p2BetweenLinks: ' سر بزنید، یا اگر می‌خواهید همراه ۱٬۰۰۰ وی‌باکس همه پس‌های فصل را هم باز کنید، صفحه ',
    vbucksLinkLabel: 'خرید کروپک فورتنایت',
    vbucksLinkHref: '/product/fortnite-crew',
    p2BeforeEpic: ' را بررسی نمایید. اطلاعات بیشتر در ',
    epicLinkLabel: 'سایت رسمی اپیک گیمز',
    epicLinkHref: 'https://www.epicgames.com',
    p2AfterEpic: ' در دسترس است.',
    tableHeader: 'تعرفه رایج آیتم‌ها در داخل بازی فورتنایت',
    rows: [
      { label: 'ایموت‌ها و دنس‌های آیتم‌شاپ', value: '۳۰۰ تا ۵۰۰ V-Bucks' },
      { label: 'بتل‌پس اصلی یا OG Pass فورتنایت', value: '۱٬۰۰۰ V-Bucks' },
      { label: 'لگو پس (LEGO) یا موزیک پس (Festival)', value: '۱٬۴۰۰ V-Bucks' },
      { label: 'اسکین‌های استاندارد و همکاری (Icon / Marvel)', value: '۸۰۰ تا ۲٬۰۰۰ V-Bucks' },
      { label: 'باندل‌های کامل کاراکتر و تجهیزات ست', value: '۲٬۲۰۰ تا ۳٬۵۰۰ V-Bucks' },
    ],
    total: {
      label: 'پیشنهاد پرفروش برای خرید باندل کامل شاپ',
      value: 'بسته ۲٬۴۰۰ تا ۴٬۵۰۰ وی‌باکس',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: CREW_RELATED_HEADER,
  relatedLinks: [
    { label: 'خرید کروپک فورتنایت', href: '/product/fortnite-crew' },
    { label: 'خرید بتل‌پس فورتنایت', href: '/product/fortnite-battle-pass' },
    { label: 'خرید استارتر پک فورتنایت', href: '/product/fortnite-starter-pack' },
    { label: 'آیتم‌شاپ روزانه فورتنایت', href: '/fortnite-shop' },
    { label: 'فروشگاه محصولات فورتنایت', href: '/store/fortnite' },
    { label: 'پشتیبانی آنلاین', href: '/support' },
  ],
  faqHeader: {
    kicker: 'پرسش‌های پرتکرار',
    title: 'سؤالات متداول درباره خرید وی‌باکس فورتنایت',
    subtitle: 'پاسخ کوتاه و دقیق به پرسش‌های خریداران پیش از ثبت سفارش.',
  },
  faqItems: [
    {
      id: 'vb-faq-1',
      question: 'شارژ وی‌باکس فورتنایت در تایتان چقدر طول می‌کشد؟',
      answer:
        'تمامی سفارش‌های وی‌باکس بین ۱۵ دقیقه تا حداکثر ۲ ساعت پس از ثبت نهایی سفارش در ساعات کاری روی اکانت شما شارژ می‌شوند.',
    },
    {
      id: 'vb-faq-2',
      question: 'آیا خرید وی‌باکس از تایتان قانونی است و خطر منفی شدن دارد؟',
      answer:
        'بله؛ شارژ وی‌باکس در تایتان از طریق استور رسمی و با پرداخت معتبر انجام می‌شود، بنابراین هیچ‌گونه خطر منفی شدن موجودی یا محدودیت برای اکانت شما وجود ندارد.',
    },
    {
      id: 'vb-faq-3',
      question: 'آیا وی‌باکس شارژشده روی پلی‌استیشن، ایکس‌باکس، PC و موبایل مشترک است؟',
      answer:
        'بله؛ به لطف سیستم Shared Wallet فورتنایت، اگر کنسول یا موبایل شما به همان حساب Epic Games متصل باشد، موجودی وی‌باکس روی تمام پلتفرم‌ها یکسان و قابل استفاده خواهد بود.',
    },
    {
      id: 'vb-faq-4',
      question: 'آیا با این وی‌باکس‌ها می‌توانم به دوستانم اسکین گیفت (Gift) کنم؟',
      answer:
        'بله؛ در صورت فعال بودن تایید دومرحله‌ای (2FA) و گذشتن ۴۸ ساعت از دوستی با فرد مقابل، می‌توانید هر آیتم موجود در شاپ را گیفت کنید.',
    },
    {
      id: 'vb-faq-5',
      question: 'آیا وی‌باکس‌های فورتنایت تاریخ انقضا دارند؟',
      answer:
        'خیر؛ وی‌باکس‌های اضافه‌شده به حساب شما دائمی هستند و پایان فصل یا شروع چپتر جدید هیچ تاثیری روی موجودی وی‌باکس شما ندارد.',
    },
    {
      id: 'vb-faq-6',
      question: 'کدام بسته وی‌باکس برای خرید بتل‌پس و اسکین به‌صرفه‌تر است؟',
      answer:
        'برای خرید تکی بتل‌پس بسته ۸۰۰/۱٬۰۰۰ وی‌باکسی کافی است، اما برای خرید اسکین‌ها و باندل‌های آیتم‌شاپ، بسته‌های ۲٬۴۰۰ و ۴٬۵۰۰ وی‌باکس ارزش خرید بسیار بالاتری دارند.',
    },
    {
      id: 'vb-faq-7',
      question: 'فرق خرید وی‌باکس با خرید اشتراک کروپک فورتنایت چیست؟',
      answer:
        'وی‌باکس ارز خالص بازی است که به هر میزان دلخواه می‌خرید؛ اما کروپک یک اشتراک ماهانه است که ۱٬۰۰۰ وی‌باکس، باندل اسکین ماه و دسترسی به ۴ پس فورتنایت را با هم فعال می‌کند.',
    },
    {
      id: 'vb-faq-8',
      question: 'اگر در فرآیند شارژ وی‌باکس مشکلی پیش بیاید چه می‌شود؟',
      answer:
        'وجه پرداختی شما تحت ضمانت کامل تایتان است و در صورت عدم امکان انجام سفارش، مبلغ پرداختی به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود.',
    },
  ],
};

/* ==========================================================================
   3. FORTNITE BATTLE PASS (/product/fortnite-battle-pass)
   ========================================================================== */
export const FORTNITE_BATTLE_PASS_BOT_TEMPLATE: FortniteBotTemplate = {
  slugs: ['fortnite-battle-pass'],
  defaultPriceToman: 1165000,
  defaultOriginalPriceToman: 1290000,
  defaultDiscountPct: 10,
  readMoreSub: 'مشاهده ۶ مزیت بتل‌پس، نحوه فعال‌سازی و سؤالات متداول',
  hero: {
    eyebrow: 'پاس فصلی فورتنایت · FORTNITE BATTLE PASS',
    title: 'خرید بتل‌پس فورتنایت',
    lead: 'با خرید بتل‌پس فصل جدید فورتنایت از تایتان، قفل بیش از ۱۰۰ جایزه پریمیوم سیزن شامل اسکین‌های داستانی و همکاری ویژه، پیک‌اکس، گلایدر، ایموت و تا ۱٬۵۰۰ وی‌باکس قابل بازگشت را روی اکانت خود باز کنید.',
    factChips: [
      'بیش از ۱۰۰ جایزه پریمیوم فصل',
      'بازگشت تا ۱٬۵۰۰ وی‌باکس',
      'باز شدن فوری اسکین اول',
      'پیشرفت XP در تمام مودها',
      'تحویل ۱۵ دقیقه تا ۲ ساعت',
    ],
    carouselHint: 'کارت‌ها را بکشید · با زدن کارتِ جلو، به توضیح همان بخش می‌روید',
  },
  intro: {
    kicker: 'معرفی بتل‌پس فصل',
    title: 'بتل‌پس فورتنایت چیست و چطور تا ۱٬۵۰۰ وی‌باکس به شما برمی‌گرداند؟',
    p1BeforeLink: 'بتل‌پس فورتنایت سیستم پاداش فصلی اصلی بازی است که در هر سیزن جدید توسط ',
    p1LinkLabel: 'سایت رسمی Fortnite اپیک گیمز',
    p1LinkHref: 'https://www.fortnite.com',
    p1AfterLink:
      ' با تم داستانی تازه، کاراکترهای اورجینال و اسکین‌های همکاری بزرگ عرضه می‌شود. با فعال‌سازی بتل‌پس، تمام صفحات جوایز پریمیوم فصل روی اکانت شما باز می‌شوند.',
    p2: 'در صفحات مختلف بتل‌پس مجموعاً تا ۱٬۵۰۰ وی‌باکس جایزه قرار داده شده است؛ یعنی با تکمیل فصل، نه‌تنها کل هزینه بتل‌پس فصل بعد (۱٬۰۰۰ وی‌باکس) را رایگان به دست می‌آورید، بلکه ۵۰۰ وی‌باکس سود خالص نیز خواهید داشت.',
    p3: 'تمام اسکین‌ها، استایل‌های Bonus و آیتم‌هایی که از بتل‌پس آزاد می‌کنید دائمی هستند و در تمام پلتفرم‌های متصل قابل استفاده خواهند بود.',
  },
  benefitsHeader: {
    kicker: 'جوایز و مزایا',
    title: 'با فعال‌سازی بتل‌پس فورتنایت چه آیتم‌هایی دریافت می‌کنید؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      tag: '+۱۰۰ جایزه فصل',
      kicker: 'مزیت اول · گنجینه کامل سیزن',
      title: 'دسترسی به بیش از ۱۰۰ جایزه پریمیوم فصل',
      p1: 'بتل‌پس هر سیزن فورتنایت شامل ۱۴ صفحه اصلی از جوایز پریمیوم است که شامل ۷ تا ۸ اسکین کامل، بک‌بلینگ، پیک‌اکس، گلایدر، پوشش سلاح (Wrap)، ایموت و ترک‌های لابی می‌شود.',
      p2: 'تمامی این آیتم‌ها با تم اختصاصی همان سیزن طراحی شده‌اند و پس از پایان فصل دیگر در صفحات بتل‌پس بعدی تکرار نمی‌شوند.',
      link: 'همه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'آیتم‌شاپ امروز فورتنایت',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(155deg,#241038 0%,#52207a 55%,#c47aff 130%)',
      glow: 'rgba(196,122,255,0.45)',
      ink: '#e0bcff',
      icon: 'medal',
    },
    {
      id: 'b-1',
      tag: '۱٬۵۰۰ وی‌باکس',
      kicker: 'مزیت دوم · سرمایه‌گذاری خودگردان',
      title: 'بازگشت تا ۱٬۵۰۰ وی‌باکس در طول فصل',
      p1: 'در لابه‌لای صفحات بتل‌پس و بخش Bonus Rewards، بسته‌های ۱۰۰ وی‌باکسی قرار دارند که با پیشروی در لول فصل آزاد می‌شوند و در مجموع تا ۱٬۵۰۰ وی‌باکس به موجودی اکانت شما اضافه می‌کنند.',
      p2: 'این وی‌باکس‌ها کاملاً دائمی هستند؛ می‌توانید ۱٬۰۰۰ وی‌باکس آن را برای بتل‌پس سیزن بعدی نگه دارید یا در آیتم‌شاپ روزانه خرج کنید.',
      link: 'خرید وی‌باکس فورتنایت',
      href: '/product/fortnite-vbucks',
      link2: 'مشاهده آیتم‌شاپ امروز',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(155deg,#0f2238 0%,#1d4e78 55%,#5cc8ff 130%)',
      glow: 'rgba(92,200,255,0.45)',
      ink: '#a8e3ff',
      icon: 'coin',
    },
    {
      id: 'b-2',
      tag: 'اسکین فوری',
      kicker: 'مزیت سوم · پاداش لحظه خرید',
      title: 'باز شدن فوری اسکین اول به محض فعال‌سازی',
      p1: 'به محض اینکه بتل‌پس فصل جاری روی اکانت شما فعال شود، حتی در لول ۱ و پیش از انجام اولین مسابقه، اسکین شاخص صفحه اول بتل‌پس بلافاصله در لاکر شما آنلاک می‌گردد.',
      p2: 'اگر قبل از خرید بتل‌پس در طول فصل بازی کرده و لول خود را بالا برده باشید، تمام جوایز صفحات قبلی به‌صورت یک‌جا برایتان قابل دریافت می‌شوند.',
      link: 'خرید کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'خرید استارتر پک',
      href2: '/product/fortnite-starter-pack',
      grad: 'linear-gradient(155deg,#3a1020 0%,#7a1f3d 55%,#f2b84b 130%)',
      glow: 'rgba(242,184,75,0.45)',
      ink: '#ffd88a',
      icon: 'gift',
    },
    {
      id: 'b-3',
      tag: 'Super Styles',
      kicker: 'مزیت چهارم · جوایز لول ۱۰۰ به بعد',
      title: 'استایل‌های Bonus، Super Styles و اسکین مخفی فصل',
      p1: 'پس از تکمیل صفحات اصلی، بخش Bonus Rewards و استایل‌های درخشان Superlevel برای کاراکترهای فصل باز می‌شوند.',
      p2: 'همچنین با انجام ماموریت‌های ویژه فصل (Quest Rewards)، اسکین ویژه میانه فصل و ست کامل تجهیزات او را نیز بدون هزینه اضافه دریافت خواهید کرد.',
      link: 'تورنومنت‌های فورتنایت تایتان',
      href: '/tournaments',
      link2: 'مرکز آموزش تایتان',
      href2: '/guides',
      grad: 'linear-gradient(155deg,#2e1c0c 0%,#6e3f14 55%,#ff9e44 130%)',
      glow: 'rgba(255,158,68,0.45)',
      ink: '#ffd0a1',
      icon: 'sun',
    },
    {
      id: 'b-4',
      tag: 'XP مشترک',
      kicker: 'مزیت پنجم · سیستم پیشروی یکپارچه',
      title: 'کسب XP و لول‌آپ از تمام مودهای بازی فورتنایت',
      p1: 'تجربه (XP) کسب‌شده در Battle Royale، Zero Build، Reload، Fortnite OG، مپ‌های Creative، مود LEGO Fortnite، Rocket Racing و Festival مستقیماً لول بتل‌پس شما را بالا می‌برد.',
      p2: 'بنابراین حتی با بازی کردن در مپ‌های تمرینی یا مودهای سرگرمی با دوستانتان، صفحات بتل‌پس شما با سرعت بالا تکمیل می‌شوند.',
      link: 'فروشگاه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'پشتیبانی آنلاین تایتان',
      href2: '/support',
      grad: 'linear-gradient(155deg,#0b2a28 0%,#14635c 55%,#3fffe0 130%)',
      glow: 'rgba(63,255,224,0.45)',
      ink: '#a8fff0',
      icon: 'bolt',
    },
    {
      id: 'b-5',
      tag: 'LEGO Style',
      kicker: 'مزیت ششم · پشتیبانی از مود لگو',
      title: 'شامل نسخه‌های LEGO Style برای اسکین‌های فصل',
      p1: 'تمامی اسکین‌های اورجینال موجود در بتل‌پس فورتنایت دارای نسخه طراحی‌شده LEGO Style هستند و هم‌زمان کاراکتر لگویی آن‌ها را نیز برای مود LEGO Fortnite دریافت می‌کنید.',
      p2: 'تمام این اسکین‌ها و آیتم‌ها روی PC، کنسول‌های پلی‌استیشن و ایکس‌باکس، نینتندو سوییچ و موبایل در دسترس شما خواهند بود.',
      link: 'راهنماهای آموزشی فورتنایت',
      href: '/guides',
      link2: 'پشتیبانی تایتان',
      href2: '/support',
      grad: 'linear-gradient(155deg,#2e2208 0%,#785a10 55%,#ffd23f 130%)',
      glow: 'rgba(255,210,63,0.45)',
      ink: '#ffe899',
      icon: 'cube',
    },
  ],
  activation: {
    kicker: 'فرآیند تحویل سفارش',
    title: 'چطور بتل‌پس فورتنایت روی اکانت شما فعال می‌شود؟',
    lead: 'فعال‌سازی بتل‌پس فصل جاری در تایتان به صورت مستقیم روی اکانت بازی شما انجام می‌شود و نیازی به پرداخت دلاری ندارد.',
    steps: [
      {
        num: '۱',
        title: 'ثبت سفارش ریالی',
        text: 'محصول را به سبد خرید اضافه کنید و مبلغ سفارش را با کارت بانکی عضو شتاب یا کیف پول تایتان پرداخت نمایید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت متصل',
        text: 'در مرحله تسویه حساب یا بخش اکانت‌های من، اطلاعات اکانت بازی خود را ثبت کنید.',
        placeholderKey: 'CREW_ACTIVATION_INFO',
      },
      {
        num: '۳',
        title: 'فعال‌سازی رسمی بتل‌پس فصل',
        text: 'کارشناسان تایتان بتل‌پس فصل جاری را از طریق شارژ رسمی روی اکانت شما فعال می‌کنند تا تمام صفحات فصل باز شود.',
      },
      {
        num: '۴',
        title: 'ورود به بازی و دریافت جوایز',
        text: 'پس از دریافت اعلان تکمیل سفارش، وارد فورتنایت شوید و اسکین اول و جوایز آنلاک‌شده بر اساس لول فعلی‌تان را دریافت کنید.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'شفافیت خرید',
    title: 'قیمت بتل‌پس فورتنایت و زمان تحویل در تایتان',
    tile1Label: 'قیمت بتل‌پس فصل جاری',
    tile1SubWhenNoDiscount: 'شامل بازگشت تا ۱٬۵۰۰ وی‌باکس با تکمیل صفحات بتل‌پس در طول سیزن',
    tile2Label: 'زمان تحویل سفارش',
    tile2Value: '۱۵ دقیقه تا ۲ ساعت',
    tile2Sub: 'پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: 'پلتفرم‌های قابل استفاده',
    tile3Value: 'PC · PS4/PS5 · Xbox · Switch · Mobile',
    tile3Sub: 'روی تمام پلتفرم‌های متصل به یک حساب Epic Games',
    guideNoteBefore: 'برای آشنایی بیشتر با تفاوت بتل‌پس و اشتراک کروپک، می‌توانید ',
    guideLinkLabel: 'مرکز آموزش و راهنماهای فورتنایت',
    guideLinkHref: '/guides',
    guideNoteAfter: ' را در تایتان مطالعه کنید.',
  },
  comparison: {
    kicker: 'بررسی ارزش خرید',
    title: 'خرید بتل‌پس تکی بهتر است یا اشتراک کروپک فورتنایت؟',
    p1: 'بتل‌پس اصلی فورتنایت ۱٬۰۰۰ وی‌باکس ارزش دارد و با تکمیل آن تا ۱٬۵۰۰ وی‌باکس و بیش از ۱۰۰ آیتم فصل را دریافت می‌کنید. اما اگر علاوه بر بتل‌پس اصلی، به ۱٬۰۰۰ وی‌باکس نقدی، اسکین ماهانه و باز شدن هم‌زمان OG Pass، LEGO Pass و Music Pass هم علاقه دارید، اشتراک Fortnite Crew ارزش خرید فوق‌العاده‌ای دارد.',
    p2BeforeVbucks: 'می‌توانید اسکین‌های روزانه را در ',
    shopLinkLabel: 'آیتم‌شاپ فورتنایت',
    shopLinkHref: '/fortnite-shop',
    p2BetweenLinks: ' ببینید و مزایای ',
    vbucksLinkLabel: 'خرید کروپک فورتنایت',
    vbucksLinkHref: '/product/fortnite-crew',
    p2BeforeEpic: ' را نیز بررسی کنید. قوانین رسمی فصل در ',
    epicLinkLabel: 'سایت رسمی اپیک گیمز',
    epicLinkHref: 'https://www.epicgames.com',
    p2AfterEpic: ' قابل مشاهده است.',
    tableHeader: 'محتویات دریافتی با فعال‌سازی بتل‌پس فصل',
    rows: [
      { label: 'ارزش پایه داخل بازی', value: '۱٬۰۰۰ V-Bucks' },
      { label: 'وی‌باکس قابل بازگشت در طول فصل', value: 'تا ۱٬۵۰۰ V-Bucks' },
      { label: 'تعداد اسکین‌های پریمیوم فصل', value: '۷ تا ۸ اسکین + LEGO Style' },
      { label: 'جوایز Bonus و Superlevel Styles', value: 'شامل می‌شود' },
      { label: 'تعداد کل آیتم‌های تزئینی فصل', value: 'بیش از ۱۰۰ آیتم دائمی' },
    ],
    total: {
      label: 'سود خالص وی‌باکس پس از تکمیل فصل',
      value: '+۵۰۰ وی‌باکس اضافه + تمام اسکین‌ها',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: CREW_RELATED_HEADER,
  relatedLinks: [
    { label: 'خرید کروپک فورتنایت', href: '/product/fortnite-crew' },
    { label: 'خرید وی‌باکس فورتنایت', href: '/product/fortnite-vbucks' },
    { label: 'خرید استارتر پک فورتنایت', href: '/product/fortnite-starter-pack' },
    { label: 'آیتم‌شاپ روزانه فورتنایت', href: '/fortnite-shop' },
    { label: 'فروشگاه محصولات فورتنایت', href: '/store/fortnite' },
    { label: 'پشتیبانی آنلاین', href: '/support' },
  ],
  faqHeader: {
    kicker: 'پرسش‌های پرتکرار',
    title: 'سؤالات متداول درباره خرید بتل‌پس فورتنایت',
    subtitle: 'پاسخ کوتاه و دقیق به پرسش‌های خریداران پیش از ثبت سفارش.',
  },
  faqItems: [
    {
      id: 'bp-faq-1',
      question: 'اگر در اواسط یا اواخر فصل بتل‌پس را بخرم، جوایز لول‌های قبلی را می‌گیرم؟',
      answer:
        'بله! تمام لول‌ها و XPهایی که از ابتدای فصل کسب کرده‌اید محفوظ است و به محض فعال شدن بتل‌پس، تمام جوایز صفحات قبلی متناسب با لول فعلی شما یک‌جا باز می‌شوند.',
    },
    {
      id: 'bp-faq-2',
      question: 'با تکمیل بتل‌پس فورتنایت چند وی‌باکس گیرم می‌آید؟',
      answer:
        'با باز کردن تمام صفحات اصلی و صفحات Bonus بتل‌پس، در مجموع تا ۱٬۵۰۰ وی‌باکس دریافت می‌کنید که برای خرید بتل‌پس فصل بعدی (۱٬۰۰۰ وی‌باکس) به علاوه ۵۰۰ وی‌باکس ذخیره کاملاً کافی است.',
    },
    {
      id: 'bp-faq-3',
      question: 'آیا اسکین‌ها و آیتم‌های بتل‌پس بعد از پایان سیزن در اکانتم می‌مانند؟',
      answer:
        'بله؛ هر اسکین، پیک‌اکس، گلایدر، ایموت و وی‌باکسی که در طول فصل از بتل‌پس آنلاک کنید برای همیشه در لاکر اکانت شما باقی می‌ماند.',
    },
    {
      id: 'bp-faq-4',
      question: 'فعال‌سازی بتل‌پس فورتنایت در تایتان چقدر زمان می‌برد؟',
      answer:
        'سفارش بتل‌پس بین ۱۵ دقیقه تا حداکثر ۲ ساعت پس از ثبت نهایی در ساعات کاری روی اکانت شما فعال می‌شود.',
    },
    {
      id: 'bp-faq-5',
      question: 'برای دریافت همه ۱۵۰۰ وی‌باکس بتل‌پس به چه لولی باید برسم؟',
      answer:
        '۱٬۰۰۰ وی‌باکس اول در ۱۴ صفحه اصلی (تا لول ۱۰۰) قرار دارد و ۵۰۰ وی‌باکس باقی‌مانده در صفحات اولیه بخش Bonus Rewards (حدود لول ۱۴۰ تا ۱۵۰) آزاد می‌شود.',
    },
    {
      id: 'bp-faq-6',
      question: 'آیا بتل‌پس روی پلی‌استیشن، ایکس‌باکس، PC و موبایل هم‌زمان فعال می‌شود؟',
      answer:
        'بله؛ چون بتل‌پس روی حساب Epic Games شما فعال می‌گردد، در تمامی پلتفرم‌های متصل به همان اکانت به صورت هم‌زمان فعال و قابل پیشرفت است.',
    },
    {
      id: 'bp-faq-7',
      question: 'بتل‌پس تکی بخرم یا کروپک فورتنایت؟',
      answer:
        'اگر فقط بتل‌پس Battle Royale را می‌خواهید این محصول مناسب است؛ اما کروپک فورتنایت علاوه بر بتل‌پس اصلی، ۱٬۰۰۰ وی‌باکس، اسکین ماهانه، OG Pass، LEGO Pass و Music Pass را هم باز می‌کند.',
    },
    {
      id: 'bp-faq-8',
      question: 'اگر سفارش بتل‌پس به هر دلیل فنی فعال نشود چه می‌شود؟',
      answer:
        'مبلغ پرداختی شما به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود و پشتیبانی ۲۴ ساعته تایتان پاسخگوی شماست.',
    },
  ],
};

/* ==========================================================================
   4. FORTNITE STARTER PACK (/product/fortnite-starter-pack)
   ========================================================================== */
export const FORTNITE_STARTER_PACK_BOT_TEMPLATE: FortniteBotTemplate = {
  slugs: ['fortnite-starter-pack'],
  defaultPriceToman: 1165000,
  defaultOriginalPriceToman: 1190000,
  defaultDiscountPct: 2,
  readMoreSub: 'مشاهده ۶ آیتم و مزیت استارتر پک، مراحل تحویل و سؤالات متداول',
  hero: {
    eyebrow: 'بسته اقتصادی فصل · FORTNITE STARTER PACK',
    title: 'خرید استارتر پک فورتنایت',
    lead: 'استارتر پک فورتنایت به‌صرفه‌ترین پکیج فصلی بازی است که در هر سیزن تنها یک‌بار منتشر می‌شود: دریافت فوری ۶۰۰ وی‌باکس نقدی به همراه یک اسکین انحصاری فصل، استایل لگو، بک‌بلینگ و پیک‌اکس ست با پرداخت ریالی و فعال‌سازی مستقیم روی اکانت شما.',
    factChips: [
      '۶۰۰ وی‌باکس نقدی فوری',
      'اسکین اختصاصی فصل',
      'بک‌بلینگ + پیک‌اکس ست',
      'دارای نسخه LEGO Style',
      'تحویل سریع زیر ۳۰ دقیقه',
    ],
    carouselHint: 'کارت‌ها را بکشید · با زدن کارتِ جلو، به توضیح همان بخش می‌روید',
  },
  intro: {
    kicker: 'معرفی استارتر پک',
    title: 'استارتر پک فورتنایت چیست و چرا با وی‌باکس داخل بازی قابل خرید نیست؟',
    p1BeforeLink: 'استارتر پک فورتنایت یک باندل رسمی است که در ابتدای هر فصل جدید توسط ',
    p1LinkLabel: 'سایت رسمی Fortnite اپیک گیمز',
    p1LinkHref: 'https://www.fortnite.com',
    p1AfterLink:
      ' عرضه می‌شود. برخلاف اسکین‌های معمولی آیتم‌شاپ، این پک با وی‌باکس قابل خرید نیست و تنها با پرداخت مستقیم دلاری در استور فعال می‌گردد.',
    p2: 'دلیل محبوبیت بالای استارتر پک این است که با قیمتی بسیار اقتصادی، هم ۶۰۰ وی‌باکس نقدی به حساب شما اضافه می‌کند و هم یک ست کامل اسکین کلکسیونی به همراه بک‌بلینگ و پیک‌اکس به شما هدیه می‌دهد.',
    p3: 'هر استارتر پک فقط تا پایان همان فصل در فروشگاه باقی می‌ماند، اما آیتم‌ها و ۶۰۰ وی‌باکسی که دریافت کرده‌اید برای همیشه در لاکر اکانت شما ماندگار خواهند بود.',
  },
  benefitsHeader: {
    kicker: 'محتویات کامل پکیج',
    title: 'با خرید استارتر پک فورتنایت چه چیزهایی دریافت می‌کنید؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      tag: '۶۰۰ وی‌باکس',
      kicker: 'مزیت اول · اعتبار نقدی درون‌بازی',
      title: '۶۰۰ وی‌باکس (V-Bucks) فوری و قابل خرج در شاپ',
      p1: 'بلافاصله پس از فعال‌سازی استارتر پک روی اکانت شما، ۶۰۰ عدد وی‌باکس به موجودی حسابتان اضافه می‌شود که برای خرید بتل‌پس، اسکین، ایموت یا گیفت کردن به دوستان کاربرد دارد.',
      p2: 'اگر ۴۰۰ وی‌باکس از فصل‌های قبل در اکانت خود داشته باشید، با همین ۶۰۰ وی‌باکس استارتر پک می‌توانید مستقیماً بتل‌پس ۱٬۰۰۰ وی‌باکسی فصل را فعال کنید.',
      link: 'مشاهده آیتم‌شاپ امروز فورتنایت',
      href: '/fortnite-shop',
      link2: 'خرید وی‌باکس بیشتر',
      href2: '/product/fortnite-vbucks',
      grad: 'linear-gradient(155deg,#0f2238 0%,#1d4e78 55%,#5cc8ff 130%)',
      glow: 'rgba(92,200,255,0.45)',
      ink: '#a8e3ff',
      icon: 'coin',
    },
    {
      id: 'b-1',
      tag: 'اسکین اختصاصی',
      kicker: 'مزیت دوم · کاراکتر کلکسیونی سیزن',
      title: 'اسکین (Outfit) اختصاصی استارتر پک فصل',
      p1: 'هر استارتر پک شامل یک کاراکتر منحصر‌به‌فرد با طراحی ویژه همان فصل است که پس از پایان فصل از فروشگاه خارج شده و جزو آیتم‌های کلکسیونی لاکر محسوب می‌شود.',
      p2: 'این اسکین بلافاصله پس از فعال‌سازی پک، بدون نیاز به انجام هیچ چالش یا لول‌آپی در لاکر شما باز و آماده استفاده در مسابقه است.',
      link: 'همه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'باندل فاینال رکونینگ',
      href2: '/product/fortnite-final-reckoning-pack',
      grad: 'linear-gradient(155deg,#3a1020 0%,#7a1f3d 55%,#f2b84b 130%)',
      glow: 'rgba(242,184,75,0.45)',
      ink: '#ffd88a',
      icon: 'gift',
    },
    {
      id: 'b-2',
      tag: 'LEGO Style',
      kicker: 'مزیت سوم · دنیای لگو فورتنایت',
      title: 'نسخه استایل لگو (LEGO Style) اسکین',
      p1: 'علاوه بر استایل اصلی Battle Royale، اسکین استارتر پک دارای نسخه کامل LEGO Style است تا در مود LEGO Fortnite نیز با همان کاراکتر اختصاصی بازی کنید.',
      p2: 'هر دو استایل به صورت هم‌زمان و خودکار به محض فعال‌سازی بسته به حساب شما اضافه می‌شوند.',
      link: 'خرید کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'خرید بتل‌پس فورتنایت',
      href2: '/product/fortnite-battle-pass',
      grad: 'linear-gradient(155deg,#2e2208 0%,#785a10 55%,#ffd23f 130%)',
      glow: 'rgba(255,210,63,0.45)',
      ink: '#ffe899',
      icon: 'cube',
    },
    {
      id: 'b-3',
      tag: 'بک‌بلینگ ست',
      kicker: 'مزیت چهارم · تجهیزات پشت کاراکتر',
      title: 'بک‌بلینگ (Back Bling) هماهنگ با تم اسکین',
      p1: 'همراه با اسکین اصلی، یک بک‌بلینگ اختصاصی با رنگ‌بندی و جزئیات هماهنگ در پکیج قرار دارد که روی تمام اسکین‌های دیگر لاکر شما نیز قابل نصب است.',
      p2: 'در آیتم‌شاپ فورتنایت، خرید جداگانه یک اسکین و بک‌بلینگ معمولاً حداقل ۱٬۲۰۰ وی‌باکس هزینه دارد که در استارتر پک به همراه ۶۰۰ وی‌باکس یک‌جا عرضه می‌شود.',
      link: 'بررسی آیتم‌شاپ روزانه',
      href: '/fortnite-shop',
      link2: 'راهنمای خرید پک‌های فورتنایت',
      href2: '/guides',
      grad: 'linear-gradient(155deg,#241038 0%,#52207a 55%,#c47aff 130%)',
      glow: 'rgba(196,122,255,0.45)',
      ink: '#e0bcff',
      icon: 'medal',
    },
    {
      id: 'b-4',
      tag: 'پیک‌اکس ست',
      kicker: 'مزیت پنجم · ابزار برداشت منابع',
      title: 'پیک‌اکس (Pickaxe) اختصاصی ست فصل',
      p1: 'ست تزئینی استارتر پک با یک پیک‌اکس خوش‌دست و هماهنگ کامل می‌شود تا از لحظه فرود در مپ، کمبوی ظاهری کاراکتر شما بی‌نقص باشد.',
      p2: 'پیک‌اکس‌های استارتر پک به دلیل طراحی جمع‌وجور و افکت صوتی تمیز، در میان پلیرهای رقابتی و شرکت‌کنندگان تورنومنت‌ها بسیار پرطرفدارند.',
      link: 'تورنومنت‌های فورتنایت تایتان',
      href: '/tournaments',
      link2: 'فروشگاه تایتان',
      href2: '/store',
      grad: 'linear-gradient(155deg,#0b2a28 0%,#14635c 55%,#3fffe0 130%)',
      glow: 'rgba(63,255,224,0.45)',
      ink: '#a8fff0',
      icon: 'bolt',
    },
    {
      id: 'b-5',
      tag: 'ارزش خرید بالا',
      kicker: 'مزیت ششم · صرفه اقتصادی بی‌رقیب',
      title: 'بالاترین ارزش خرید نسبت به وی‌باکس معمولی',
      p1: 'در استور رسمی اپیک گیمز، ارزش مجموع آیتم‌های استارتر پک بیش از ۲٬۳۰۰ وی‌باکس است؛ در حالی که با قیمتی هم‌سطح کوچک‌ترین بسته وی‌باکس عرضه می‌شود.',
      p2: 'به همین دلیل استارتر پک اولین خرید پیشنهادی در هر سیزن برای تمام بازیکنان فورتنایت است.',
      link: 'مرکز آموزش و راهنما',
      href: '/guides',
      link2: 'پشتیبانی آنلاین تایتان',
      href2: '/support',
      grad: 'linear-gradient(155deg,#2e1c0c 0%,#6e3f14 55%,#ff9e44 130%)',
      glow: 'rgba(255,158,68,0.45)',
      ink: '#ffd0a1',
      icon: 'sun',
    },
  ],
  activation: {
    kicker: 'فرآیند تحویل سفارش',
    title: 'چطور استارتر پک روی اکانت شما فعال می‌شود؟',
    lead: 'استارتر پک فصل جاری مستقیماً از طریق استور رسمی روی حساب اپیک گیمز شما فعال می‌شود.',
    steps: [
      {
        num: '۱',
        title: 'ثبت سفارش ریالی',
        text: 'محصول را به سبد خرید اضافه کنید و مبلغ سفارش را با کارت بانکی عضو شتاب یا کیف پول تایتان بپردازید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت متصل',
        text: 'در مرحله تسویه حساب یا بخش اکانت‌های من، اطلاعات اکانت بازی خود را ثبت کنید.',
        placeholderKey: 'CREW_ACTIVATION_INFO',
      },
      {
        num: '۳',
        title: 'خرید رسمی پکیج روی اکانت',
        text: 'کارشناسان تایتان استارتر پک فصل جاری را به صورت مستقیم و با رسید رسمی روی اکانت شما فعال می‌کنند.',
      },
      {
        num: '۴',
        title: 'دریافت فوری ۶۰۰ وی‌باکس و اسکین',
        text: 'بلافاصله پس از تکمیل سفارش، ۶۰۰ وی‌باکس و ست کامل اسکین، بک‌بلینگ و پیک‌اکس در لاکر شما آماده استفاده است.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'شفافیت خرید',
    title: 'قیمت استارتر پک فورتنایت و زمان تحویل در تایتان',
    tile1Label: 'قیمت استارتر پک فصل',
    tile1SubWhenNoDiscount: 'شامل ۶۰۰ وی‌باکس نقدی + اسکین، استایل لگو، بک‌بلینگ و پیک‌اکس اختصاصی',
    tile2Label: 'زمان تحویل سفارش',
    tile2Value: 'کمتر از ۳۰ دقیقه',
    tile2Sub: 'تحویل سریع پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: 'پلتفرم‌های قابل استفاده',
    tile3Value: 'PC · PS4/PS5 · Xbox · Switch · Mobile',
    tile3Sub: 'روی تمام پلتفرم‌های متصل به یک حساب Epic Games',
    guideNoteBefore: 'برای آشنایی بیشتر با پک‌ها و باندل‌های فورتنایت، می‌توانید ',
    guideLinkLabel: 'مرکز آموزش و راهنماهای فورتنایت',
    guideLinkHref: '/guides',
    guideNoteAfter: ' را در تایتان مطالعه کنید.',
  },
  comparison: {
    kicker: 'بررسی ارزش خرید',
    title: 'چرا استارتر پک به‌صرفه‌ترین بسته هر فصل فورتنایت است؟',
    p1: 'اگر بخواهید معادل آیتم‌های داخل استارتر پک (یک اسکین ۱۲۰۰ وی‌باکسی همراه با بک‌بلینگ، یک پیک‌اکس ۸۰۰ وی‌باکسی و ۶۰۰ وی‌باکس نقدی) را جداگانه از آیتم‌شاپ تهیه کنید، باید حدود ۲٬۶۰۰ وی‌باکس هزینه کنید؛ اما با خرید استارتر پک، همه آن‌ها را با قیمتی بسیار اقتصادی دریافت می‌کنید.',
    p2BeforeVbucks: 'اگر در این فصل قبلاً استارتر پک را خریده‌اید و برای ',
    shopLinkLabel: 'آیتم‌شاپ فورتنایت',
    shopLinkHref: '/fortnite-shop',
    p2BetweenLinks: ' به وی‌باکس بیشتری نیاز دارید، صفحه ',
    vbucksLinkLabel: 'خرید وی‌باکس فورتنایت',
    vbucksLinkHref: '/product/fortnite-vbucks',
    p2BeforeEpic: ' یا کروپک گزینه‌های بعدی هستند. اطلاعات رسمی در ',
    epicLinkLabel: 'سایت رسمی اپیک گیمز',
    epicLinkHref: 'https://www.epicgames.com',
    p2AfterEpic: ' در دسترس است.',
    tableHeader: 'ارزش معادل محتویات استارتر پک (به وی‌باکس)',
    rows: [
      { label: 'وی‌باکس نقدی داخل پک', value: '۶۰۰ V-Bucks' },
      { label: 'اسکین اختصاصی فصل + LEGO Style', value: 'معادل ۱٬۲۰۰ V-Bucks' },
      { label: 'بک‌بلینگ ست کاراکتر', value: 'همراه اسکین' },
      { label: 'پیک‌اکس اختصاصی ست', value: 'معادل ۵۰۰ تا ۸۰۰ V-Bucks' },
    ],
    total: {
      label: 'مجموع ارزش واقعی پکیج',
      value: 'معادل ۲٬۳۰۰ تا ۲٬۶۰۰ وی‌باکس',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: CREW_RELATED_HEADER,
  relatedLinks: [
    { label: 'خرید کروپک فورتنایت', href: '/product/fortnite-crew' },
    { label: 'خرید وی‌باکس فورتنایت', href: '/product/fortnite-vbucks' },
    { label: 'خرید بتل‌پس فورتنایت', href: '/product/fortnite-battle-pass' },
    { label: 'باندل فاینال رکونینگ', href: '/product/fortnite-final-reckoning-pack' },
    { label: 'آیتم‌شاپ روزانه فورتنایت', href: '/fortnite-shop' },
    { label: 'پشتیبانی آنلاین', href: '/support' },
  ],
  faqHeader: {
    kicker: 'پرسش‌های پرتکرار',
    title: 'سؤالات متداول درباره خرید استارتر پک فورتنایت',
    subtitle: 'پاسخ کوتاه و دقیق به پرسش‌های خریداران پیش از ثبت سفارش.',
  },
  faqItems: [
    {
      id: 'sp-faq-1',
      question: 'با خرید استارتر پک فورتنایت دقیقاً چه چیزهایی دریافت می‌کنم؟',
      answer:
        '۶۰۰ عدد وی‌باکس نقدی به همراه یک اسکین اختصاصی فصل، نسخه LEGO Style اسکین، بک‌بلینگ ست و پیک‌اکس هماهنگ.',
    },
    {
      id: 'sp-faq-2',
      question: 'آیا می‌توانم استارتر پک یک فصل را دو بار روی یک اکانت بخرم؟',
      answer:
        'خیر؛ طبق قوانین اپیک گیمز هر استارتر پک فصلی فقط یک‌بار روی هر اکانت قابل فعال‌سازی است، اما با شروع فصل جدید و عرضه استارتر پک تازه، می‌توانید پک فصل جدید را نیز تهیه کنید.',
    },
    {
      id: 'sp-faq-3',
      question: 'آیا ۶۰۰ وی‌باکس و اسکین استارتر پک بعد از پایان فصل حذف می‌شوند؟',
      answer:
        'خیر؛ تمام آیتم‌های تزئینی استارتر پک و ۶۰۰ وی‌باکس دریافتی ۱۰۰٪ دائمی هستند و برای همیشه در لاکر اکانت شما باقی می‌مانند.',
    },
    {
      id: 'sp-faq-4',
      question: 'چرا نمی‌توانم استارتر پک را با وی‌باکس داخل اکانت بخرم؟',
      answer:
        'اپیک گیمز استارتر پک‌ها را فقط به عنوان بسته‌های پولی (Real-Money Bundles) عرضه می‌کند تا خودش حاوی ۶۰۰ وی‌باکس باشد؛ در تایتان ما این پرداخت را به صورت ریالی روی اکانت شما انجام می‌دهیم.',
    },
    {
      id: 'sp-faq-5',
      question: 'فعال‌سازی استارتر پک در تایتان چقدر زمان می‌برد؟',
      answer:
        'معمولاً در کمتر از ۳۰ دقیقه (و حداکثر تا ۲ ساعت در ساعات کاری) پس از ثبت سفارش روی اکانت شما فعال می‌گردد.',
    },
    {
      id: 'sp-faq-6',
      question: 'آیا آیتم‌ها و ۶۰۰ وی‌باکس استارتر پک روی PS4، PS5، Xbox و PC قابل استفاده است؟',
      answer:
        'بله؛ به محض فعال‌سازی روی اکانت اپیک گیمز، اسکین و ۶۰۰ وی‌باکس آن در تمام پلتفرم‌های متصل به همان حساب در دسترس خواهد بود.',
    },
    {
      id: 'sp-faq-7',
      question: 'اگر علاوه بر استارتر پک به وی‌باکس بیشتری نیاز داشته باشم چه کنم؟',
      answer:
        'می‌توانید از صفحه خرید وی‌باکس فورتنایت یا اشتراک کروپک فورتنایت برای شارژ بیشتر موجودی اکانت خود استفاده کنید.',
    },
    {
      id: 'sp-faq-8',
      question: 'در صورت بروز مشکل در فعال‌سازی سفارش، شرایط بازگشت وجه چگونه است؟',
      answer:
        'وجه پرداختی شما به صورت کامل به کارت بانکی یا کیف پول شما بازگردانده می‌شود و پشتیبانی ۲۴ ساعته تایتان در کنار شماست.',
    },
  ],
};

/* ==========================================================================
   5. FORTNITE FINAL RECKONING PACK (/product/fortnite-final-reckoning-pack)
   ========================================================================== */
export const FORTNITE_FINAL_RECKONING_BOT_TEMPLATE: FortniteBotTemplate = {
  slugs: ['fortnite-final-reckoning-pack'],
  defaultPriceToman: 1485000,
  defaultOriginalPriceToman: 1845000,
  defaultDiscountPct: 20,
  readMoreSub: 'مشاهده ۶ آیتم باندل فاینال رکونینگ، مراحل فعال‌سازی و سؤالات متداول',
  hero: {
    eyebrow: 'باندل کلکسیونی ۳ اسکینه · THE FINAL RECKONING',
    title: 'خرید باندل فاینال رکونینگ فورتنایت',
    lead: 'باندل The Final Reckoning یکی از محبوب‌ترین و خاص‌ترین پک‌های چنداسکینه تاریخ فورتنایت است: دریافت هم‌زمان ۳ اسکین اپیک (Catrina، Willow و Blacklight) به همراه ۳ بک‌بلینگ اختصاصی و نسخه‌های استایل لگو — با فعال‌سازی مستقیم و دائمی روی اکانت شما.',
    factChips: [
      '۳ اسکین کامل (Catrina، Willow، Blacklight)',
      '۳ بک‌بلینگ اختصاصی ست',
      'شامل ۳ نسخه LEGO Style',
      'استایل قابل تغییر عروسکی Willow',
      'تحویل سریع زیر ۳۰ دقیقه',
    ],
    carouselHint: 'کارت‌ها را بکشید · با زدن کارتِ جلو، به توضیح همان بخش می‌روید',
  },
  intro: {
    kicker: 'معرفی باندل کلکسیونی',
    title: 'باندل The Final Reckoning فورتنایت چیست و چرا بین کلکسیونرها محبوب است؟',
    p1BeforeLink: 'باندل فاینال رکونینگ (The Final Reckoning Pack) یک پکیج کلکسیونی با تم گوتیک در بازی ',
    p1LinkLabel: 'Fortnite اپیک گیمز',
    p1LinkHref: 'https://www.fortnite.com',
    p1AfterLink:
      ' است که تنها در بازه‌های زمانی خاص عرضه می‌شود و شامل ۶ آیتم اپیک (۳ اسکین کامل و ۳ بک‌بلینگ اختصاصی) به همراه ۳ استایل لگو است.',
    p2: 'برخلاف باندل‌های معمولی شاپ، این مجموعه یک پک دلاری (Real-Money Pack) است و با وی‌باکس قابل خریداری نیست. طراحی کاراکترهای Catrina، Willow (با استایل سر عروسکی) و Blacklight باعث شده این پک در میان پلیرهای حرفه‌ای جایگاه ویژه‌ای داشته باشد.',
    p3: 'با خرید این باندل از فروشگاه تایتان، هر ۶ آیتم تزئینی به صورت مستقیم و دائمی روی حساب اپیک گیمز شما فعال می‌شوند و روی تمام پلتفرم‌های متصل در دسترس خواهند بود.',
  },
  benefitsHeader: {
    kicker: 'محتویات کامل باندل',
    title: 'در باندل فاینال رکونینگ فورتنایت چه اسکین‌ها و آیتم‌هایی قرار دارد؟',
  },
  benefitBlocks: [
    {
      id: 'b-0',
      tag: 'اسکین Catrina',
      kicker: 'آیتم اول · الهام‌گرفته از روز مردگان',
      title: 'اسکین Catrina به همراه بک‌بلینگ Mourning Glory',
      p1: 'اسکین Catrina با طراحی هنری گل‌دار و نقاب سنتی Día de los Muertos یکی از چشم‌نوازترین کاراکترهای این مجموعه است که در بازی جلوه بصری فوق‌العاده‌ای دارد.',
      p2: 'همراه این اسکین، بک‌بلینگ گل‌آرایی‌شده Mourning Glory ارائه می‌شود که با ده‌ها اسکین دیگر لاکر شما نیز به زیبایی ست می‌گردد.',
      link: 'همه محصولات فورتنایت',
      href: '/store/fortnite',
      link2: 'آیتم‌شاپ امروز فورتنایت',
      href2: '/fortnite-shop',
      grad: 'linear-gradient(155deg,#3a1020 0%,#7a1f3d 55%,#f2b84b 130%)',
      glow: 'rgba(242,184,75,0.45)',
      ink: '#ffd88a',
      icon: 'gift',
    },
    {
      id: 'b-1',
      tag: 'اسکین Willow',
      kicker: 'آیتم دوم · دارای ۲ استایل قابل تغییر',
      title: 'اسکین Willow به همراه بک‌بلینگ عروسک Dolly',
      p1: 'اسکین پرطرفدار Willow دارای دو استایل انتخابی (چهره روح‌مانند اصلی و استایل سر عروسکی Doll Head) است که از بخش Edit Style در لاکر می‌توانید بین آن‌ها جابه‌جا شوید.',
      p2: 'بک‌بلینگ اختصاصی او یعنی عروسک Dolly یکی از معروف‌ترین بک‌بلینگ‌های کلکسیونی فورتنایت در میان بازیکنان رقابتی است.',
      link: 'خرید وی‌باکس فورتنایت',
      href: '/product/fortnite-vbucks',
      link2: 'خرید استارتر پک فورتنایت',
      href2: '/product/fortnite-starter-pack',
      grad: 'linear-gradient(155deg,#330d2a 0%,#781860 55%,#ff5ec4 130%)',
      glow: 'rgba(255,94,196,0.45)',
      ink: '#ffb3e2',
      icon: 'sun',
    },
    {
      id: 'b-2',
      tag: 'اسکین Blacklight',
      kicker: 'آیتم سوم · تم نئونی و بنفش تیره',
      title: 'اسکین Blacklight به همراه بال‌های Indigo Wings',
      p1: 'اسکین Blacklight با رنگ‌های نئونی بنفش و آبی شب‌تاب، استایلی مدرن و تهاجمی برای مسابقات Battle Royale و Reload دارد.',
      p2: 'بک‌بلینگ بال‌های درخشان Indigo Wings که همراه این کاراکتر عرضه می‌شود، یکی از محبوب‌ترین بال‌های تیره و نئونی بازی برای ست کردن با اسکین‌های دارک است.',
      link: 'خرید کروپک فورتنایت',
      href: '/product/fortnite-crew',
      link2: 'تورنومنت‌های فورتنایت',
      href2: '/tournaments',
      grad: 'linear-gradient(155deg,#241038 0%,#52207a 55%,#c47aff 130%)',
      glow: 'rgba(196,122,255,0.45)',
      ink: '#e0bcff',
      icon: 'bolt',
    },
    {
      id: 'b-3',
      tag: '۳ استایل لگو',
      kicker: 'آیتم چهارم · پشتیبانی کامل در مود لگو',
      title: 'شامل ۳ نسخه LEGO Style برای هر سه کاراکتر',
      p1: 'علاوه بر استایل‌های اصلی Battle Royale، هر سه کاراکتر Catrina، Willow و Blacklight دارای نسخه اختصاصی LEGO Style هستند.',
      p2: 'بنابراین با یک خرید، عملاً ۶ ظاهر کاراکتر (۳ نسخه بتل رویال + ۳ نسخه لگو) و ۳ بک‌بلینگ به لاکر اکانت شما اضافه می‌شود.',
      link: 'خرید بتل‌پس فورتنایت',
      href: '/product/fortnite-battle-pass',
      link2: 'مرکز آموزش تایتان',
      href2: '/guides',
      grad: 'linear-gradient(155deg,#2e2208 0%,#785a10 55%,#ffd23f 130%)',
      glow: 'rgba(255,210,63,0.45)',
      ink: '#ffe899',
      icon: 'cube',
    },
    {
      id: 'b-4',
      tag: 'باندل کمیاب',
      kicker: 'آیتم پنجم · خارج از آیتم‌شاپ عادی',
      title: 'عرضه محدود؛ غیرقابل خرید با وی‌باکس',
      p1: 'باندل The Final Reckoning در ردیف اسکین‌های وی‌باکسی آیتم‌شاپ روزانه قرار نمی‌گیرد و فقط به صورت پک مستقل عرضه می‌شود؛ به همین دلیل نسبت به اسکین‌های عادی شاپ بسیار خاص‌تر است.',
      p2: 'با فعال‌سازی این پک روی اکانت، تمام ۶ آیتم آن برای همیشه در لاکر شما باقی می‌مانند.',
      link: 'مشاهده آیتم‌شاپ امروز',
      href: '/fortnite-shop',
      link2: 'پشتیبانی آنلاین تایتان',
      href2: '/support',
      grad: 'linear-gradient(155deg,#0b2a28 0%,#14635c 55%,#3fffe0 130%)',
      glow: 'rgba(63,255,224,0.45)',
      ink: '#a8fff0',
      icon: 'medal',
    },
    {
      id: 'b-5',
      tag: 'ارزش ۴٬۵۰۰ وی‌باکس',
      kicker: 'آیتم ششم · صرفه‌جویی چشمگیر',
      title: 'ارزش معادل ۴٬۵۰۰ وی‌باکس در یک باندل یک‌جا',
      p1: 'در فورتنایت هر اسکین رده Epic (به همراه بک‌بلینگ) ۱٬۵۰۰ وی‌باکس قیمت دارد؛ یعنی خرید جداگانه سه کاراکتر مشابه در آیتم‌شاپ ۴٬۵۰۰ وی‌باکس هزینه می‌برد.',
      p2: 'اما در باندل فاینال رکونینگ، هر سه کاراکتر و سه بک‌بلینگ را با قیمتی بسیار کمتر از خرید ۴٬۵۰۰ وی‌باکس تهیه می‌کنید.',
      link: 'مرکز آموزش تایتان',
      href: '/guides',
      link2: 'پشتیبانی آنلاین',
      href2: '/support',
      grad: 'linear-gradient(155deg,#0f2238 0%,#1d4e78 55%,#5cc8ff 130%)',
      glow: 'rgba(92,200,255,0.45)',
      ink: '#a8e3ff',
      icon: 'coin',
    },
  ],
  activation: {
    kicker: 'فرآیند تحویل سفارش',
    title: 'چطور باندل فاینال رکونینگ روی اکانت شما فعال می‌شود؟',
    lead: 'فعال‌سازی این باندل به‌صورت مستقیم و رسمی روی حساب اپیک گیمز یا کنسول متصل شما انجام می‌شود.',
    steps: [
      {
        num: '۱',
        title: 'ثبت سفارش ریالی',
        text: 'محصول را به سبد خرید اضافه کنید و مبلغ سفارش را با کارت بانکی عضو شتاب یا کیف پول تایتان پرداخت نمایید.',
      },
      {
        num: '۲',
        title: 'ثبت اطلاعات اکانت متصل',
        text: 'در مرحله تسویه حساب یا بخش اکانت‌های من، اطلاعات اکانت بازی خود را ثبت کنید.',
        placeholderKey: 'CREW_ACTIVATION_INFO',
      },
      {
        num: '۳',
        title: 'فعال‌سازی رسمی باندل روی اکانت',
        text: 'کارشناسان تایتان باندل The Final Reckoning را از طریق استور رسمی روی حساب شما فعال می‌کنند.',
      },
      {
        num: '۴',
        title: 'اضافه شدن فوری هر ۶ آیتم به لاکر',
        text: 'پس از تکمیل سفارش، هر ۳ اسکین (Catrina، Willow و Blacklight) و ۳ بک‌بلینگ آن‌ها روی تمام پلتفرم‌ها در لاکر شما آماده استفاده هستند.',
      },
    ],
  },
  priceDelivery: {
    kicker: 'شفافیت خرید',
    title: 'قیمت باندل فاینال رکونینگ و زمان تحویل در تایتان',
    tile1Label: 'قیمت باندل کامل (۶ آیتم)',
    tile1SubWhenNoDiscount: 'شامل ۳ اسکین اپیک + ۳ بک‌بلینگ اختصاصی + ۳ استایل لگو',
    tile2Label: 'زمان تحویل سفارش',
    tile2Value: 'کمتر از ۳۰ دقیقه',
    tile2Sub: 'تحویل سریع پس از ثبت نهایی سفارش در ساعات کاری',
    tile3Label: 'پلتفرم‌های قابل استفاده',
    tile3Value: 'PC · PS4/PS5 · Xbox · Switch · Mobile',
    tile3Sub: 'روی تمام پلتفرم‌های متصل به یک حساب Epic Games',
    guideNoteBefore: 'برای آشنایی بیشتر با نحوه تحویل باندل‌های فورتنایت، می‌توانید ',
    guideLinkLabel: 'مرکز آموزش و راهنماهای فورتنایت',
    guideLinkHref: '/guides',
    guideNoteAfter: ' را در تایتان مطالعه کنید.',
  },
  comparison: {
    kicker: 'بررسی ارزش خرید',
    title: 'مقایسه باندل Final Reckoning با خرید اسکین‌های تکی آیتم‌شاپ',
    p1: 'در آیتم‌شاپ فورتنایت، هر اسکین اپیک همراه با بک‌بلینگ ۱٬۵۰۰ وی‌باکس قیمت دارد. بنابراین تهیه ۳ اسکین و ۳ بک‌بلینگ مشابه به صورت جداگانه نیازمند ۴٬۵۰۰ وی‌باکس است؛ در حالی که باندل Final Reckoning هر ۶ آیتم را یک‌جا و با هزینه بسیار کمتری در اختیار شما قرار می‌دهد.',
    p2BeforeVbucks: 'برای مشاهده اسکین‌های روزانه به ',
    shopLinkLabel: 'آیتم‌شاپ فورتنایت',
    shopLinkHref: '/fortnite-shop',
    p2BetweenLinks: ' سر بزنید و اگر پک حاوی وی‌باکس می‌خواهید، ',
    vbucksLinkLabel: 'خرید استارتر پک فورتنایت',
    vbucksLinkHref: '/product/fortnite-starter-pack',
    p2BeforeEpic: ' را بررسی نمایید. اطلاعات بیشتر در ',
    epicLinkLabel: 'سایت رسمی اپیک گیمز',
    epicLinkHref: 'https://www.epicgames.com',
    p2AfterEpic: ' قابل مشاهده است.',
    tableHeader: 'ارزش معادل آیتم‌های باندل در صورت خرید جداگانه',
    rows: [
      { label: 'اسکین Catrina + بک‌بلینگ Mourning Glory', value: 'معادل ۱٬۵۰۰ V-Bucks' },
      { label: 'اسکین Willow (۲ استایل) + بک‌بلینگ Dolly', value: 'معادل ۱٬۵۰۰ V-Bucks' },
      { label: 'اسکین Blacklight + بال‌های Indigo Wings', value: 'معادل ۱٬۵۰۰ V-Bucks' },
      { label: 'نسخه‌های LEGO Style هر ۳ کاراکتر', value: 'رایگان روی باندل' },
    ],
    total: {
      label: 'مجموع ارزش معادل ۶ آیتم باندل',
      value: 'معادل ۴٬۵۰۰ وی‌باکس',
    },
  },
  support: CREW_SUPPORT_CONTENT,
  relatedHeader: CREW_RELATED_HEADER,
  relatedLinks: [
    { label: 'خرید کروپک فورتنایت', href: '/product/fortnite-crew' },
    { label: 'خرید استارتر پک فورتنایت', href: '/product/fortnite-starter-pack' },
    { label: 'خرید وی‌باکس فورتنایت', href: '/product/fortnite-vbucks' },
    { label: 'خرید بتل‌پس فورتنایت', href: '/product/fortnite-battle-pass' },
    { label: 'آیتم‌شاپ روزانه فورتنایت', href: '/fortnite-shop' },
    { label: 'پشتیبانی آنلاین', href: '/support' },
  ],
  faqHeader: {
    kicker: 'پرسش‌های پرتکرار',
    title: 'سؤالات متداول درباره باندل فاینال رکونینگ فورتنایت',
    subtitle: 'پاسخ کوتاه و دقیق به پرسش‌های خریداران پیش از ثبت سفارش.',
  },
  faqItems: [
    {
      id: 'fr-faq-1',
      question: 'باندل فاینال رکونینگ فورتنایت شامل چه اسکین‌ها و آیتم‌هایی است؟',
      answer:
        'این باندل شامل ۶ آیتم اپیک است: اسکین Catrina با بک‌بلینگ Mourning Glory، اسکین Willow (دارای ۲ استایل) با بک‌بلینگ Dolly و اسکین Blacklight با بک‌بلینگ بال‌های Indigo Wings، به همراه ۳ استایل LEGO.',
    },
    {
      id: 'fr-faq-2',
      question: 'آیا باندل Final Reckoning حاوی وی‌باکس هم هست؟',
      answer:
        'خیر؛ تمرکز این باندل روی ارائه ۳ اسکین اپیک کامل و ۳ بک‌بلینگ کلکسیونی (معادل ۴٬۵۰۰ وی‌باکس ارزش آیتم) است. اگر پک حاوی وی‌باکس می‌خواهید، استارتر پک یا کروپک فورتنایت را بررسی کنید.',
    },
    {
      id: 'fr-faq-3',
      question: 'آیا اسکین‌های این باندل بعد از پایان فصل در اکانتم باقی می‌مانند؟',
      answer:
        'بله؛ هر ۳ اسکین و ۳ بک‌بلینگ باندل فاینال رکونینگ دائمی هستند و برای همیشه در لاکر اکانت شما باقی می‌مانند.',
    },
    {
      id: 'fr-faq-4',
      question: 'فعال‌سازی باندل فاینال رکونینگ در تایتان چقدر طول می‌کشد؟',
      answer:
        'سفارش شما معمولاً در کمتر از ۳۰ دقیقه (و حداکثر تا ۲ ساعت در ساعات کاری) به صورت مستقیم روی اکانت شما فعال می‌شود.',
    },
    {
      id: 'fr-faq-5',
      question: 'آیا می‌توانم بک‌بلینگ‌های این پک (مثل بال‌های Indigo Wings یا عروسک Dolly) را روی اسکین‌های دیگرم استفاده کنم؟',
      answer:
        'بله! هر ۳ بک‌بلینگ این مجموعه مستقل هستند و روی تمام اسکین‌های دیگر داخل لاکر شما قابل استفاده می‌باشند.',
    },
    {
      id: 'fr-faq-6',
      question: 'آیا این باندل روی PS4، PS5، Xbox، PC و موبایل قابل استفاده است؟',
      answer:
        'بله؛ پس از فعال‌سازی روی اکانت اپیک گیمز، تمام اسکین‌ها و بک‌بلینگ‌های باندل روی تمام پلتفرم‌های متصل به همان حساب در دسترس خواهند بود.',
    },
    {
      id: 'fr-faq-7',
      question: 'اگر بخواهم در کنار این باندل وی‌باکس هم تهیه کنم چه گزینه‌ای بهتر است؟',
      answer:
        'می‌توانید از صفحه خرید وی‌باکس فورتنایت بسته دلخواه خود را انتخاب کنید یا با خرید کروپک فورتنایت ۱٬۰۰۰ وی‌باکس و همه پس‌ها را دریافت نمایید.',
    },
    {
      id: 'fr-faq-8',
      question: 'آیا خرید باندل از تایتان شامل ضمانت بازگشت وجه است؟',
      answer:
        'بله؛ در صورتی که به هر دلیل فنی امکان فعال‌سازی باندل در زمان اعلام‌شده نباشد، مبلغ پرداختی به صورت کامل بازگردانده می‌شود.',
    },
  ],
};

export const ALL_FORTNITE_BOT_TEMPLATES: FortniteBotTemplate[] = [
  FORTNITE_CREW_BOT_TEMPLATE,
  FORTNITE_VBUCKS_BOT_TEMPLATE,
  FORTNITE_BATTLE_PASS_BOT_TEMPLATE,
  FORTNITE_STARTER_PACK_BOT_TEMPLATE,
  FORTNITE_FINAL_RECKONING_BOT_TEMPLATE,
];

const FORTNITE_BOT_SLUGS = new Set<string>(
  ALL_FORTNITE_BOT_TEMPLATES.flatMap(t => t.slugs),
);

export function isFortniteBotTemplateProduct(
  slug?: string | null,
  product?: Product | null,
): boolean {
  if (slug && FORTNITE_BOT_SLUGS.has(slug)) return true;
  if (product?.slug && FORTNITE_BOT_SLUGS.has(product.slug)) return true;
  if (
    product?.game?.slug === 'fortnite' &&
    product?.category?.slug !== 'gear'
  ) {
    return true;
  }
  return false;
}

export function getFortniteBotTemplate(
  slug?: string | null,
  product?: Product | null,
): FortniteBotTemplate {
  const targetSlug = slug || product?.slug || 'fortnite-crew';
  const found = ALL_FORTNITE_BOT_TEMPLATES.find(t =>
    t.slugs.includes(targetSlug),
  );
  if (found) return found;
  if (product) {
    return {
      ...FORTNITE_STARTER_PACK_BOT_TEMPLATE,
      slugs: [product.slug],
      defaultPriceToman: product.price || 589000,
      defaultOriginalPriceToman:
        product.originalPrice && product.originalPrice > (product.price || 0)
          ? product.originalPrice
          : product.price || 589000,
      defaultDiscountPct: product.discountPercent || 0,
      hero: {
        eyebrow: 'محصول رسمی فورتنایت · FORTNITE',
        title: `خرید ${product.title}`,
        lead:
          product.subtitle ||
          `خرید و فعال‌سازی مستقیم ${product.title} روی اکانت اپیک گیمز، پلی‌استیشن، ایکس‌باکس و موبایل با پرداخت امن ریالی و پشتیبانی ۲۴ ساعته در تایتان.`,
        factChips:
          product.tags && product.tags.length > 0
            ? product.tags.slice(0, 5)
            : [
                'فعال‌سازی مستقیم روی اکانت',
                'قابل استفاده در تمام پلتفرم‌ها',
                'پرداخت امن ریالی',
                'تحویل سریع سفارش',
                'پشتیبانی ۲۴ ساعته تایتان',
              ],
        carouselHint:
          'کارت‌ها را بکشید · با زدن کارتِ جلو، به توضیح همان بخش می‌روید',
      },
    };
  }
  return FORTNITE_CREW_BOT_TEMPLATE;
}
