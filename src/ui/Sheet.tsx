import { AnimatePresence, m, useDragControls, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { haptic } from '@/lib/telegram';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** A bottom sheet: drag down, tap outside or press Escape to close. */
export function Sheet({ open, onClose, title, children, footer }: Props) {
  const titleId = useId();
  const drag = useDragControls();
  const startDrag = (event: React.PointerEvent) => drag.start(event);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) {
      haptic.tap('soft');
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="backdrop"
            className="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <m.div
            key="sheet"
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div className="sheet__grip" onPointerDown={startDrag} style={{ touchAction: 'none' }} />
            {title && (
              <div className="sheet__head" onPointerDown={startDrag} style={{ touchAction: 'none' }}>
                <h2 className="sheet__title" id={titleId}>
                  {title}
                </h2>
                <button className="icon-btn" onClick={onClose} aria-label="بستن">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="sheet__body">{children}</div>
            {footer && <div className="sheet__foot">{footer}</div>}
          </m.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
