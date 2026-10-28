import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Link } from 'react-router';

import { catalogApi } from '@/api/endpoints';
import { ProductCard } from '@/ui/cards';
import { Empty, ErrorState } from '@/ui/Empty';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';

export default function Wishlist() {
  const list = useQuery({ queryKey: ['wishlist'], queryFn: catalogApi.wishlist });
  return (
    <Screen title="علاقه‌مندی‌ها" fallback="/me">
      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : !list.data ? (
        <div className="product-grid">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} h={250} r={22} />
          ))}
        </div>
      ) : list.data.results.length === 0 ? (
        <Empty
          icon={<Heart size={36} />}
          title="هنوز چیزی نپسندیدی"
          text="روی قلب محصولات بزن تا اینجا جمع شوند."
          action={
            <Link to="/store" className="btn btn--primary btn--sm">
              رفتن به فروشگاه
            </Link>
          }
        />
      ) : (
        <div className="product-grid">
          {list.data.results.map(item => (
            <ProductCard key={item.product.id} product={item.product} />
          ))}
        </div>
      )}
    </Screen>
  );
}
