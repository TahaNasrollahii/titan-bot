import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Link, useNavigate } from 'react-router';

import { errorText } from '@/api/client';
import { cartApi } from '@/api/endpoints';
import type { Cart as CartType, CartItem } from '@/api/types';
import { faDigits, num, toman } from '@/lib/format';
import { keys, useCart } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import './checkout.css';

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const change = useMutation({
    mutationFn: ({ item, quantity }: { item: CartItem; quantity: number }) =>
      quantity > 0 ? cartApi.update(item.id, quantity) : cartApi.remove(item.id),
    onMutate: () => haptic.select(),
    onSuccess: data => queryClient.setQueryData<CartType>(keys.cart, data),
    onError: error => toast.error(errorText(error)),
  });

  return (
    <Screen title="سبد خرید" back={false}>
      {cart.isError ? (
        <ErrorState error={cart.error} onRetry={() => cart.refetch()} />
      ) : !cart.data ? (
        <SkeletonList count={3} h={96} />
      ) : cart.data.items.length === 0 ? (
        <Empty
          icon={<ShoppingCart size={36} />}
          title="سبد خرید خالی است"
          text="آیتم‌ها و ارز بازی‌ها را از فروشگاه اضافه کن."
          action={
            <Link to="/store" className="btn btn--primary btn--sm">
              رفتن به فروشگاه
            </Link>
          }
        />
      ) : (
        <>
          <div className="stack">
            <AnimatePresence initial={false}>
              {cart.data.items.map(item => (
                <m.article
                  key={item.id}
                  className="cart-item"
                  layout
                  exit={{ opacity: 0, x: 60, height: 0, marginTop: 0, padding: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                >
                  <Link to={`/product/${item.product.slug}`} className="cart-item__media">
                    <Img src={item.product.image} alt="" contain />
                  </Link>
                  <div className="cart-item__body">
                    <Link to={`/product/${item.product.slug}`} className="cart-item__title">
                      {item.product.title}
                    </Link>
                    {item.variant && <span className="badge">{item.variant.label}</span>}
                    <div className="cart-item__foot">
                      <strong className="num">
                        {num(item.lineTotal)} <small>تومان</small>
                      </strong>
                      <div className="stepper stepper--sm">
                        <button
                          aria-label="افزایش"
                          disabled={change.isPending}
                          onClick={() => change.mutate({ item, quantity: item.quantity + 1 })}
                        >
                          <Plus size={16} />
                        </button>
                        <span className="num">{faDigits(item.quantity)}</span>
                        <button
                          aria-label={item.quantity === 1 ? 'حذف' : 'کاهش'}
                          disabled={change.isPending}
                          onClick={() => change.mutate({ item, quantity: item.quantity - 1 })}
                        >
                          {item.quantity === 1 ? <Trash2 size={15} color="#ff8a80" /> : <Minus size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </m.article>
              ))}
            </AnimatePresence>
          </div>

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
            <div className="summary__total">
              <span>مبلغ قابل پرداخت</span>
              <strong className="num">{toman(cart.data.total)}</strong>
            </div>
          </div>

          <Button
            size="lg"
            block
            className="cart-cta"
            onClick={() => navigate('/checkout')}
            icon={<ArrowLeft size={20} style={{ order: 2 }} />}
          >
            ادامه‌ی خرید
          </Button>
        </>
      )}
    </Screen>
  );
}
