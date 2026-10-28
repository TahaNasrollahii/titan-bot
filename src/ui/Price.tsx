import { num } from '@/lib/format';

export function Price({ value, old, size }: { value: number | null; old?: number | null; size?: number }) {
  if (value === null) return <span className="muted text-sm">ناموجود</span>;
  return (
    <span className="stack" style={{ '--gap': '0px' } as React.CSSProperties}>
      {old && old > value ? <span className="price-old num">{num(old)}</span> : null}
      <span className="price num" style={size ? { fontSize: size } : undefined}>
        {value === 0 ? 'رایگان' : num(value)}
        {value !== 0 && <small>تومان</small>}
      </span>
    </span>
  );
}
