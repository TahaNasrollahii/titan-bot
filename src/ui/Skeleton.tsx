import type { CSSProperties } from 'react';

export function Skeleton({ w = '100%', h = 16, r, style }: { w?: number | string; h?: number | string; r?: number; style?: CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden />;
}

export function SkeletonList({ count = 4, h = 72 }: { count?: number; h?: number }) {
  return (
    <div className="stack" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} h={h} r={20} />
      ))}
    </div>
  );
}
