import { AnimatePresence, m } from 'motion/react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { haptic } from '@/lib/telegram';

type Kind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: Kind;
  text: string;
}

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

function push(kind: Kind, text: string) {
  const id = ++seq;
  items = [...items.slice(-2), { id, kind, text }];
  emit();
  if (kind === 'success') haptic.success();
  if (kind === 'error') haptic.error();
  setTimeout(() => {
    items = items.filter(t => t.id !== id);
    emit();
  }, kind === 'error' ? 4200 : 2600);
}

export const toast = {
  success: (text: string) => push('success', text),
  error: (text: string) => push('error', text),
  info: (text: string) => push('info', text),
};

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

export function Toaster() {
  const list = useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => items,
  );
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {list.map(item => {
          const Icon = ICONS[item.kind];
          return (
            <m.div
              key={item.id}
              className="toast"
              data-kind={item.kind}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            >
              <Icon size={20} />
              <span>{item.text}</span>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
