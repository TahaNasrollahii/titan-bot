import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX, Hourglass } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { walletApi } from '@/api/endpoints';
import type { Payment } from '@/api/types';
import { dateTime, toman } from '@/lib/format';
import { keys } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { Confetti } from '@/ui/Confetti';
import { ErrorState } from '@/ui/Empty';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

import '../checkout/checkout.css';

const PURPOSE: Record<Payment['purpose'], string> = {
  order: 'خرید از فروشگاه',
  tournament_registration: 'ثبت‌نام تورنمنت',
  wallet_topup: 'شارژ کیف پول',
};

function nextStep(payment: Payment): { to: string; label: string } {
  if (payment.purpose === 'order' && payment.reference) return { to: `/orders/${payment.reference}`, label: 'مشاهده‌ی سفارش' };
  if (payment.purpose === 'tournament_registration' && payment.reference)
    return { to: `/tournaments/${payment.reference}`, label: 'رفتن به تورنمنت' };
  return { to: '/wallet', label: 'رفتن به کیف پول' };
}

/** Where the gateway hands back to: /payments/:id inside the app, or /payment/result?paymentId=… */
export default function PaymentStatus() {
  const { id: pathId } = useParams();
  const [params] = useSearchParams();
  const id = pathId ?? params.get('paymentId') ?? '';
  const queryClient = useQueryClient();

  const payment = useQuery({
    queryKey: ['payment', id],
    queryFn: () => walletApi.payment(id),
    enabled: /^\d+$/.test(id),
    refetchInterval: query => (query.state.data?.status === 'initiated' ? 3000 : false),
  });

  const status = payment.data?.status;
  const announced = useRef(false);
  useEffect(() => {
    if (!status || status === 'initiated' || announced.current) return;
    announced.current = true;
    if (status === 'paid') haptic.success();
    else haptic.error();
    void queryClient.invalidateQueries({ queryKey: keys.wallet });
    void queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [status, queryClient]);

  if (!/^\d+$/.test(id) || payment.isError)
    return (
      <Screen title="نتیجه‌ی پرداخت" fallback="/">
        <ErrorState error={payment.error} />
      </Screen>
    );
  if (!payment.data)
    return (
      <Screen title="نتیجه‌ی پرداخت" fallback="/">
        <Skeleton h={260} r={28} />
      </Screen>
    );

  const p = payment.data;
  const view =
    p.status === 'paid'
      ? { tone: '#3ddc84', icon: CircleCheck, title: 'پرداخت موفق بود' }
      : p.status === 'initiated'
        ? { tone: '#ffb547', icon: Hourglass, title: 'در انتظار تأیید بانک…' }
        : { tone: '#ff8a80', icon: CircleX, title: p.status === 'cancelled' ? 'پرداخت لغو شد' : 'پرداخت ناموفق بود' };
  const Icon = view.icon;
  const next = nextStep(p);

  return (
    <Screen title="نتیجه‌ی پرداخت" fallback="/">
      <div className="order-status" style={{ '--tone': view.tone } as CSSProperties}>
        {p.status === 'paid' && <Confetti />}
        <span className="order-status__icon">
          <Icon size={38} className={p.status === 'initiated' ? 'spin-slow' : undefined} />
        </span>
        <h1>{view.title}</h1>
        <p className="num" style={{ fontSize: 'var(--fs-xl)', fontWeight: 900, color: 'var(--text)' }}>
          {toman(p.amount)}
        </p>
        <p>{PURPOSE[p.purpose]}</p>
        {p.status === 'initiated' && <p>اگر پرداخت را در مرورگر کامل کرده‌ای، چند ثانیه صبر کن.</p>}
        {(p.status === 'failed' || p.status === 'cancelled') && <p>اگر مبلغی کسر شده، حداکثر تا ۷۲ ساعت به حسابت برمی‌گردد.</p>}
      </div>

      <div className="summary card card--pad">
        {p.refId && (
          <div>
            <span>کد پیگیری</span>
            <span className="num ltr" data-selectable>
              {p.refId}
            </span>
          </div>
        )}
        {p.cardPan && (
          <div>
            <span>کارت</span>
            <span className="num ltr">{p.cardPan}</span>
          </div>
        )}
        <div>
          <span>زمان</span>
          <span className="num">{dateTime(p.paidAt ?? p.createdAt)}</span>
        </div>
      </div>

      <Link to={next.to} replace className="btn btn--primary btn--block btn--lg section">
        {next.label}
      </Link>
    </Screen>
  );
}
