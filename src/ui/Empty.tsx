import type { ReactNode } from 'react';

import { ApiError, errorText } from '@/api/client';

import { Button } from './Button';
import { RotateCw, WifiOff } from 'lucide-react';

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__art">{icon}</div>
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
      icon={offline ? <WifiOff size={36} /> : <RotateCw size={36} />}
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
