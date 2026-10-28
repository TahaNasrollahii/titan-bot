import { useInfiniteQuery } from '@tanstack/react-query';

import { catalogApi, type ProductQuery } from '@/api/endpoints';
import { ProductCard } from '@/ui/cards';
import { Icon3D } from '@/ui/Icon3D';
import { Empty, ErrorState } from '@/ui/Empty';
import { Skeleton } from '@/ui/Skeleton';
import { useInView } from '@/ui/useInView';

/** Paged product grid that loads the next page as the user nears the end. */
export function ProductGrid({ query }: { query: Omit<ProductQuery, 'page'> }) {
  const products = useInfiniteQuery({
    queryKey: ['products', 'grid', query],
    queryFn: ({ pageParam }) => catalogApi.products({ ...query, page: pageParam, page_size: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.next ? pages.length + 1 : undefined),
  });
  const sentinel = useInView<HTMLDivElement>(() => {
    if (products.hasNextPage && !products.isFetchingNextPage) void products.fetchNextPage();
  }, products.hasNextPage);

  if (products.isError) return <ErrorState error={products.error} onRetry={() => products.refetch()} />;
  if (!products.data)
    return (
      <div className="product-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} h={250} r={22} />
        ))}
      </div>
    );

  const items = products.data.pages.flatMap(page => page.results);
  if (!items.length) return <Empty icon={<Icon3D name="magnifying-glass-tilted-left" size={52} />} title="محصولی پیدا نشد" text="فیلتر دیگری را امتحان کنید." />;

  return (
    <>
      <div className="product-grid">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        {products.isFetchingNextPage && [0, 1].map(i => <Skeleton key={`more${i}`} h={250} r={22} />)}
      </div>
      <div ref={sentinel} style={{ height: 1 }} />
    </>
  );
}
