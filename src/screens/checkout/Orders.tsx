import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { ordersApi } from '@/api/endpoints';
import { date, faDigits, toman } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import { Empty, ErrorState } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { SkeletonList } from '@/ui/Skeleton';

import { ORDER_STATUS } from './orderStatus';
import './checkout.css';

export default function Orders() {
  const orders = useQuery({ queryKey: ['orders'], queryFn: ordersApi.list });
  return (
    <Screen title="سفارش‌های من" fallback="/me">
      {orders.isError ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : !orders.data ? (
        <SkeletonList count={4} h={78} />
      ) : orders.data.results.length === 0 ? (
        <Empty
          icon={<Icon3D name="package" size={52} />}
          title="هنوز سفارشی نداری"
          action={
            <Link to="/store" className="btn btn--primary btn--sm">
              شروع خرید
            </Link>
          }
        />
      ) : (
        <div className="stack">
          {orders.data.results.map(order => {
            const status = ORDER_STATUS[order.status];
            return (
              <Link key={order.number} to={`/orders/${order.number}`} className="order-row card--press" onClick={() => haptic.tap()}>
                <div className="order-row__stack">
                  {order.items.slice(0, 3).map(item => (
                    <Img key={item.id} src={item.image} alt="" contain />
                  ))}
                </div>
                <div className="list-row__body">
                  <div className="list-row__title">
                    {order.items[0]?.title}
                    {order.items.length > 1 && ` و ${faDigits(order.items.length - 1)} مورد دیگر`}
                  </div>
                  <div className="list-row__sub num">
                    <span className="ltr">{order.number}</span> · {date(order.createdAt)}
                  </div>
                  <div className="text-sm num" style={{ fontWeight: 800 }}>
                    {toman(order.total)}
                  </div>
                </div>
                <span className="badge" style={{ color: status.tone, background: `color-mix(in srgb, ${status.tone} 14%, transparent)` } as CSSProperties}>
                  {status.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
