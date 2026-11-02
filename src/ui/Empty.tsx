import type { ReactNode } from 'react';

import { ApiError, errorText } from '@/api/client';

import { Button } from './Button';
import { Icon3D } from './Icon3D';
import { RotateCw } from 'lucide-react';

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__stage">
        <span className="empty__glow" aria-hidden />
        <div className="empty__art">{icon}</div>
        <span className="empty__orbit empty__orbit--a" aria-hidden>
          <Icon3D name="sparkles" size={22} anim="pulse" />
        </span>
        <span className="empty__orbit empty__orbit--b" aria-hidden>
          <Icon3D name="glowing-star" size={18} anim="float" />
        </span>
      </div>
      <div className="empty__title">{title}</div>
      {text && <p className="empty__text">{text}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const offline = error instanceof ApiError && error.code === 'network_error';
  return (
    <Empty
      icon={<Icon3D name={offline ? 'hourglass-not-done' : 'high-voltage'} size={48} anim="wiggle" />}
      title={offline ? 'اتصال برقرار نشد' : 'مشکلی پیش آمد'}
      text={errorText(error)}
      action={
        onRetry && (
          <Button variant="glass" size="sm" onClick={onRetry} icon={<RotateCw size={16} />}>
            تلاش دوباره
          </Button>
        )
      }
    />
  );
}
