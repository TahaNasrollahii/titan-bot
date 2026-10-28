const faNumber = new Intl.NumberFormat('fa-IR');
const faDate = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' });
const faDateTime = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const relative = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });

export const num = (value: number) => faNumber.format(value);

/** Integer Toman amount, e.g. ۱۲۵٬۰۰۰ تومان. */
export const toman = (value: number) => `${faNumber.format(value)} تومان`;

export const money = (amount: number, currency: 'IRT' | 'USD' = 'IRT') =>
  currency === 'USD' ? `$${new Intl.NumberFormat('en-US').format(amount)}` : toman(amount);

/** Short form for tight spaces: ۲.۵ میلیون / ۳۵۰ هزار */
export function compactToman(value: number): string {
  if (value >= 1_000_000) return `${faNumber.format(Math.round(value / 100_000) / 10)} میلیون`;
  if (value >= 1_000) return `${faNumber.format(Math.round(value / 1_000))} هزار`;
  return faNumber.format(value);
}

export const date = (iso: string) => faDate.format(new Date(iso));
export const dateTime = (iso: string) => faDateTime.format(new Date(iso));

export function timeAgo(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 45) return 'همین الان';
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86400],
    ['week', 604800],
    ['month', 2592000],
    ['year', 31536000],
  ];
  let unit: Intl.RelativeTimeFormatUnit = 'minute';
  let size = 60;
  for (const [u, s] of units) if (abs >= s) [unit, size] = [u, s];
  return relative.format(Math.round(seconds / size), unit);
}

/** "۲ روز و ۴ ساعت" style countdown parts for a future date, or null once it has passed. */
export function countdown(iso: string, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const LATIN = '0123456789';
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';

/** Persian/Arabic digits → ASCII (for inputs). */
export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, d => LATIN[PERSIAN.indexOf(d) >= 0 ? PERSIAN.indexOf(d) : ARABIC.indexOf(d)]);
}

export const faDigits = (value: string | number) => String(value).replace(/\d/g, d => PERSIAN[Number(d)]);
