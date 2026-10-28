import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CreditCard, Gamepad2, Lock, Plus, Wallet } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router';

import { errorText } from '@/api/client';
import { gameAccountsApi, ordersApi } from '@/api/endpoints';
import type { PaymentMethod } from '@/api/types';
import { faDigits, toman } from '@/lib/format';
import { keys, useCart, useWallet } from '@/lib/queries';
import { haptic, openExternal } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Empty } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import { GameAccountForm } from '../me/GameAccountForm';
import './checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cart = useCart();
  const wallet = useWallet();
  const accounts = useQuery({ queryKey: ['game-accounts'], queryFn: gameAccountsApi.list, enabled: Boolean(cart.data?.requiresGameAccount) });

  const [method, setMethod] = useState<PaymentMethod>('gateway');
  const [account, setAccount] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const total = cart.data?.total ?? 0;
  const balance = wallet.data?.balance ?? 0;
  const walletEnough = balance >= total;

  // Prefer the wallet when it covers the order, and preselect the newest game account.
  useEffect(() => {
    if (wallet.data && cart.data && walletEnough) setMethod('wallet');
  }, [wallet.data, cart.data, walletEnough]);
  useEffect(() => {
    if (account === null && accounts.data?.length) setAccount(accounts.data[0].id);
  }, [accounts.data, account]);

  const pay = useMutation({
    mutationFn: () => ordersApi.checkout(method, cart.data?.requiresGameAccount ? account : null),
    onSuccess: ({ order, paymentUrl }) => {
      void queryClient.invalidateQueries({ queryKey: keys.cart });
      void queryClient.invalidateQueries({ queryKey: keys.wallet });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (paymentUrl) {
        openExternal(paymentUrl);
        navigate(`/orders/${order.number}?pay=1`, { replace: true });
      } else {
        haptic.success();
        navigate(`/orders/${order.number}?new=1`, { replace: true });
      }
    },
    onError: error => toast.error(errorText(error)),
  });

  if (cart.data && cart.data.items.length === 0 && !pay.isSuccess)
    return (
      <Screen title="تسویه حساب" fallback="/cart" noTabs>
        <Empty icon={<CircleCheck size={36} />} title="سبد خرید خالی است" action={<Link to="/store" className="btn btn--primary btn--sm">فروشگاه</Link>} />
      </Screen>
    );

  const needsAccount = Boolean(cart.data?.requiresGameAccount);
  const ready = cart.data && (!needsAccount || account !== null) && (method === 'gateway' || walletEnough);

  return (
    <Screen title="تسویه حساب" fallback="/cart" noTabs>
      {!cart.data ? (
        <SkeletonList count={3} h={90} />
      ) : (
        <div className="stack" style={{ '--gap': '22px' } as CSSProperties}>
          <section>
            <h2 className="pd__label">سفارش شما</h2>
            <div className="list">
              {cart.data.items.map(item => (
                <div key={item.id} className="list-row">
                  <Img src={item.product.image} alt="" contain style={{ width: 44, height: 44, borderRadius: 12 }} />
                  <div className="list-row__body">
                    <div className="list-row__title">{item.product.title}</div>
                    <div className="list-row__sub">
                      {item.variant?.label ? `${item.variant.label} · ` : ''}
                      {faDigits(item.quantity)} عدد
                    </div>
                  </div>
                  <span className="num text-sm" style={{ fontWeight: 800 }}>
                    {toman(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {needsAccount && (
            <section>
              <div className="section-head">
                <h2 className="pd__label" style={{ margin: 0 }}>
                  <Gamepad2 size={18} style={{ display: 'inline', verticalAlign: -3 }} /> اکانت بازی برای تحویل
                </h2>
                <button className="section-link" onClick={() => setAdding(true)}>
                  <Plus size={16} /> اکانت جدید
                </button>
              </div>
              {!accounts.data ? (
                <SkeletonList count={1} h={64} />
              ) : accounts.data.length === 0 ? (
                <button className="pick pick--empty" onClick={() => setAdding(true)}>
                  <Plus size={20} /> اکانت بازی‌ات را اضافه کن تا سفارش روی آن شارژ شود
                </button>
              ) : (
                <div className="stack" role="radiogroup" style={{ '--gap': '8px' } as CSSProperties}>
                  {accounts.data.map(a => (
                    <button
                      key={a.id}
                      role="radio"
                      aria-checked={account === a.id}
                      className="pick"
                      onClick={() => {
                        haptic.select();
                        setAccount(a.id);
                      }}
                    >
                      <span className="pick__radio" />
                      <span className="pick__body">
                        <strong>{a.title}</strong>
                        <span className="ltr">{a.username}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="pd__label">روش پرداخت</h2>
            <div className="stack" role="radiogroup" style={{ '--gap': '8px' } as CSSProperties}>
              <button
                role="radio"
                aria-checked={method === 'wallet'}
                className="pick"
                disabled={!wallet.data}
                onClick={() => {
                  haptic.select();
                  setMethod('wallet');
                }}
              >
                <span className="pick__radio" />
                <span className="pick__icon pick__icon--cream">
                  <Wallet size={20} />
                </span>
                <span className="pick__body">
                  <strong>کیف پول تایتان</strong>
                  <span className="num">موجودی: {wallet.data ? toman(balance) : '…'}</span>
                </span>
                {wallet.data && !walletEnough && <span className="badge badge--amber">ناکافی</span>}
              </button>
              <button
                role="radio"
                aria-checked={method === 'gateway'}
                className="pick"
                onClick={() => {
                  haptic.select();
                  setMethod('gateway');
                }}
              >
                <span className="pick__radio" />
                <span className="pick__icon">
                  <CreditCard size={20} />
                </span>
                <span className="pick__body">
                  <strong>درگاه بانکی</strong>
                  <span>پرداخت با همه‌ی کارت‌های عضو شتاب</span>
                </span>
              </button>
            </div>
            {method === 'wallet' && wallet.data && !walletEnough && (
              <Link to={`/wallet?topup=${total - balance}`} className="pick-note">
                {toman(total - balance)} کم داری؛ <u>کیف پولت را شارژ کن</u>
              </Link>
            )}
            {method === 'gateway' && (
              <p className="pick-note muted">
                <Lock size={14} /> درگاه در مرورگر باز می‌شود و بعد از پرداخت به همین‌جا برمی‌گردی.
              </p>
            )}
          </section>

          <div className="summary card card--pad">
            <div>
              <span>جمع کل</span>
              <span className="num">{toman(cart.data.subtotal)}</span>
            </div>
            {cart.data.discount > 0 && (
              <div className="summary__discount">
                <span>تخفیف</span>
                <span className="num">− {toman(cart.data.discount)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="action-bar">
        <div className="action-bar__total">
          <small>قابل پرداخت</small>
          <strong className="num">{toman(total)}</strong>
        </div>
        <div className="spacer" />
        <Button size="lg" disabled={!ready} loading={pay.isPending} onClick={() => pay.mutate()} icon={<Lock size={18} />}>
          پرداخت
        </Button>
      </div>

      <Sheet open={adding} onClose={() => setAdding(false)} title="افزودن اکانت بازی">
        <GameAccountForm
          credentialType={cart.data?.credentialTypes?.[0]}
          onSaved={saved => {
            setAccount(saved.id);
            setAdding(false);
          }}
        />
      </Sheet>
    </Screen>
  );
}
