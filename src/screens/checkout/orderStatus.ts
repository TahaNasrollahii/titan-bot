import { Ban, CircleCheck, Clock, CreditCard, Loader, RotateCcw, type LucideIcon } from 'lucide-react';

import type { OrderStatus } from '@/api/types';

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string; icon: LucideIcon; text: string }> = {
  pending_payment: { label: 'در انتظار پرداخت', tone: '#ffb547', icon: Clock, text: 'پرداخت هنوز تأیید نشده است.' },
  paid: { label: 'پرداخت شد', tone: '#4cc3ff', icon: CreditCard, text: 'پرداخت تأیید شد؛ سفارش در صف تحویل است.' },
  processing: { label: 'در حال تحویل', tone: '#a78bfa', icon: Loader, text: 'همکاران ما در حال انجام سفارش هستند.' },
  completed: { label: 'تحویل شد', tone: '#3ddc84', icon: CircleCheck, text: 'سفارش با موفقیت تحویل شد. بازی خوبی داشته باشی!' },
  cancelled: { label: 'لغو شده', tone: '#c98d92', icon: Ban, text: 'این سفارش لغو شده است.' },
  failed: { label: 'ناموفق', tone: '#ff8a80', icon: Ban, text: 'پرداخت ناموفق بود. مبلغ کسرشده طی ۷۲ ساعت برمی‌گردد.' },
  refunded: { label: 'بازپرداخت شد', tone: '#c98d92', icon: RotateCcw, text: 'مبلغ این سفارش به کیف پول برگشت داده شد.' },
};
