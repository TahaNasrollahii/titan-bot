import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Gamepad2, Headset, Receipt } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { errorText } from '@/api/client';
import { ordersApi } from '@/api/endpoints';
import type { Order as OrderType } from '@/api/types';
import { dateTime, faDigits, toman } from '@/lib/format';
import { keys } from '@/lib/queries';
import { confirmDialog, haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Confetti } from '@/ui/Confetti';
import { ErrorState } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import { ORDER_STATUS } from './orderStatus';
import './checkout.css';

const LIVE: OrderType['status'][] = ['pending_payment', 'paid', 'processing'];
const STEPS = ['ثبت سفارش', 'پرداخت', 'انجام', 'تحویل'];

function stepOf(status: OrderType['status']): number {
  return { pending_payment: 0, paid: 1, processing: 2, completed: 3 }[status as string] ?? 0;
}

export default function Order() {
  const { number = '' } = useParams();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const order = useQuery({
    queryKey: ['order', number],
    queryFn: () => ordersApi.get(number),
    // Watch the order move along while it is in flight (e.g. the gateway confirming in the browser).
    refetchInterval: query => (query.state.data && LIVE.includes(query.state.data.status) ? 4000 : false),
  });

  // Celebrate once, when a payment that was just made turns into a paid order.
  const previous = useRef<OrderType['status'] | null>(null);
  const celebrate = useRef(params.get('new') === '1');
  useEffect(() => {
    const status = order.data?.status;
    if (!status) return;
    if (previous.current === 'pending_payment' && status !== 'pending_payment' && status !== 'failed' && status !== 'cancelled') {
      celebrate.current = true;
      haptic.success();
      void queryClient.invalidateQueries({ queryKey: keys.wallet });
    }
    previous.current = status;
  }, [order.data?.status, queryClient]);

  const cancel = useMutation({
    mutationFn: () => ordersApi.cancel(number),
    onSuccess: data => {
      queryClient.setQueryData(['order', number], data);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('سفارش لغو شد');
    },
    onError: error => toast.error(errorText(error)),
  });

  if (order.isError)
    return (
      <Screen title="سفارش" fallback="/orders">
        <ErrorState error={order.error} onRetry={() => order.refetch()} />
      </Screen>
    );
  if (!order.data)
    return (
      <Screen title="سفارش" fallback="/orders">
        <div className="stack">
          <Skeleton h={220} r={28} />
          <Skeleton h={140} r={20} />
        </div>
      </Screen>
    );

  const o = order.data;
  const status = ORDER_STATUS[o.status];
  const Icon = status.icon;
  const step = stepOf(o.status);
  const awaitingGateway = o.status === 'pending_payment' && params.get('pay') === '1';

  return (
    <Screen title={`سفارش ${o.number}`} fallback="/orders">
      <div className="order-status" style={{ '--tone': status.tone } as CSSProperties}>
        {celebrate.current && o.status !== 'pending_payment' && <Confetti />}
        <span className="order-status__icon">
          <Icon size={36} className={o.status === 'processing' ? 'spin-slow' : undefined} />
        </span>
        <h1>{awaitingGateway ? 'منتظر پرداخت در درگاه…' : status.label}</h1>
        <p>{awaitingGateway ? 'پرداخت را در مرورگر کامل کن؛ وضعیت این‌جا خودکار به‌روز می‌شود.' : status.text}</p>
        {(LIVE.includes(o.status) || o.status === 'completed') && (
          <div className="timeline" style={{ alignSelf: 'stretch' }}>
            <span className="timeline__fill" style={{ width: `calc(${(step / 3) * 100}% - ${(step / 3) * 28}px)` }} />
            {STEPS.map((label, i) => {
              const done = i <= step;
              return (
                <span key={label} className="timeline__step" data-done={done}>
                  <span className="timeline__dot">{done ? <Check size={14} /> : faDigits(i + 1)}</span>
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <section className="section">
        <h2 className="pd__label">اقلام سفارش</h2>
        <div className="list">
          {o.items.map(item => (
            <div key={item.id} className="list-row" style={{ alignItems: 'flex-start' }}>
              <Img src={item.image} alt="" contain style={{ width: 48, height: 48, borderRadius: 12 }} />
              <div className="list-row__body">
                <div className="list-row__title" style={{ whiteSpace: 'normal' }}>
                  {item.title}
                </div>
                <div className="list-row__sub num">
                  {item.variantLabel ? `${item.variantLabel} · ` : ''}
                  {faDigits(item.quantity)} × {toman(item.unitPrice)}
                </div>
                {item.deliveredCode && <DeliveredCode code={item.deliveredCode} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {o.gameAccountUsername && (
        <section className="section">
          <div className="list">
            <div className="list-row">
              <span className="list-row__icon">
                <Gamepad2 size={18} />
              </span>
              <div className="list-row__body">
                <div className="list-row__title">{o.gameAccountTitle || 'اکانت بازی'}</div>
                <div className="list-row__sub ltr" style={{ textAlign: 'right' }}>
                  {o.gameAccountUsername}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="summary card card--pad">
        <div>
          <span>تاریخ ثبت</span>
          <span className="num">{dateTime(o.createdAt)}</span>
        </div>
        <div>
          <span>روش پرداخت</span>
          <span>{o.paymentMethod === 'wallet' ? 'کیف پول' : 'درگاه بانکی'}</span>
        </div>
        {o.discount > 0 && (
          <div className="summary__discount">
            <span>تخفیف</span>
            <span className="num">− {toman(o.discount)}</span>
          </div>
        )}
        <div className="summary__total">
          <span>مبلغ کل</span>
          <strong className="num">{toman(o.total)}</strong>
        </div>
      </div>

      <div className="stack section" style={{ '--gap': '10px' } as CSSProperties}>
        <Link to="/support" className="btn btn--glass btn--block">
          <Headset size={18} /> سؤالی درباره‌ی این سفارش داری؟
        </Link>
        {o.status === 'pending_payment' && (
          <Button
            variant="danger"
            block
            loading={cancel.isPending}
            icon={<Receipt size={18} />}
            onClick={async () => {
              if (await confirmDialog('این سفارش لغو شود؟')) cancel.mutate();
            }}
          >
            لغو سفارش
          </Button>
        )}
      </div>
    </Screen>
  );
}

function DeliveredCode({ code }: { code: string }) {
  return (
    <div className="code-box" data-selectable>
      <span>{code}</span>
      <button
        aria-label="کپی کد"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            toast.success('کد کپی شد');
          } catch {
            toast.error('کپی نشد؛ کد را نگه دار و دستی کپی کن.');
          }
        }}
      >
        <Copy size={16} />
      </button>
    </div>
  );
}
