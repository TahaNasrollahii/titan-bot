import type { Product } from '@/api/types';
import { faDigits, num } from '@/lib/format';

export type CrewIconName =
  | 'gift'
  | 'coin'
  | 'medal'
  | 'sun'
  | 'cube'
  | 'note'
  | 'bolt';

export interface CrewBenefitBlock {
  id: string;
  tag: string;
  kicker: string;
  title: string;
  p1: string;
  p2: string;
  link: string;
  href: string;
  link2: string;
  href2: string;
  grad: string;
  glow: string;
  ink: string;
  icon: CrewIconName;
}

export interface CrewActivationStep {
  num: string;
  title: string;
  text: string;
  placeholderKey?: 'CREW_ACTIVATION_INFO';
}

export interface CrewComparisonRow {
  label: string;
  value: string;
}

export interface CrewFaqItem {
  id: string;
  question: string;
  answer: string;
  answerBeforeLink?: string;
  answerLinkLabel?: string;
  answerLinkHref?: string;
  answerAfterLink?: string;
}

export interface CrewRelatedLink {
  label: string;
  href: string;
}

export const CREW_ACTIVATION_INFO = '';

export const CREW_DEFAULT_PRICE_TOMAN = 589000;
export const CREW_DEFAULT_ORIGINAL_PRICE_TOMAN = 790000;

export function resolveCrewPricing(product?: Product | null) {
  const activeVariant =
    product?.variants?.find((v) => v.inStock) ?? product?.variants?.[0] ?? null;

  const priceToman =
    activeVariant?.price ?? product?.price ?? CREW_DEFAULT_PRICE_TOMAN;

  const rawOriginal =
    activeVariant?.originalPrice ??
    product?.originalPrice ??
    CREW_DEFAULT_ORIGINAL_PRICE_TOMAN;

  const originalPriceToman =
    rawOriginal && rawOriginal > priceToman
      ? rawOriginal
      : CREW_DEFAULT_ORIGINAL_PRICE_TOMAN;

  const discountPct =
    originalPriceToman > priceToman
      ? Math.round(
          ((originalPriceToman - priceToman) / originalPriceToman) * 100,
        )
      : 25;

  return {
    priceToman,
    originalPriceToman,
    discountPct,
    priceFormatted: `${num(priceToman)} تومان`,
    originalPriceFormatted: `${num(originalPriceToman)} تومان`,
    discountFormatted: `${faDigits(discountPct)}٪ تخفیف نسبت به قیمت پایه ${num(originalPriceToman)} تومان`,
  };
}

export const CREW_BENEFIT_BLOCKS: CrewBenefitBlock[] = [
  {
    id: 'b-0',
    tag: 'باندل ماهانه',
    kicker: 'مزیت اول · آیتم‌های انحصاری',
    title: 'باندل اسکین و آیتم‌های ماهانه (Crew Pack)',
    p1: 'در روز اول هر ماه میلادی، یک ست تزئینی کامل شامل اسکین (Outfit)، نسخه استایل لگو (LEGO Style)، بک‌بلینگ، پیک‌اکس و گاهی گلایدر یا صفحه لودینگ به اعضای Crew داده می‌شود. این آیتم‌ها مختص اعضای اشتراک هستند و در آیتم‌شاپ عادی فروخته نمی‌شوند.',
    p2: 'علاوه بر اسکین ماه، با هر ماه فعال بودن اشتراک، یک مرحله از استایل‌های میراثی (Crew Legacy Styles) برای اسکین‌های کروپک قبلی شما باز می‌شود.',
    link: 'مشاهده آیتم‌شاپ امروز فورتنایت',
    href: '/fortnite-shop',
    link2: 'همه محصولات فورتنایت',
    href2: '/store/fortnite',
    grad: 'linear-gradient(155deg,#3a1020 0%,#7a1f3d 55%,#f2b84b 130%)',
    glow: 'rgba(242,184,75,0.45)',
    ink: '#ffd88a',
    icon: 'gift',
  },
  {
    id: 'b-1',
    tag: '۱٬۰۰۰ V-Bucks',
    kicker: 'مزیت دوم · اعتبار درون‌بازی',
    title: '۱٬۰۰۰ وی‌باکس ماهانه',
    p1: 'با فعال‌سازی اشتراک، ۱٬۰۰۰ عدد V-Bucks به موجودی اکانت شما اضافه می‌شود. این وی‌باکس‌ها روی تمام پلتفرم‌های متصل به حساب اپیک گیمز شما در دسترس است و می‌توانید از آن برای خرید اسکین، ایموت یا باندل در آیتم‌شاپ فورتنایت استفاده کنید.',
    p2: 'اگر در طول فصل به وی‌باکس بیشتری نیاز داشته باشید، امکان تهیه بسته‌های جداگانه نیز وجود دارد.',
    link: 'خرید وی‌باکس فورتنایت',
    href: '/product/fortnite-vbucks',
    link2: 'ورود به آیتم‌شاپ فورتنایت',
    href2: '/fortnite-shop',
    grad: 'linear-gradient(155deg,#0f2238 0%,#1d4e78 55%,#5cc8ff 130%)',
    glow: 'rgba(92,200,255,0.45)',
    ink: '#a8e3ff',
    icon: 'coin',
  },
  {
    id: 'b-2',
    tag: 'Battle Pass',
    kicker: 'مزیت سوم · بتل رویال',
    title: 'دسترسی کامل به بتل‌پس اصلی (Battle Pass)',
    p1: 'قفل جوایز پریمیوم بتل‌پس فصل جاری Battle Royale بدون پرداخت وی‌باکس جداگانه باز می‌شود. در طول دوره فعال بودن اشتراک، هر جایزه‌ای که با کسب XP آنلاک کنید برای همیشه در لاکر شما می‌ماند.',
    p2: 'اگر در همان فصل بتل‌پس را قبلاً با وی‌باکس خریده باشید و حداکثر تا ۱۴ روز بعد کروپک را فعال کنید، طبق قانون اپیک گیمز معادل وی‌باکس بتل‌پس به حساب شما برمی‌گردد.',
    link: 'فروشگاه محصولات فورتنایت',
    href: '/store/fortnite',
    link2: 'تورنومنت‌های فورتنایت تایتان',
    href2: '/tournaments',
    grad: 'linear-gradient(155deg,#241038 0%,#52207a 55%,#c47aff 130%)',
    glow: 'rgba(196,122,255,0.45)',
    ink: '#e0bcff',
    icon: 'medal',
  },
  {
    id: 'b-3',
    tag: 'OG Pass',
    kicker: 'مزیت چهارم · فصل‌های کلاسیک',
    title: 'دسترسی به OG Pass فورتنایت',
    p1: 'مود Fortnite OG آیتم‌ها و اسکین‌های الهام‌گرفته از فصل‌های کلاسیک فورتنایت را در قالب یک پس جداگانه عرضه می‌کند. با فعال بودن اشتراک Crew، مسیر پریمیوم OG Pass هم بدون هزینه اضافه برای شما باز است.',
    p2: 'پیشرفت شما در هر مود فورتنایت (بتل رویال، ریلود، لگو یا فستیوال) به صورت مشترک XP همه پس‌ها را جلو می‌برد.',
    link: 'مشاهده محصولات فورتنایت',
    href: '/store/fortnite',
    link2: 'راهنماهای آموزشی فورتنایت',
    href2: '/guides',
    grad: 'linear-gradient(155deg,#2e1c0c 0%,#6e3f14 55%,#ff9e44 130%)',
    glow: 'rgba(255,158,68,0.45)',
    ink: '#ffd0a1',
    icon: 'sun',
  },
  {
    id: 'b-4',
    tag: 'LEGO Pass',
    kicker: 'مزیت پنجم · دنیای لگو',
    title: 'دسترسی به LEGO Pass',
    p1: 'در مود LEGO Fortnite یک پس اختصاصی شامل ساختمان‌ها، دکورها و اسکین‌های استایل لگو وجود دارد که قیمت جداگانه آن ۱٬۴۰۰ وی‌باکس است. اعضای Fortnite Crew بدون پرداخت جداگانه به تمام جوایز پریمیوم LEGO Pass دسترسی دارند.',
    p2: 'علاوه بر این، اسکین ماهانه کروپک نیز همیشه دارای نسخه LEGO Style برای استفاده در این مود است.',
    link: 'خرید وی‌باکس برای آیتم‌های لگو',
    href: '/product/fortnite-vbucks',
    link2: 'آیتم‌شاپ روزانه فورتنایت',
    href2: '/fortnite-shop',
    grad: 'linear-gradient(155deg,#2e2208 0%,#785a10 55%,#ffd23f 130%)',
    glow: 'rgba(255,210,63,0.45)',
    ink: '#ffe899',
    icon: 'cube',
  },
  {
    id: 'b-5',
    tag: 'Music Pass',
    kicker: 'مزیت ششم · فورتنایت فستیوال',
    title: 'دسترسی به Music Pass (Fortnite Festival)',
    p1: 'مود Fortnite Festival در هر فصل یک Music Pass با ارزش ۱٬۴۰۰ وی‌باکس ارائه می‌دهد که شامل Jam Trackها، سازهای موسیقی و اسکین هنرمند فصل است. با اشتراک کروپک، مسیر پریمیوم این پس نیز به صورت خودکار فعال می‌شود.',
    p2: 'تمام ترک‌ها و سازهایی که در دوره اشتراک آزاد می‌کنید، در لابی و مودهای دیگر فورتنایت هم قابل استفاده هستند.',
    link: 'مشاهده آیتم‌شاپ فورتنایت',
    href: '/fortnite-shop',
    link2: 'همه محصولات فورتنایت در تایتان',
    href2: '/store/fortnite',
    grad: 'linear-gradient(155deg,#330d2a 0%,#781860 55%,#ff5ec4 130%)',
    glow: 'rgba(255,94,196,0.45)',
    ink: '#ffb3e2',
    icon: 'note',
  },
  {
    id: 'b-6',
    tag: 'Rocket Pass',
    kicker: 'مزیت هفتم · بازی دوم روی همان اکانت',
    title: 'Rocket Pass Premium در بازی Rocket League',
    p1: 'چنانچه بازی Rocket League را با همان اکانت Epic Games اجرا کنید، اشتراک Rocket Pass Premium فصل جاری راکت لیگ بدون پرداخت جداگانه برایتان فعال می‌شود.',
    p2: 'بسیاری از بدنه ماشین‌ها، چرخ‌ها و دکال‌هایی که در راکت لیگ آزاد می‌کنید به دلیل قابلیت Cross-Game Ownership مستقیماً در فورتنایت هم قابل استفاده هستند.',
    link: 'مرکز آموزش و راهنمای اکانت اپیک',
    href: '/guides',
    link2: 'پشتیبانی و ارتباط با تایتان',
    href2: '/support',
    grad: 'linear-gradient(155deg,#0b2a28 0%,#14635c 55%,#3fffe0 130%)',
    glow: 'rgba(63,255,224,0.45)',
    ink: '#a8fff0',
    icon: 'bolt',
  },
];

export const CREW_HERO_CONTENT = {
  eyebrow: 'اشتراک ماهانه فورتنایت · FORTNITE CREW',
  title: 'خرید کروپک فورتنایت',
  lead: 'یک اشتراک ماهانه، هفت امتیاز هم‌زمان: ۱٬۰۰۰ وی‌باکس، باندل اسکین انحصاری ماه، هر چهار پس فعال فورتنایت و Rocket Pass پریمیوم راکت لیگ — با پرداخت ریالی و تحویل سریع روی اکانت شما.',
  factChips: [
    '۱٬۰۰۰ وی‌باکس',
    'اسکین ماهانه Crew',
    '۴ پس فورتنایت + راکت پس',
    'تحویل ۱۵ دقیقه تا ۲ ساعت',
    'بدون تمدید خودکار',
  ],
  carouselHint: 'کارت‌ها را بکشید · با زدن کارتِ جلو، به توضیح همان بخش می‌روید',
};

export const CREW_INTRO_CONTENT = {
  kicker: 'معرفی اشتراک',
  title: 'اشتراک فورتنایت کرو چیست و چرا هر ماه عوض می‌شود؟',
  p1BeforeLink: 'اشتراک فورتنایت کرو که در ',
  p1LinkLabel: 'صفحه رسمی Fortnite Crew در سایت اپیک گیمز',
  p1LinkHref: 'https://www.fortnite.com/fortnite-crew-subscription',
  p1AfterLink:
    ' معرفی شده، سرویس عضویت ماهانه بازی Fortnite است. ساختار این اشتراک دو بخش دارد: مزایای ثابت (۱٬۰۰۰ وی‌باکس و دسترسی به پس‌های فعال) و بخش متغیر یعنی باندل اسکین ماهانه که در روز اول هر ماه میلادی (ساعت ۰۳:۳۰ بامداد به وقت ایران) با یک کاراکتر جدید جایگزین می‌شود.',
  p2: 'به همین دلیل محصول کروپک در فروشگاه تایتان همیشه فعال است و هر زمان سفارش دهید، باندل همان ماه میلادی روی اکانت شما فعال خواهد شد. تمام اسکین‌ها، پیک‌اکس‌ها، بک‌بلینگ‌ها و ۱٬۰۰۰ وی‌باکسی که دریافت می‌کنید دائمی هستند و پس از پایان دوره ۳۰ روزه نیز در لاکر شما باقی می‌مانند.',
  p3: 'اگر اشتراک خود را در میانه یک ماه میلادی فعال کنید، چون اعتبار اشتراک ۳۰ روز کامل است، علاوه بر اسکین ماه جاری، اسکین ماه میلادی بعدی را هم در روز اول ماه جدید دریافت می‌کنید.',
};

export const CREW_BENEFITS_HEADER = {
  kicker: 'محتویات کامل اشتراک',
  title: 'با خرید کروپک فورتنایت چه چیزهایی دریافت می‌کنید؟',
};

export const CREW_ACTIVATION_CONTENT = {
  kicker: 'فرآیند تحویل سفارش',
  title: 'چطور کروپک روی اکانت شما فعال می‌شود؟',
  lead: 'فعال‌سازی اشتراک Fortnite Crew در تایتان به صورت مستقیم روی اکانت بازی شما انجام می‌شود و نیازی به کارت بانکی بین‌المللی یا تغییر ریجن دستی از سمت شما ندارد.',
  steps: [
    {
      num: '۱',
      title: 'ثبت سفارش ریالی',
      text: 'محصول را به سبد خرید اضافه کنید و مبلغ را با کارت بانکی عضو شتاب یا کیف پول تایتان پرداخت نمایید.',
    },
    {
      num: '۲',
      title: 'ثبت اطلاعات اکانت متصل',
      text: 'در مرحله تسویه حساب یا بخش اکانت‌های من، اطلاعات اکانت بازی خود را ثبت کنید.',
      placeholderKey: 'CREW_ACTIVATION_INFO',
    },
    {
      num: '۳',
      title: 'هماهنگی تایید دومرحله‌ای',
      text: 'اگر تایید دومرحله‌ای (2FA) روشن است، هنگام پردازش سفارش برای اعلام کد امنیتی در دسترس باشید.',
    },
    {
      num: '۴',
      title: 'فعال‌سازی و لغو تمدید خودکار',
      text: 'کارشناسان تایتان اشتراک یک‌ماهه را فعال کرده و تمدید خودکار (Recurring Billing) را خاموش می‌کنند تا ماه بعد هزینه‌ای کسر نشود.',
    },
  ] satisfies CrewActivationStep[],
};

export const CREW_PRICE_DELIVERY_CONTENT = {
  kicker: 'شفافیت خرید',
  title: 'قیمت کروپک فورتنایت و زمان تحویل در تایتان',
  tiles: [
    {
      label: 'قیمت اشتراک یک‌ماهه',
      valueType: 'price' as const,
    },
    {
      label: 'زمان تحویل سفارش',
      value: '۱۵ دقیقه تا ۲ ساعت',
      sub: 'پس از ثبت نهایی سفارش در ساعات کاری',
      valueType: 'large' as const,
    },
    {
      label: 'پلتفرم‌های قابل استفاده',
      value: 'PC · PS4/PS5 · Xbox · Switch · Mobile',
      sub: 'روی تمام پلتفرم‌های متصل به یک حساب Epic Games',
      valueType: 'medium' as const,
    },
  ],
  guideNoteBefore:
    'برای آشنایی کامل با پیش‌نیازهای اکانت و نحوه اتصال کنسول به اپیک گیمز، می‌توانید ',
  guideLinkLabel: 'راهنمای خرید کروپک فورتنایت در ایران',
  guideLinkHref: '/guides/fortnite-crew-buying-guide',
  guideNoteAfter: ' را در بخش آموزش‌های تایتان مطالعه کنید.',
};

export const CREW_COMPARISON_CONTENT = {
  kicker: 'بررسی ارزش خرید',
  title: 'مقایسه کروپک با خرید جداگانه وی‌باکس و بتل‌پس',
  p1: 'در سیستم جدید فورتنایت، اگر بخواهید هر کدام از پس‌های فصل را جداگانه با وی‌باکس تهیه کنید، مجموع هزینه آن‌ها بیش از ۵٬۸۰۰ وی‌باکس خواهد بود؛ در حالی که با یک دوره اشتراک Fortnite Crew، دسترسی به همه آن‌ها به همراه ۱٬۰۰۰ وی‌باکس و اسکین انحصاری ماه فعال می‌شود.',
  p2BeforeVbucks:
    'بنابراین اگر در ابتدای فصل هستید یا می‌خواهید هم‌زمان پس‌ها و اسکین ماه را بگیرید، کروپک به‌صرفه‌ترین انتخاب است. اما اگر قبلاً اشتراک ماه جاری را فعال کرده‌اید و فقط برای خرید یک اسکین خاص در ',
  shopLinkLabel: 'آیتم‌شاپ فورتنایت',
  shopLinkHref: '/fortnite-shop',
  p2BetweenLinks: ' به وی‌باکس بیشتر نیاز دارید، صفحه ',
  vbucksLinkLabel: 'خرید وی‌باکس فورتنایت',
  vbucksLinkHref: '/product/fortnite-vbucks',
  p2BeforeEpic: ' گزینه مناسب‌تری است. قوانین کامل اشتراک را می‌توانید در ',
  epicLinkLabel: 'سایت رسمی اپیک گیمز',
  epicLinkHref: 'https://www.epicgames.com',
  p2AfterEpic: ' نیز مشاهده کنید.',
  tableHeader: 'ارزش تقریبی در صورت خرید جداگانه',
};

export const CREW_COMPARISON_ROWS: CrewComparisonRow[] = [
  { label: 'وی‌باکس نقدی ماهانه', value: '۱٬۰۰۰ V-Bucks' },
  { label: 'Battle Pass اصلی فورتنایت', value: '۱٬۰۰۰ V-Bucks' },
  { label: 'OG Pass فورتنایت', value: '۱٬۰۰۰ V-Bucks' },
  { label: 'LEGO Pass فورتنایت', value: '۱٬۴۰۰ V-Bucks' },
  { label: 'Music Pass فورتنایت', value: '۱٬۴۰۰ V-Bucks' },
  { label: 'Rocket Pass Premium راکت لیگ', value: '۱٬۰۰۰ Credits' },
  { label: 'باندل اسکین ماهانه Crew', value: 'انحصاری (غیرقابل خرید در شاپ)' },
];

export const CREW_COMPARISON_TOTAL: CrewComparisonRow = {
  label: 'مجموع ارزش با یک اشتراک Crew',
  value: 'بیش از ۵٬۸۰۰ وی‌باکس + اسکین ماه',
};

export const CREW_SUPPORT_CONTENT = {
  kicker: 'پشتیبانی و اطمینان',
  title: 'پشتیبانی ۲۴ ساعته و ضمانت بازگشت وجه',
  pBeforeTerms:
    'وضعیت هر سفارش از لحظه ثبت تا تحویل نهایی در بخش «سفارش‌های من» قابل پیگیری است و تیم پشتیبانی تایتان در تمام مراحل از طریق چت آنلاین و تیکت پاسخگوی شماست. در صورتی که به هر دلیل فنی از سمت فروشگاه امکان فعال‌سازی سفارش در بازه زمانی اعلام‌شده فراهم نشود، مبلغ پرداختی شما به صورت کامل بازگردانده می‌شود. برای ارتباط مستقیم با کارشناسان می‌توانید به بخش ',
  termsLinkLabel: 'پشتیبانی آنلاین تایتان',
  termsLinkHref: '/support',
  pAfterTerms: ' مراجعه کنید.',
};

export const CREW_RELATED_HEADER = {
  kicker: 'دسترسی سریع',
  title: 'صفحه‌های مرتبط در تایتان',
};

export const CREW_RELATED_LINKS: CrewRelatedLink[] = [
  { label: 'خرید وی‌باکس فورتنایت', href: '/product/fortnite-vbucks' },
  { label: 'آیتم‌شاپ روزانه فورتنایت', href: '/fortnite-shop' },
  { label: 'فروشگاه محصولات فورتنایت', href: '/store/fortnite' },
  { label: 'مرکز آموزش و راهنما', href: '/guides' },
  { label: 'تورنومنت‌های فورتنایت', href: '/tournaments' },
  { label: 'پشتیبانی آنلاین', href: '/support' },
];

export const CREW_FAQ_HEADER = {
  kicker: 'پرسش‌های پرتکرار',
  title: 'سؤالات متداول درباره فورتنایت کرو',
  subtitle: 'پاسخ کوتاه و دقیق به پرسش‌های خریداران پیش از ثبت سفارش.',
};

export const CREW_FAQ_ITEMS: CrewFaqItem[] = [
  {
    id: 'faq-1',
    question: 'چرا محصول کروپک فورتنایت همیشه در تایتان موجود است؟',
    answer:
      'اشتراک Fortnite Crew یک سرویس دائمی است که هرگز متوقف نمی‌شود، اما اپیک گیمز در روز اول هر ماه میلادی اسکین و ست تزئینی آن را با یک کاراکتر جدید جایگزین می‌کند. با خرید این محصول در هر تاریخ، باندل همان ماه میلادی روی اکانت شما فعال می‌شود.',
  },
  {
    id: 'faq-2',
    question: 'با خرید کروپک دقیقاً چه چیزهایی روی اکانت فعال می‌شود؟',
    answer:
      '۱٬۰۰۰ وی‌باکس، باندل اسکین و آیتم‌های ماه جاری، دسترسی پریمیوم به هر چهار پس فورتنایت (Battle Pass، OG Pass، LEGO Pass و Music Pass) و همچنین Rocket Pass Premium در بازی Rocket League.',
  },
  {
    id: 'faq-3',
    question: 'فعال‌سازی سفارش چقدر زمان می‌برد؟',
    answer:
      'بین ۱۵ دقیقه تا حداکثر ۲ ساعت پس از ثبت سفارش در ساعات کاری. آماده بودن اطلاعات اکانت و هماهنگی کد تایید دومرحله‌ای به تحویل سریع‌تر کمک می‌کند.',
  },
  {
    id: 'faq-4',
    question: 'آیا با خرید کروپک در اواسط ماه میلادی، اسکین ماه بعد را هم می‌گیرم؟',
    answer:
      'بله؛ چون دوره اشتراک ۳۰ روز کامل است، اگر در میانه ماه میلادی اشتراک را فعال کنید، علاوه بر اسکین ماه جاری، اسکین ماه میلادی بعدی هم در روز اول ماه جدید به لاکر شما اضافه می‌شود.',
  },
  {
    id: 'faq-5',
    question: 'آیا بعد از تمام شدن اشتراک یک‌ماهه، اسکین‌ها و وی‌باکس حذف می‌شوند؟',
    answer:
      'خیر؛ ۱٬۰۰۰ وی‌باکس، باندل اسکین ماهانه و تمام جوایزی که در طول ۳۰ روز اشتراک از بتل‌پس و سایر پس‌ها آزاد کرده‌اید برای همیشه در اکانت شما باقی می‌مانند.',
  },
  {
    id: 'faq-6',
    question: 'اگر قبلاً بتل‌پس فصل جاری را با وی‌باکس خریده باشم چه می‌شود؟',
    answer:
      'طبق قوانین اپیک گیمز، اگر حداکثر تا ۱۴ روز پیش از فعال‌سازی Fortnite Crew بتل‌پس همان فصل را با وی‌باکس خریده باشید، معادل وی‌باکس پرداختی بتل‌پس یک‌بار به موجودی اکانت شما بازگردانده می‌شود.',
  },
  {
    id: 'faq-7',
    question: 'آیا ماه بعد به صورت خودکار هزینه‌ای از حساب من کسر می‌شود؟',
    answer:
      'خیر؛ پرداخت شما در تایتان فقط برای همان دوره یک‌ماهه است و کارشناسان تایتان پس از فعال‌سازی، تمدید خودکار (Recurring Billing) را خاموش می‌کنند.',
  },
  {
    id: 'faq-8',
    question: 'آیا کروپک روی پلی‌استیشن، ایکس‌باکس، کامپیوتر و موبایل کار می‌کند؟',
    answer:
      'بله؛ به شرطی که پلتفرم شما به یک حساب واحد Epic Games متصل باشد، تمام اسکین‌ها، پس‌ها و وی‌باکس دریافتی روی PC، PS4، PS5، Xbox، Nintendo Switch و موبایل در دسترس خواهند بود.',
  },
];
