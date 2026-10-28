import { useEffect, useRef } from 'react';

/** Calls ``onEnter`` when the returned ref's element scrolls near the viewport (infinite lists). */
export function useInView<T extends Element>(onEnter: () => void, enabled = true) {
  const ref = useRef<T>(null);
  const callback = useRef(onEnter);
  callback.current = onEnter;
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(entries => entries[0]?.isIntersecting && callback.current(), {
      rootMargin: '400px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  return ref;
}
