import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Gift, Plus, RotateCcw, Settings2, ShoppingBag, Trophy, Wallet as WalletIcon } from 'lucide-react';
import { m } from 'motion/react';
import { useState, type CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { errorText } from '@/api/client';
import { walletApi } from '@/api/endpoints';
import type { WalletTransaction } from '@/api/types';
import { compactToman, date, num, timeAgo, toLatinDigits, toman } from '@/lib/format';
import { useWallet } from '@/lib/queries';
import { haptic, openExternal } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { Skeleton, SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import './wallet.css';

const MIN = 10_000;
const MAX = 50_000_000;
const PRESETS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

const KIND: Record<string, { label: string; icon: typeof Plus }> = {
  topup: { label: 'شارژ کیف پول', icon: ArrowDownLeft },
  order_payment: { label: 'خرید از فروشگاه', icon: ShoppingBag },
  tournament_fee: { label: 'ورودی تورنمنت', icon: Trophy },
  refund: { label: 'بازگشت وجه', icon: RotateCcw },
  prize: { label: 'جایزه', icon: Gift },
  adjustment: { label: 'اصلاح موجودی', icon: Settings2 },
};

export default function Wallet() {
  const [params, setParams] = useSearchParams();
  const wallet = useWallet();
  const transactions = useQuery({ queryKey: ['wallet', 'transactions'], queryFn: walletApi.transactions });
  const topupParam = params.get('topup');
  const [open, setOpen] = useState(topupParam !== null);
  const suggested = topupParam && /^\d+$/.test(topupParam) && Number(topupParam) >= MIN ? Number(topupParam) : null;

  const close = () => {
    setOpen(false);
    if (topupParam !== null) setParams({}, { replace: true });
  };

  return (
    <Screen title="کیف پول" fallback="/me">
      <m.div
        className="wallet-card"
        initial={{ rotateX: 12, opacity: 0, y: 10 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 160 }}
      >
        <div className="wallet-card__shine" aria-hidden />
        <div className="row">
          <span className="wallet-card__chip">
            <WalletIcon size={18} />
          </span>
          <span className="wallet-card__brand">TITAN WALLET</span>
        </div>
        <div className="wallet-card__label">موجودی</div>
        {wallet.data ? (
          <div className="wallet-card__balance num">
            {num(wallet.data.balance)} <small>تومان</small>
          </div>
        ) : (
          <Skeleton h={40} w="60%" />
        )}
        <Button onClick={() => setOpen(true)} icon={<Plus size={18} />} className="wallet-card__cta">
          شارژ کیف پول
        </Button>
      </m.div>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">تراکنش‌ها</h2>
        </div>
        {transactions.isError ? (
          <ErrorState error={transactions.error} onRetry={() => transactions.refetch()} />
        ) : !transactions.data ? (
          <SkeletonList count={5} h={62} />
        ) : transactions.data.results.length === 0 ? (
          <Empty
            icon={<Icon3D name="receipt" size={52} />}
            title="هنوز تراکنشی نداری"
            text="بعد از اولین شارژ یا خرید، این‌جا نمایش داده می‌شود."
          />
        ) : (
          <TransactionList items={transactions.data.results} />
        )}
      </section>

      <Sheet open={open} onClose={close} title="شارژ کیف پول">
        <TopupForm initial={suggested} />
      </Sheet>
    </Screen>
  );
}

function TransactionList({ items }: { items: WalletTransaction[] }) {
  const groups = new Map<string, WalletTransaction[]>();
  for (const tx of items) {
    const key = date(tx.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), tx]);
  }
  return (
    <div className="stack" style={{ '--gap': '16px' } as CSSProperties}>
      {[...groups].map(([day, list]) => (
        <div key={day}>
          <div className="tx-day">{day}</div>
          <div className="list">
            {list.map(tx => {
              const kind = KIND[tx.kind] ?? { label: tx.kind, icon: ArrowUpRight };
              const positive = tx.amount > 0;
              const Icon = positive ? kind.icon : ArrowUpRight;
              return (
                <div key={tx.id} className="list-row">
                  <span className={`list-row__icon tx-icon ${positive ? 'is-in' : 'is-out'}`}>
                    <Icon size={18} />
                  </span>
                  <div className="list-row__body">
                    <div className="list-row__title">{tx.description || kind.label}</div>
                    <div className="list-row__sub">
                      {timeAgo(tx.createdAt)} · مانده {compactToman(tx.balanceAfter)}
                    </div>
                  </div>
                  <span className={`tx-amount num ltr ${positive ? 'is-in' : 'is-out'}`}>
                    {positive ? '+' : '−'}
                    {num(Math.abs(tx.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopupForm({ initial }: { initial: number | null }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(initial ?? 200_000);
  const valid = amount >= MIN && amount <= MAX;

  const topup = useMutation({
    mutationFn: () => walletApi.topup(amount),
    onSuccess: ({ paymentId, paymentUrl }) => {
      openExternal(paymentUrl);
      navigate(`/payments/${paymentId}`);
    },
    onError: error => toast.error(errorText(error)),
  });

  return (
    <div className="stack" style={{ '--gap': '16px' } as CSSProperties}>
      <div className="topup-amount">
        <input
          className="num"
          inputMode="numeric"
          value={amount ? num(amount) : ''}
          onChange={e => setAmount(Number(toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 9) || 0))}
          aria-label="مبلغ شارژ به تومان"
        />
        <span>تومان</span>
      </div>
      <div className="topup-presets">
        {PRESETS.map(value => (
          <button
            key={value}
            className="chip"
            aria-pressed={amount === value}
            onClick={() => {
              haptic.select();
              setAmount(value);
            }}
          >
            {compactToman(value)}
          </button>
        ))}
      </div>
      {!valid && amount > 0 && (
        <p className="field__error">
          مبلغ باید بین {toman(MIN)} و {toman(MAX)} باشد.
        </p>
      )}
      <Button size="lg" block disabled={!valid} loading={topup.isPending} onClick={() => topup.mutate()}>
        پرداخت {valid ? toman(amount) : ''}
      </Button>
      <p className="text-xs muted" style={{ textAlign: 'center' }}>
        درگاه بانکی در مرورگر باز می‌شود و پس از پرداخت به تایتان برمی‌گردی.
      </p>
    </div>
  );
}
