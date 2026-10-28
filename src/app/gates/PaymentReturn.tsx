import { CircleCheck, CircleX, Send } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { miniAppLink } from '@/lib/env';

/**
 * Shown in the phone's browser after the gateway. The verdict here is only a hint for the user; the app
 * re-reads the payment from the API once it is back in Telegram.
 */
export function PaymentReturn() {
  const [params] = useSearchParams();
  const paid = params.get('status') === 'paid';
  const paymentId = params.get('paymentId') ?? '';
  const link = miniAppLink(/^\d+$/.test(paymentId) ? `pay-${paymentId}` : undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.assign(link), 1600);
    return () => window.clearTimeout(timer);
  }, [link]);

  return (
    <div className="gate">
      <div className="empty__art" style={paid ? { color: 'var(--green)' } : undefined}>
        {paid ? <CircleCheck size={44} /> : <CircleX size={44} />}
      </div>
      <h1 className="gate__title">{paid ? 'پرداخت موفق بود' : 'پرداخت انجام نشد'}</h1>
      <p className="gate__text">در حال بازگشت به تایتان در تلگرام…</p>
      <a className="btn btn--primary btn--lg" href={link}>
        <Send size={20} />
        بازگشت به تلگرام
      </a>
    </div>
  );
}
